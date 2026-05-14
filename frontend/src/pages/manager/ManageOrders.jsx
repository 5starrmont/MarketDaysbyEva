import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Setup Leaflet Icons
const defaultIcon = L.icon({
  iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

const SHOP_LOCATION = { lat: -1.4333, lng: 36.6833 };

/* ─── Map Helper ────────────────────────────────────────────── */
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
}

/* ─── Animation Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const STATUS_COLORS = {
  'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20',
  'Paid': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-500 dark:border-blue-500/20',
  'Ready for Packing': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-500 dark:border-purple-500/20',
  'Out for Delivery': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-500 dark:border-indigo-500/20',
  'Completed': 'bg-[#EBF5EA] text-[#2D6A27] border-[#7DC57A]/30 dark:bg-[#1A4D2E]/30 dark:text-[#7DC57A] dark:border-[#7DC57A]/20',
  'Delivered': 'bg-[#EBF5EA] text-[#2D6A27] border-[#7DC57A]/30 dark:bg-[#1A4D2E]/30 dark:text-[#7DC57A] dark:border-[#7DC57A]/20',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20',
};

const ALL_STATUSES = ['Pending', 'Paid', 'Ready for Packing', 'Out for Delivery', 'Completed', 'Cancelled'];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await axios.get('http://127.0.0.1:8000/api/orders/orders/', {
        headers: { Authorization: `JWT ${token}` }
      });
      const sortedOrders = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sortedOrders);
      if (sortedOrders.length > 0 && !selectedOrder) {
        setSelectedOrder(sortedOrders[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access');
      await axios.patch(`http://127.0.0.1:8000/api/orders/orders/${orderId}/`, 
        { status: newStatus },
        { headers: { Authorization: `JWT ${token}` } }
      );
      
      // Update local state smoothly
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      alert("Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => (o.status || 'Pending') === filterStatus);

  // Helper to extract Lat/Lng from the delivery string we saved in Checkout
  const extractCoordinates = (addressString) => {
    if (!addressString) return null;
    const latMatch = addressString.match(/Lat:\s*([-\d.]+)/);
    const lngMatch = addressString.match(/Lng:\s*([-\d.]+)/);
    if (latMatch && lngMatch) {
      return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[#D1E8CE] dark:border-[#1A4D2E] !border-t-[#2D6A27] dark:!border-t-[#7DC57A] animate-spin mb-4"></div>
        <p className="text-[#2D6A27] dark:text-[#7DC57A] font-bold tracking-widest uppercase text-xs">Loading Dispatch Hub...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">
      
      {/* ─── HEADER & FILTERS ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-gray-200 dark:border-white/10 pb-6 transition-colors">
        <div>
          <h2 className="text-[clamp(2rem,3vw,3rem)] font-bold text-[#0F2318] dark:text-[#F5EDD8] leading-[1.1]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Order Dispatch Hub
          </h2>
          <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar pb-1">
            {['All', ...ALL_STATUSES].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`whitespace-nowrap pb-2 text-sm font-bold border-b-2 transition-all ${
                  filterStatus === status 
                  ? 'border-[#2D6A27] dark:border-[#7DC57A] text-[#2D6A27] dark:text-[#7DC57A]' 
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)] min-h-[600px]">
        
        {/* ─── LEFT PANEL: ORDER LIST ─── */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto no-scrollbar pr-2">
          <AnimatePresence>
            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-[2rem] p-12 text-center shadow-sm">
                <p className="text-gray-400 dark:text-gray-500 font-bold text-sm">No orders found for this status.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                const currentStatus = order.status || 'Pending';
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`cursor-pointer relative overflow-hidden transition-all duration-300 rounded-[1.5rem] p-5 shadow-sm group ${
                      isSelected 
                      ? 'bg-white/80 dark:bg-white/10 border-2 border-[#7DC57A] shadow-md transform scale-[1.02]' 
                      : 'bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:shadow-lg hover:border-[#7DC57A]/50 dark:hover:border-[#7DC57A]/50'
                    }`}
                  >
                    {/* Subtle glow for selected state */}
                    {isSelected && <div className="absolute -right-10 -top-10 w-24 h-24 bg-[#7DC57A]/20 rounded-full blur-2xl pointer-events-none"></div>}

                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order #{order.id}</p>
                        <p className="font-bold text-gray-900 dark:text-white text-base truncate max-w-[150px]">{order.customer_name || 'Guest'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[currentStatus] || STATUS_COLORS['Pending']}`}>
                        {currentStatus}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm relative z-10 pt-3 border-t border-gray-100 dark:border-white/5">
                      <p className="text-xs font-bold text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="font-black text-[#2D6A27] dark:text-[#7DC57A]">
                        KES {parseFloat(order.total_amount).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* ─── RIGHT PANEL: ORDER DETAILS ─── */}
        <div className="w-full lg:w-2/3 h-full flex flex-col bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-sm overflow-hidden">
          {selectedOrder ? (
            <>
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-gray-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-black/20">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-[#F5EDD8] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Order #{selectedOrder.id}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Placed: {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                
                {/* Status Updater */}
                <div className="flex items-center gap-3 bg-white dark:bg-[#0F2318] p-1.5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Status:</span>
                  <select 
                    value={selectedOrder.status || 'Pending'}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    disabled={isUpdating}
                    className="bg-transparent border-none text-gray-900 dark:text-white text-sm font-bold cursor-pointer outline-none py-1 pr-2"
                  >
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                
                {/* Customer Info & Map Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  
                  {/* Customer Card */}
                  <div className="bg-gray-50 dark:bg-[#0F2318]/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col justify-center">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Customer Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Name</p>
                        <p className="font-black text-gray-900 dark:text-white text-lg">{selectedOrder.customer_name || 'Guest'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Phone</p>
                        <p className="font-bold text-[#C4892A] dark:text-[#7DC57A]">{selectedOrder.customer_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Raw Delivery Info</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">{selectedOrder.delivery_address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Map */}
                  <div className="bg-gray-50 dark:bg-[#0F2318] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden h-64 relative shadow-inner dark:[&_.leaflet-layer]:invert dark:[&_.leaflet-layer]:hue-rotate-180 dark:[&_.leaflet-layer]:contrast-75 dark:[&_.leaflet-layer]:brightness-95">
                    {(() => {
                      const coords = extractCoordinates(selectedOrder.delivery_address);
                      return coords ? (
                        <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
                          <MapUpdater center={[coords.lat, coords.lng]} />
                          <Marker position={[coords.lat, coords.lng]}>
                            <Popup>Customer Location</Popup>
                          </Marker>
                        </MapContainer>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100 dark:bg-[#111] p-6 text-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 mb-2 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 10.5l.39-.39m2.22-2.22a3 3 0 014.24 0l.39.39m-8.48 8.48l-.39.39a3 3 0 01-4.24 0l-.39-.39" /></svg>
                          <span className="text-xs font-bold uppercase tracking-widest">No GPS Data Available</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Itemized Order List */}
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Order Manifest</h3>
                <div className="bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-[1.5rem] overflow-hidden mb-6 shadow-sm">
                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {selectedOrder.items?.map((item, idx) => {
                      const itemPrice = parseFloat(item.price) || 0;
                      const itemQty = parseFloat(item.quantity) || 0;
                      const offerType = (item.applied_offer || '').toLowerCase().trim();

                      return (
                        <div key={idx} className="p-4 md:p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#0F2318] flex items-center justify-center font-black text-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5">
                              {itemQty}x
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <p className="font-bold text-gray-900 dark:text-white text-base">
                                  {item.product_name || 'Market Item'}
                                </p>
                                {/* PROMO BADGES */}
                                {offerType === 'bulk' && <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#EBF5EA] text-[#2D6A27] dark:bg-[#1A4D2E]/30 dark:text-[#7DC57A] border border-[#2D6A27]/20">Bulk Deal</span>}
                                {offerType === 'discount' && <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200">Discounted</span>}
                              </div>
                              <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">@ KES {itemPrice.toLocaleString()} / ea</p>
                            </div>
                          </div>
                          <p className="font-black text-gray-900 dark:text-white text-lg">KES {(itemPrice * itemQty).toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Totals Block */}
                  <div className="bg-gray-50 dark:bg-black/40 p-6 border-t border-gray-200 dark:border-white/10 flex flex-col items-end gap-3">
                    <div className="flex justify-between w-full max-w-xs text-sm text-gray-500 dark:text-gray-400 font-bold">
                      <span>Delivery Fee</span>
                      <span>KES {parseFloat(selectedOrder.delivery_fee || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-full max-w-xs text-2xl font-black text-[#0F2318] dark:text-white pt-3 border-t border-gray-200 dark:border-white/10">
                      <span>Total</span>
                      <span className="text-[#2D6A27] dark:text-[#7DC57A]">KES {parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-20 h-20 mb-4 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
              <p className="text-sm font-black uppercase tracking-widest">Select an order to view dispatch details</p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}