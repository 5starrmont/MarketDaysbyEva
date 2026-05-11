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

# This helps DRF understand the incoming items array from React
class OrderItemCreateSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)

class OrderSerializer(serializers.ModelSerializer):
    # Tell DRF to expect a list of items using our special serializer above
    items = OrderItemCreateSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_phone', 'delivery_address', 
            'total_amount', 'items', 'status', 'created_at'
        ]

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
                price_at_order=item_data['price'] # Map React's 'price' to Django's 'price_at_order'
            )
            
        return order