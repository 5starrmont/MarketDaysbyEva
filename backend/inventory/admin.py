from django.contrib import admin
from .models import Category, Product, ProductVariant

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1  # Shows one empty row for variants by default

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active', 'created_at')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')
    inlines = [ProductVariantInline]