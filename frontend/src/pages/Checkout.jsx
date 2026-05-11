import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  // We added clearCart to our destructured values
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  // New states for network requests
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Package the data into a clean object for Django
    const orderPayload = {
      customer_name: formData.name,
      customer_phone: formData.phone,
      delivery_address: formData.address,
      total_amount: cartTotal,
      // Format the cart items so the database understands them
      items: cartItems.map(item => ({
        product_id: item.product.id,
        variant_id: item.variant.id,
        quantity: item.quantity,
        price: item.variant.price
      }))
    };

    try {
      // FIXED: Added the second /orders/ to match the Django Router!
      await axios.post('http://127.0.0.1:8000/api/orders/orders/', orderPayload);
      
      // If the server says OK (200/201 response):
      clearCart(); // 1. Empty their cart
      alert("Success! Your order has been placed."); // 2. Notify the user
      navigate('/'); // 3. Send them back to the home page

    } catch (error) {
      console.error("Order error:", error);
      setErrorMessage("Something went wrong processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-brand-green mb-4">Your cart is empty</h2>
        <Link to="/products" className="text-brand-brown hover:underline">Go back to shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Left Side: Delivery Form */}
      <div className="md:w-2/3 bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-brand-green mb-6">Delivery Details</h2>
        
        {/* Display network errors here if they happen */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="e.g. 0712 345 678"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Address</label>
            <textarea 
              name="address"
              required
              rows="3"
              value={formData.address}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Estate, House Number, Street..."
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-brown text-brand-cream py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all mt-4 disabled:opacity-70 disabled:cursor-wait flex justify-center items-center"
          >
            {isSubmitting ? 'Processing...' : `Place Order (KES ${cartTotal.toLocaleString()})`}
          </button>
        </form>
      </div>

      {/* Right Side: Order Summary */}
      <div className="md:w-1/3">
        <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="divide-y divide-gray-200 mb-4">
            {cartItems.map((item) => (
              <div key={`${item.product.id}-${item.variant.id}`} className="py-3 flex justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900">KES {(item.variant.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
            <span className="font-bold text-gray-700 uppercase tracking-wider text-sm">Total</span>
            <span className="text-2xl font-bold text-brand-green">KES {cartTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

    </div>
  );
}