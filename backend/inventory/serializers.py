import json
from django.db import transaction
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
            'reorder_level', # <-- THIS WAS MISSING!
            'is_low_stock', 'discount_price', 'bulk_threshold', 'bulk_price'
        ]

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'name', 'description', 
            'image', 'is_active', 'variants'
        ]

    def _clean_number(self, value, default=None):
        """Helper to safely handle empty strings from the frontend"""
        if value == '' or value is None:
            return default
        return value

    @transaction.atomic
    def create(self, validated_data):
        product = Product.objects.create(**validated_data)
        request = self.context.get('request')

        if request and 'variants' in request.data:
            try:
                variants_data = json.loads(request.data.get('variants'))
                
                for v_data in variants_data:
                    ProductVariant.objects.create(
                        product=product,
                        unit_size=v_data.get('unit_size'),
                        price=self._clean_number(v_data.get('price'), 0),
                        stock_quantity=self._clean_number(v_data.get('stock_quantity'), 0),
                        reorder_level=self._clean_number(v_data.get('reorder_level'), 10),
                        discount_price=self._clean_number(v_data.get('discount_price')),
                        bulk_threshold=self._clean_number(v_data.get('bulk_threshold')),
                        bulk_price=self._clean_number(v_data.get('bulk_price')),
                    )
            except json.JSONDecodeError:
                pass 

        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        request = self.context.get('request')
        if request and 'variants' in request.data:
            try:
                variants_data = json.loads(request.data.get('variants'))
                
                instance.variants.all().delete()
                
                for v_data in variants_data:
                    ProductVariant.objects.create(
                        product=instance,
                        unit_size=v_data.get('unit_size'),
                        price=self._clean_number(v_data.get('price'), 0),
                        stock_quantity=self._clean_number(v_data.get('stock_quantity'), 0),
                        reorder_level=self._clean_number(v_data.get('reorder_level'), 10),
                        discount_price=self._clean_number(v_data.get('discount_price')),
                        bulk_threshold=self._clean_number(v_data.get('bulk_threshold')),
                        bulk_price=self._clean_number(v_data.get('bulk_price')),
                    )
            except json.JSONDecodeError:
                pass

        return instance