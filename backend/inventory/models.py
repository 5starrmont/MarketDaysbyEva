# backend/inventory/models.py
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='products/%Y/%m/%d/')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    unit_size = models.CharField(max_length=50)  # e.g., "500g", "1kg"
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=5)
    
    # Discounts & Bulk Pricing
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    bulk_threshold = models.PositiveIntegerField(null=True, blank=True) # e.g., Buy "3"
    bulk_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.product.name} - {self.unit_size}"

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.reorder_level