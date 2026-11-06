from rest_framework import serializers
from django.contrib.auth.models import User
from djoser.serializers import UserSerializer as BaseUserSerializer
from .models import Address, DeliveryConfiguration, Order, OrderItem, Payment

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'address_type', 'location_name', 'latitude', 'longitude']

class DeliveryConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryConfiguration
        fields = [
            'id', 'name', 'tier_1_max_km', 'tier_1_fee', 
            'tier_2_max_km', 'tier_2_fee', 'tier_3_max_km', 
            'tier_3_fee', 'tier_4_fee'
        ]

# ─── NEW: PAYMENT SERIALIZER ───
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

# This helps DRF understand the incoming items array from React when placing an order
class OrderItemCreateSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    # Accept the applied offer from React's checkout payload
    applied_offer = serializers.CharField(max_length=50, required=False, allow_null=True, allow_blank=True)

class OrderSerializer(serializers.ModelSerializer):
    # This remains write_only so it handles the incoming checkout payload properly
    items = OrderItemCreateSerializer(many=True, write_only=True)
    
    # Expose the linked payment record when fetching orders
    payment = PaymentSerializer(read_only=True)

    # ─── ADDED: M-PESA RECEIPT CODE ───
    transaction_reference = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_phone', 'delivery_address', 
            'total_amount', 'delivery_fee', 'items', 'status', 'payment', 
            'created_at', 'transaction_reference' # Added to fields
        ]

    # Fetches the receipt code from the attached payment ledger
    def get_transaction_reference(self, obj):
        if hasattr(obj, 'payment') and obj.payment and obj.payment.status == 'Completed':
            return obj.payment.transaction_reference
        return None

    def create(self, validated_data):
        # 1. Pop the items array out of the main data
        items_data = validated_data.pop('items', [])
        
        # 2. Create the main Order record
        order = Order.objects.create(**validated_data)
        
        # 3. Loop through the cart items and save them to the database
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                variant_id=item_data['variant_id'],
                quantity=item_data['quantity'],
                price_at_order=item_data['price'],
                applied_offer=item_data.get('applied_offer') # Save the offer to the DB
            )
            
        return order

    # Intercept the outgoing data and inject the formatted items 
    # so React can display them in the Profile dashboard
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Format the related OrderItems into a clean dictionary for React
        representation['items'] = [
            {
                'product_name': str(item.variant) if item.variant else "Unknown Item",
                'quantity': item.quantity,
                'price': item.price_at_order,
                'applied_offer': item.applied_offer 
            }
            for item in instance.items.all()
        ]
        
        return representation

# ─── CUSTOM USER SERIALIZER FOR DJOSER ───
class CustomUserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = User
        # Tell Djoser to include the staff and superuser flags
        fields = ('id', 'username', 'email', 'is_staff', 'is_superuser')