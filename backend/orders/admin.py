from django.contrib import admin
from .models import Address, DeliveryConfiguration, Order, OrderItem

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'location_name', 'address_type')
    list_filter = ('address_type',)
    search_fields = ('user__username', 'location_name')

@admin.register(DeliveryConfiguration)
class DeliveryConfigurationAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'tier_1_fee', 'tier_2_fee', 'tier_3_fee', 'tier_4_fee')
    list_filter = ('is_active',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0  # Don't show empty rows by default for existing orders
    readonly_fields = ('price_at_order',) # Protects past receipts from accidental edits

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'id')
    inlines = [OrderItemInline]