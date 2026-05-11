from rest_framework import serializers
from .models import Category, Product, ProductVariant

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'unit_size', 'price', 'stock_quantity', 
            'is_low_stock', 'discount_price', 'bulk_threshold', 'bulk_price'
        ]

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'category', 'name', 'description', 'image', 'is_active', 'variants']