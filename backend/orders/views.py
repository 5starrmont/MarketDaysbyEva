from rest_framework import viewsets, permissions
from .models import Address, DeliveryConfiguration, Order
from .serializers import AddressSerializer, DeliveryConfigurationSerializer, OrderSerializer

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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only show the user their own orders
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # When creating a new order, tie it to the user making the request
        serializer.save(user=self.request.user)