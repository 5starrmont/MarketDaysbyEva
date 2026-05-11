import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1); 
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart(); 
  const [added, setAdded] = useState(false); 

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/inventory/products/${id}/`)
      .then(response => {
        setProduct(response.data);
        if (response.data.variants && response.data.variants.length > 0) {
          setSelectedVariant(response.data.variants[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching product details:", error);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    const finalQuantity = parseFloat(quantity);
    if (product && selectedVariant && !isNaN(finalQuantity) && finalQuantity > 0) {
      addToCart(product, selectedVariant, finalQuantity); 
      setAdded(true); 
      setTimeout(() => setAdded(false), 2000); 
    }
  };

  // Step by 0.5 for decimals
  const incrementQuantity = () => setQuantity(prev => Number(prev) + 0.5);
  const decrementQuantity = () => setQuantity(prev => (Number(prev) > 0.5 ? Number(prev) - 0.5 : 0.5));

  if (loading) {
    return <div className="text-center py-10 text-xl font-medium text-brand-green">Loading details...</div>;
  }

  if (!product) {
    return <div className="text-center py-10 text-xl text-red-500">Product not found.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col md:flex-row">
      
      {/* Left Side: Product Image */}
      <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8">
        {product.image ? (
          <img src={product.image} alt={product.name} className="object-contain max-h-96 rounded" />
        ) : (
          <span className="text-gray-400">No Image Available</span>
        )}
      </div>

      {/* Right Side: Details & Purchasing */}
      <div className="md:w-1/2 p-8 flex flex-col">
        <Link to="/products" className="text-sm text-brand-brown hover:underline mb-4 inline-block">
          &larr; Back to Shop
        </Link>
        
        <p className="text-sm text-gray-500 font-bold tracking-wider uppercase mb-1">
          {product.category?.name || 'Uncategorized'}
        </p>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h2>
        <p className="text-gray-600 mb-8">{product.description}</p>

        {/* Unit Price Display (No longer a selection) */}
        {selectedVariant ? (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">Unit Price</h3>
            <p className="text-xl text-gray-800 font-medium">
              KES {selectedVariant.price} <span className="text-sm text-gray-500 ml-1">per {selectedVariant.unit_size}</span>
            </p>
          </div>
        ) : (
          <p className="text-red-500 mb-6">Currently out of stock.</p>
        )}

        {/* Quantity Selection */}
        {selectedVariant && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Quantity</h3>
            <div className="flex items-center border border-gray-300 rounded-md w-max">
              <button onClick={decrementQuantity} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-l-md transition-colors">-</button>
              
              {/* Changed to an actual input field to allow custom typing */}
              <input 
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onBlur={() => {
                  const val = parseFloat(quantity);
                  if (isNaN(val) || val <= 0) setQuantity(1);
                  else setQuantity(val);
                }}
                className="w-16 text-center font-medium text-gray-900 border-x border-gray-300 py-2 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button onClick={incrementQuantity} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-r-md transition-colors">+</button>
            </div>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="mt-auto pt-6 border-t border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1 font-bold tracking-wide uppercase">Total Price</div>
            <div className="text-3xl font-bold text-brand-green">
              {/* Safely calculates the total even if the user is typing a decimal */}
              {selectedVariant ? `KES ${(selectedVariant.price * (parseFloat(quantity) || 0)).toLocaleString()}` : '---'}
            </div>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={!selectedVariant || parseFloat(quantity) <= 0 || isNaN(parseFloat(quantity))}
            className={`${added ? 'bg-green-600' : 'bg-brand-brown'} text-brand-cream px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]`}
          >
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>

    </div>
  );
}