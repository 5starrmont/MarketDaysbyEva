from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AddressViewSet, DeliveryConfigurationViewSet, OrderViewSet, mpesa_callback

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'delivery-configs', DeliveryConfigurationViewSet, basename='deliveryconfig')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    # Safaricom Webhook - Must come before the router includes!
    path('mpesa/callback/', mpesa_callback, name='mpesa_callback'),
    
    path('', include(router.urls)),
]