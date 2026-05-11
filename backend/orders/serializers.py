from rest_framework import serializers
from .models import Address, DeliveryConfiguration, Order, OrderItem

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'address_type', 'location_name', 'latitude', 'longitude']
        # The user is automatically assigned from the logged-in session, 
        # so the frontend doesn't need to send it.

class DeliveryConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryConfiguration
        fields = [
            'id', 'name', 'tier_1_max_km', 'tier_1_fee', 
            'tier_2_max_km', 'tier_2_fee', 'tier_3_max_km', 
            'tier_3_fee', 'tier_4_fee'
        ]

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'variant', 'quantity', 'price_at_order']
        read_only_fields = ['price_at_order'] # Prevent frontend from making up their own prices

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'address', 'status', 'delivery_fee', 
            'total_amount', 'created_at', 'items'
        ]
        read_only_fields = ['status', 'delivery_fee', 'total_amount'] 
        # These are calculated and managed by the backend, not the user