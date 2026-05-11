import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <-- Added Link import
import axios from 'axios';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from your Django API
    axios.get('http://127.0.0.1:8000/api/inventory/products/')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-xl font-medium text-brand-green">Loading products...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-brand-green mb-6">Shop</h2>
      
      {products.length === 0 ? (
        <div className="text-gray-600">No products found. (Make sure your Django server is running and products are marked "active"!)</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
              
              {/* Product Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="object-cover h-full w-full" />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
              
              {/* Product Details */}
              <div className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-brand-brown font-bold tracking-wider uppercase mb-1">
                  {product.category?.name || 'Uncategorized'}
                </p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{product.description}</p>
                
                {/* Price & Action */}
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                  <span className="font-bold text-brand-green">
                    {product.variants && product.variants.length > 0 
                      ? `From KES ${product.variants[0].price}` 
                      : 'Out of stock'}
                  </span>
                  
                  {/* <-- This is the updated button turned into a Link --> */}
                  <Link 
                    to={`/products/${product.id}`}
                    className="bg-brand-green text-brand-cream px-4 py-2 rounded font-medium hover:bg-opacity-90 transition-all text-center"
                  >
                    View
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}