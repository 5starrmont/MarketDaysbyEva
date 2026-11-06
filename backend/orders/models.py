from django.db import models
from django.contrib.auth.models import User
from inventory.models import ProductVariant

class Address(models.Model):
    user = models.ForeignKey(User, related_name='addresses', on_delete=models.CASCADE)
    
    # Removed choices. Now users can type custom labels like "Mom's House"
    address_type = models.CharField(max_length=100, default='My Address')
    
    location_name = models.CharField(max_length=255) 
    
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Addresses"

    def __str__(self):
        return f"{self.user.username} - {self.location_name} ({self.address_type})"


class DeliveryConfiguration(models.Model):
    name = models.CharField(max_length=100, default="Standard Delivery Rates")
    tier_1_max_km = models.DecimalField(max_digits=5, decimal_places=2, default=5.0)
    tier_1_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    tier_2_max_km = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    tier_2_fee = models.DecimalField(max_digits=10, decimal_places=2, default=200.0)
    
    tier_3_max_km = models.DecimalField(max_digits=5, decimal_places=2, default=15.0)
    tier_3_fee = models.DecimalField(max_digits=10, decimal_places=2, default=250.0)
    
    tier_4_fee = models.DecimalField(max_digits=10, decimal_places=2, default=400.0) 
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Processing', 'Processing'),        # <--- ADDED FAST-TRACK STATUS
        ('Ready for Packing', 'Ready for Packing'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),          # <--- ADDED FRONTEND SUCCESS STATUS
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )
    
    # Made optional for guest checkouts
    user = models.ForeignKey(User, related_name='orders', on_delete=models.CASCADE, null=True, blank=True)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Added to capture guest checkout form data directly
    customer_name = models.CharField(max_length=255, null=True, blank=True)
    customer_phone = models.CharField(max_length=50, null=True, blank=True)
    delivery_address = models.TextField(null=True, blank=True)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # Gracefully handle the name whether it's a logged in user or a guest
        buyer = self.user.username if self.user else self.customer_name or "Guest"
        return f"Order #{self.id} - {buyer} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True)
    
    # Upgraded to DecimalField to support weights (e.g., 1.5kg) instead of just Integers
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    
    price_at_order = models.DecimalField(max_digits=10, decimal_places=2) 
    
    # To track if a discount or bulk offer was used at the time of purchase
    applied_offer = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.quantity}x {self.variant} (Order #{self.order.id})"


class Payment(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
        ('Cancelled', 'Cancelled'),
    )
    
    METHOD_CHOICES = (
        ('M-Pesa', 'M-Pesa'),
        ('Airtel Money', 'Airtel Money'),
        ('Card', 'Credit/Debit Card'),
        ('Crypto', 'Cryptocurrency'),
    )
    
    order = models.OneToOneField(Order, related_name='payment', on_delete=models.CASCADE)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='M-Pesa')
    
    # Generic reference fields that can handle M-Pesa codes, Stripe IDs, or Crypto Hashes
    transaction_reference = models.CharField(max_length=100, blank=True, null=True, unique=True) 
    gateway_request_id = models.CharField(max_length=100, blank=True, null=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=20, blank=True, null=True) # Useful for mobile money
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payment_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id} via {self.payment_method} - {self.status}"