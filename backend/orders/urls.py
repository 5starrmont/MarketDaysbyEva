from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AddressViewSet, DeliveryConfigurationViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'delivery-configs', DeliveryConfigurationViewSet, basename='deliveryconfig')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]