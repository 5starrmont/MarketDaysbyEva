import uuid
import logging
from django.utils import timezone         # <-- NEW IMPORT
from datetime import timedelta            # <-- NEW IMPORT
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Address, DeliveryConfiguration, Order, Payment
from .serializers import AddressSerializer, DeliveryConfigurationSerializer, OrderSerializer
from .payment_gateway import generate_checkout_link

logger = logging.getLogger(__name__)

class AddressViewSet(viewsets.ModelViewSet):
    """
    API endpoint for customers to manage their saved addresses.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated] # User must be logged in

    def get_queryset(self):
        # Only return addresses that belong to the logged-in user
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # When saving a new address, automatically attach it to the logged-in user
        serializer.save(user=self.request.user)

class DeliveryConfigurationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for the frontend to read the current delivery fee tiers.
    Anyone can view this, login not required.
    """
    queryset = DeliveryConfiguration.objects.filter(is_active=True)
    serializer_class = DeliveryConfigurationSerializer

class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for customers to view their past orders and create new ones.
    """
    serializer_class = OrderSerializer
    # Allow anyone to hit this endpoint so Guest Checkouts work!
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # ─── NEW: AUTOMATED 10-MINUTE GRADUATION LOGIC ───
        # Automatically move any 'Paid' order older than 10 mins to 'Ready for Packing'
        ten_mins_ago = timezone.now() - timedelta(minutes=10)
        Order.objects.filter(status='Paid', created_at__lte=ten_mins_ago).update(status='Ready for Packing')
        # ─────────────────────────────────────────────────

        if self.request.user.is_authenticated:
            # ─── THE FIX: IF THE USER IS A MANAGER, SHOW EVERYTHING ───
            if self.request.user.is_staff or self.request.user.is_superuser:
                return Order.objects.all().order_by('-created_at')
            
            # Otherwise, just show the normal customer their own orders
            return Order.objects.filter(user=self.request.user).order_by('-created_at')
        
        return Order.objects.none()

    def perform_create(self, serializer):
        # If the user is logged in, attach their account to the order.
        # If they are not logged in, just save it as an anonymous guest order.
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    # ─── UNIFIED PAYMENT PROCESSING ENDPOINT ───
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def process_payment(self, request, pk=None):
        """
        Endpoint: POST /api/orders/{id}/process_payment/
        """
        order = self.get_object()
        payment_method = request.data.get('payment_method', 'Card')
        phone_number = request.data.get('phone_number', order.customer_phone)

        # Prevent double billing
        if hasattr(order, 'payment') and order.payment.status == 'Completed':
            return Response({"error": "This order has already been paid for."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Create or get the tracking ledger for this transaction
        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                'payment_method': payment_method,
                'amount': order.total_amount,
                'phone_number': phone_number,
                'status': 'Pending',
                'transaction_reference': f"TXN-{uuid.uuid4().hex[:10].upper()}" # Generate a unique tracking ID
            }
        )

        # If it already existed but failed previously, reset it for a retry
        if not created and payment.status in ['Failed', 'Cancelled']:
            payment.status = 'Pending'
            payment.payment_method = payment_method
            payment.phone_number = phone_number
            payment.save()

        # Extract customer email if they are logged in
        customer_email = order.user.email if order.user else None
        customer_name = order.customer_name

        # 2. Call the Unified Gateway (now routing to Daraja)
        gateway_response = generate_checkout_link(order, payment, customer_name, customer_email, phone_number)

        if gateway_response['status'] == 'success':
            # Tell React to redirect the user to the profile page to wait for the STK push
            return Response({
                "status": "success",
                "action": "redirect",
                "checkout_url": gateway_response['checkout_url'],
                "transaction_reference": payment.transaction_reference
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": gateway_response['message']}, status=status.HTTP_400_BAD_REQUEST)


# ─── DARAJA M-PESA WEBHOOK LISTENER ───
@api_view(['POST'])
@permission_classes([permissions.AllowAny]) 
def mpesa_callback(request):
    """
    Endpoint: POST /api/orders/mpesa/callback/
    Catches the final payment receipt from Safaricom and updates the database.
    """
    callback_data = request.data
    print("\n" + "="*50)
    print("🚨 INCOMING M-PESA CALLBACK 🚨")
    print(callback_data)
    print("="*50 + "\n")
    
    try:
        stk_callback = callback_data.get('Body', {}).get('stkCallback', {})
        result_code = stk_callback.get('ResultCode')
        result_desc = stk_callback.get('ResultDesc', 'Transaction failed')
        
        # ResultCode 0 means the customer successfully entered their PIN and paid
        if result_code == 0:
            meta_items = stk_callback.get('CallbackMetadata', {}).get('Item', [])
            
            receipt_number = ""
            phone_number = ""
            
            # Extract the exact receipt and phone number from Safaricom's payload
            for item in meta_items:
                if item.get('Name') == 'MpesaReceiptNumber':
                    receipt_number = item.get('Value')
                elif item.get('Name') == 'PhoneNumber':
                    phone_number = str(item.get('Value'))
            
            # Find the most recent pending payment for this phone number
            # We use endswith to ignore the difference between 07XX and 2547XX
            phone_suffix = phone_number[-9:] if phone_number else ""
            
            payment = Payment.objects.filter(
                status='Pending',
                phone_number__endswith=phone_suffix
            ).order_by('-id').first()
            
            if payment:
                # Boom! Update the ledger!
                payment.status = 'Completed'
                payment.transaction_reference = receipt_number # Save the actual M-Pesa receipt
                payment.save()
                
                order = payment.order
                order.status = 'Paid'
                order.save()
                
                print(f"✅ SUCCESS: Order {order.id} marked as PAID. Receipt: {receipt_number}")
            else:
                print(f"⚠️ WARNING: Received payment {receipt_number} but couldn't find a matching pending order.")
        else:
            # ─── THE FIX: HANDLE FAILURES PROPERLY ───
            print(f"❌ M-PESA FAILED/CANCELLED: {result_desc}")
            
            # Since Daraja omits the phone number on failures, we grab the most recent pending payment
            payment = Payment.objects.filter(status='Pending').order_by('-id').first()
            
            if payment:
                payment.status = 'Failed'
                payment.save()
                
                order = payment.order
                order.status = 'Payment Failed'
                order.save()
                print(f"⚠️ Order {order.id} marked as Payment Failed due to: {result_desc}")
            
    except Exception as e:
        print("Error parsing M-Pesa callback:", str(e))
    
    # Safaricom just wants a 0 back so they know we got the message securely
    return Response({
        "ResultCode": 0, 
        "ResultDesc": "Callback Accepted"
    })