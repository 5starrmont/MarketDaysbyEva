from rest_framework import viewsets
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows categories to be viewed, created, and edited.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows products to be viewed, created, and edited.
    Supports filtering by category slug: /api/products/?category=vegetables
    """
    serializer_class = ProductSerializer

    def get_queryset(self):
        # Return all products so the Manager Dashboard can see both active and inactive inventory.
        queryset = Product.objects.all().order_by('-created_at')
        
        # Check if the frontend is filtering by a specific category
        category_slug = self.request.query_params.get('category', None)
        if category_slug is not None:
            # When buyers click a category on the storefront, it filters here
            queryset = queryset.filter(category__slug=category_slug, is_active=True)
            
        return queryset