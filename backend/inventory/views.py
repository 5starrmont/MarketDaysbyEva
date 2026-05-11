from rest_framework import viewsets
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows categories to be viewed.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows active products to be viewed.
    Supports filtering by category slug: /api/products/?category=vegetables
    """
    serializer_class = ProductSerializer

    def get_queryset(self):
        # Only show active products to customers
        queryset = Product.objects.filter(is_active=True).order_by('-created_at')
        
        # Check if the frontend is filtering by a specific category
        category_slug = self.request.query_params.get('category', None)
        if category_slug is not None:
            queryset = queryset.filter(category__slug=category_slug)
            
        return queryset