import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // State to track which order card is expanded
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const token = localStorage.getItem('access');
          const response = await axios.get('http://127.0.0.1:8000/api/orders/orders/', {
            headers: { Authorization: `JWT ${token}` }
          });
          // Sort orders by newest first
          const sortedOrders = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setOrders(sortedOrders);
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  const handleLogout = () => {
    logout(clearCart);
    navigate('/login');
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Helper function to check if order is within 10 minutes
  const isWithinTenMinutes = (createdAt) => {
    const orderTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const differenceInMinutes = (currentTime - orderTime) / (1000 * 60);
    return differenceInMinutes <= 10;
  };

  // Function to handle order cancellation
  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation(); // Prevents the card from collapsing when clicking the button
    
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const token = localStorage.getItem('access');
      // Sending a PATCH request to update just the status
      await axios.patch(`http://127.0.0.1:8000/api/orders/orders/${orderId}/`, 
        { status: 'Cancelled' },
        { headers: { Authorization: `JWT ${token}` } }
      );
      
      // Update the UI immediately without refreshing
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      ));
      
      alert("Order cancelled successfully.");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Could not cancel order. It may have already been processed.");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Please log in to view your profile.</p>
        <button onClick={() => navigate('/login')} className="text-brand-brown font-bold underline">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-32 bg-brand-green relative">
          <div className="absolute -bottom-12 left-10 h-24 w-24 bg-brand-brown rounded-2xl border-4 border-white flex items-center justify-center text-brand-cream text-4xl font-black shadow-lg">
            {user.username[0].toUpperCase()}
          </div>
        </div>

        <div className="pt-16 pb-8 px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.username}</h1>
              <p className="text-gray-500 font-medium">{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>

          <hr className="my-8 border-gray-100" />

          <div className="grid md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</label>
              <p className="text-lg font-bold text-brand-green flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></span>
                Active Member
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders Placed</label>
              <p className="text-lg font-bold text-gray-800">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ORDER HISTORY SECTION */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
          Order History
          {!loadingOrders && (
            <span className="bg-brand-brown text-white text-xs px-2.5 py-0.5 rounded-full shadow-sm">
              {orders.length}
            </span>
          )}
        </h2>

        {loadingOrders ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white h-24 rounded-2xl border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPending = !order.status || order.status.toLowerCase() === 'pending';
              const canCancel = isPending && isWithinTenMinutes(order.created_at);
              const isExpanded = expandedOrderId === order.id;

              return (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-2xl shadow-sm border transition-all overflow-hidden ${isExpanded ? 'border-brand-green shadow-md' : 'border-gray-100 hover:border-brand-green/30'}`}
                >
                  {/* Clickable Header */}
                  <div 
                    onClick={() => toggleExpand(order.id)}
                    className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          {/* Caret icon changes direction based on expand state */}
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Order #{order.id}
                        </p>
                        <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700' // Pending color
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">KES {parseFloat(order.total_amount).toLocaleString()}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        <span className="font-medium text-gray-700">Delivered to: </span> 
                        {order.delivery_address.split('|')[0]}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end w-full md:w-auto border-t border-gray-100 md:border-none pt-4 md:pt-0">
                      <p className="text-sm font-bold text-gray-800">
                        {new Date(order.created_at).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.created_at).toLocaleTimeString('en-KE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Details Section */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-6">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Items in this order</h4>
                      
                      <div className="space-y-3 mb-6">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                              <div>
                                <p className="text-sm font-bold text-gray-900">
                                  {item.product_name || `Product ID: ${item.product_id}`} {/* Fallback if Django doesn't send the name */}
                                </p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900">
                                KES {parseFloat(item.price).toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">Item details unavailable.</p>
                        )}
                      </div>

                      {/* Cancel Order Action */}
                      <div className="flex justify-end border-t border-gray-200 pt-4">
                        {canCancel ? (
                          <button 
                            onClick={(e) => handleCancelOrder(e, order.id)}
                            className="bg-red-600 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-sm"
                          >
                            Cancel Order
                          </button>
                        ) : isPending ? (
                          <p className="text-xs text-gray-500 italic">
                            Order can no longer be cancelled (10 min window passed).
                          </p>
                        ) : null}
                      </div>
                      
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <div className="h-16 w-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Looks like you haven't placed any orders yet. Start shopping to fill this space!</p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-brand-green text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-opacity-90 transition-colors shadow-md"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>

    </div>
  );
}