from django.db import models
from django.contrib.auth.models import User
from inventory.models import ProductVariant

class Address(models.Model):
    ADDRESS_TYPES = (
        ('Home', 'Home'),
        ('Work', 'Work'),
        ('Other', 'Other'),
    )
    user = models.ForeignKey(User, related_name='addresses', on_delete=models.CASCADE)
    address_type = models.CharField(max_length=20, choices=ADDRESS_TYPES, default='Home')
    location_name = models.CharField(max_length=255) # e.g., "Kileleshwa, Nairobi"
    
    # Coordinates for mapping and distance calculation
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Addresses"

    def __str__(self):
        return f"{self.user.username} - {self.location_name} ({self.address_type})"

class DeliveryConfiguration(models.Model):
    """
    Handles the Tiered System from Spec 4.3:
    0–5 km → Free | 5–10 km → KES 200 | 11–15 km → KES 250 | 16–20+ km → KES 400
    """
    name = models.CharField(max_length=100, default="Standard Delivery Rates")
    tier_1_max_km = models.DecimalField(max_digits=5, decimal_places=2, default=5.0)
    tier_1_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    tier_2_max_km = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    tier_2_fee = models.DecimalField(max_digits=10, decimal_places=2, default=200.0)
    
    tier_3_max_km = models.DecimalField(max_digits=5, decimal_places=2, default=15.0)
    tier_3_fee = models.DecimalField(max_digits=10, decimal_places=2, default=250.0)
    
    tier_4_fee = models.DecimalField(max_digits=10, decimal_places=2, default=400.0) # Anything above tier 3
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Ready for Packing', 'Ready for Packing'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )
    user = models.ForeignKey(User, related_name='orders', on_delete=models.CASCADE)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - {self.status}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    
    # Crucial: We save the price AT THE TIME OF ORDER. 
    # If you change a tomato's price tomorrow, past receipts shouldn't change.
    price_at_order = models.DecimalField(max_digits=10, decimal_places=2) 

    def __str__(self):
        return f"{self.quantity}x {self.variant} (Order #{self.order.id})"