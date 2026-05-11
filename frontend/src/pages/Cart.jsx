import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, removeFromCart, cartTotal } = useCart();

  // What to show if the cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
        <h2 className="text-3xl font-bold text-brand-green mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your basket yet.</p>
        <Link to="/products" className="bg-brand-green text-brand-cream px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  // What to show if there are items in the cart
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-8">
      <h2 className="text-3xl font-bold text-brand-green mb-8">Your Cart</h2>

      <div className="divide-y divide-gray-200">
        {cartItems.map((item) => (
          <div key={`${item.product.id}-${item.variant.id}`} className="py-6 flex items-center justify-between">
            
            <div className="flex items-center gap-6">
              {/* Product Image */}
              <div className="w-24 h-24 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-md border border-gray-100">
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="object-cover h-full w-full" />
                ) : (
                  <span className="text-xs text-gray-400">No Image</span>
                )}
              </div>

              {/* Product Info */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{item.product.name}</h3>
                <p className="text-sm text-gray-500 mb-1">
                  Unit: {item.variant.unit_size} (KES {item.variant.price})
                </p>
                <p className="font-medium text-brand-green bg-green-50 inline-block px-2 py-1 rounded text-sm mt-1">
                  Qty: {item.quantity}
                </p>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900 mb-2">
                KES {(item.variant.price * item.quantity).toLocaleString()}
              </p>
              <button 
                onClick={() => removeFromCart(item.product.id, item.variant.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Remove
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt-8 pt-8 border-t border-gray-200 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 font-bold tracking-wide uppercase mb-1">Subtotal</p>
          <p className="text-4xl font-bold text-brand-green">KES {cartTotal.toLocaleString()}</p>
        </div>
        
        {/* <-- UPDATED: Changed from a button to a functional Link --> */}
        <Link 
          to="/checkout"
          className="bg-brand-brown text-brand-cream px-10 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all shadow-md inline-block"
        >
          Checkout
        </Link>
      </div>

    </div>
  );
}