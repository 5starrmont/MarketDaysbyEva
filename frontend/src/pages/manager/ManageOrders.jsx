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
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const buttonHover = { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 15 } };
const buttonTap = { scale: 0.98 };

// Fixed contrast for both light and dark modes
const STATUS_COLORS = {
  'Pending': 'text-yellow-700 dark:text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  'Paid': 'text-blue-700 dark:text-blue-500 bg-blue-500/10 border-blue-500/20',
  'Ready for Packing': 'text-purple-700 dark:text-purple-500 bg-purple-500/10 border-purple-500/20',
  'Out for Delivery': 'text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'Delivered': 'text-[#2D6A27] dark:text-[#7DC57A] bg-[#7DC57A]/10 dark:bg-[#1A4D2E]/30 border-[#7DC57A]/20',
  'Cancelled': 'text-red-700 dark:text-red-500 bg-red-500/10 border-red-500/20',
};

const BORDER_COLORS = {
  'Pending': 'border-l-yellow-500',
  'Paid': 'border-l-blue-500',
  'Ready for Packing': 'border-l-purple-500',
  'Out for Delivery': 'border-l-indigo-400',
  'Delivered': 'border-l-[#7DC57A]',
  'Cancelled': 'border-l-red-500',
};

const ALL_STATUSES = ['Pending', 'Paid', 'Ready for Packing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => setTick(t => t + 1), 30000); 
    return () => clearInterval(interval);
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
      <div className="w-full py-32 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[#D1E8CE] dark:border-[#1A4D2E] !border-t-[#2D6A27] dark:!border-t-[#7DC57A] animate-spin mb-4"></div>
        <p className="text-[#2D6A27] dark:text-[#7DC57A] font-bold tracking-widest uppercase text-xs">Connecting to Dispatch Hub...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20 pt-4">
      
      {/* ─── HEADER & FILTERS ─── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10 pb-6 transition-colors border-b border-gray-200 dark:border-white/10">
        <div>
          <h2 className="text-[clamp(2.5rem,4vw,4rem)] font-black text-[#0F2318] dark:text-[#F5EDD8] leading-tight mb-2 transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Command Center
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide transition-colors duration-300">Monitor incoming orders and trigger rider dispatch.</p>
        </div>

        <div className="flex flex-wrap gap-2 bg-white dark:bg-[#0F2318] p-2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg transition-colors duration-300">
          {['All', ...ALL_STATUSES].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filterStatus === status 
                ? 'bg-[#2D6A27] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] shadow-md' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px] h-[calc(100vh-300px)]">
        
        {/* ─── LEFT PANEL: TICKET LIST ─── */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
          <AnimatePresence>
            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-[2rem] p-12 text-center shadow-sm dark:shadow-lg transition-colors duration-300">
                <p className="text-gray-400 dark:text-gray-500 font-bold text-sm">The queue is clear.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                const currentStatus = order.status || 'Pending';
                const timeSinceCreation = (new Date().getTime() - new Date(order.created_at).getTime()) / 60000;
                const minutesLeft = Math.ceil(10 - timeSinceCreation);
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`cursor-pointer transition-all duration-300 rounded-2xl p-5 border-l-4 shadow-sm group ${
                      isSelected 
                      ? `bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 transform scale-[1.02] ${BORDER_COLORS[currentStatus]}` 
                      : `bg-white dark:bg-[#0A1810] border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 ${BORDER_COLORS[currentStatus]}`
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1 transition-colors duration-300">Ticket #{order.id}</p>
                        <p className="font-bold text-[#0F2318] dark:text-white text-lg truncate max-w-[180px] transition-colors duration-300">{order.customer_name || 'Guest'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[currentStatus] || STATUS_COLORS['Pending']}`}>
                          {currentStatus}
                        </span>
                        
                        {currentStatus === 'Paid' && (
                           <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 tracking-widest flex items-center gap-1 animate-pulse transition-colors duration-300">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                              {minutesLeft > 0 ? `${minutesLeft}m wait` : 'Ready...'}
                           </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-100 dark:border-white/10 transition-colors duration-300">
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5 transition-colors duration-300">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="font-black text-[#2D6A27] dark:text-[#7DC57A] transition-colors duration-300">
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
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-md dark:shadow-2xl overflow-hidden relative transition-colors duration-300">
          {selectedOrder ? (
            <>
              {/* Premium Glass Header */}
              <div className="p-8 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0F2318] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#7DC57A]/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-black text-[#0F2318] dark:text-[#F5EDD8] transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      Order #{selectedOrder.id}
                    </h2>
                    {selectedOrder.transaction_reference && (
                      <span className="bg-[#EBF5EA] dark:bg-[#1A4D2E]/40 border border-[#2D6A27]/20 dark:border-[#7DC57A]/30 text-[#2D6A27] dark:text-[#7DC57A] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-colors duration-300">
                        {selectedOrder.transaction_reference}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors duration-300">
                    {new Date(selectedOrder.created_at).toLocaleString('en-KE', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                </div>
                
                {/* Manual Override Status Updater */}
                <div className="relative z-10 flex flex-col items-end gap-2 w-full sm:w-auto">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 transition-colors duration-300">Override Status</label>
                  <select 
                    value={selectedOrder.status || 'Pending'}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    disabled={isUpdating}
                    className="bg-white dark:bg-[#060D0A] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm font-bold uppercase tracking-widest cursor-pointer outline-none p-3 rounded-xl hover:border-gray-300 dark:hover:border-white/30 transition-colors w-full"
                  >
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* ─── Customer Details & Map ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                  
                  {/* Clean Detail Card */}
                  <div className="bg-gray-50 dark:bg-[#0F2318]/50 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 flex flex-col justify-center transition-colors duration-300">
                    <h3 className="text-[10px] font-black text-[#2D6A27] dark:text-[#7DC57A] uppercase tracking-[0.2em] mb-6 flex items-center gap-2 transition-colors duration-300">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
                      Customer Details
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1 transition-colors duration-300">Name</p>
                        <p className="font-bold text-[#0F2318] dark:text-white text-xl transition-colors duration-300">{selectedOrder.customer_name || 'Guest'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1 transition-colors duration-300">Phone Contact</p>
                        <p className="font-black tracking-wider text-xl text-[#C4892A]">{selectedOrder.customer_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1 transition-colors duration-300">Delivery Instructions</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-[#060D0A] p-4 rounded-xl border border-gray-100 dark:border-white/5 transition-colors duration-300">{selectedOrder.delivery_address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sleek Map */}
                  <div className="bg-gray-100 dark:bg-[#0F2318] rounded-[2rem] border border-gray-200 dark:border-white/5 overflow-hidden min-h-[300px] relative shadow-inner transition-colors duration-300 dark:[&_.leaflet-layer]:invert dark:[&_.leaflet-layer]:hue-rotate-180 dark:[&_.leaflet-layer]:contrast-75 dark:[&_.leaflet-layer]:brightness-95">
                    {(() => {
                      const coords = extractCoordinates(selectedOrder.delivery_address);
                      return coords ? (
                        <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                          <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
                          <MapUpdater center={[coords.lat, coords.lng]} />
                          <Marker position={[coords.lat, coords.lng]}>
                            <Popup>Deliver Here</Popup>
                          </Marker>
                        </MapContainer>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-6 text-center transition-colors duration-300">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 mb-3 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 10.5l.39-.39m2.22-2.22a3 3 0 014.24 0l.39.39m-8.48 8.48l-.39.39a3 3 0 01-4.24 0l-.39-.39" /></svg>
                          <span className="text-xs font-black uppercase tracking-widest">No GPS Coordinates</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* ─── Manifest Details ─── */}
                <h3 className="text-[10px] font-black text-[#2D6A27] dark:text-[#7DC57A] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 transition-colors duration-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                  Order Manifest
                </h3>
                <div className="bg-gray-50 dark:bg-[#0F2318] border border-gray-200 dark:border-white/5 rounded-[2rem] overflow-hidden mb-8 transition-colors duration-300">
                  <div className="divide-y divide-gray-200 dark:divide-white/5">
                    {selectedOrder.items?.map((item, idx) => {
                      const itemPrice = parseFloat(item.price) || 0;
                      const itemQty = parseFloat(item.quantity) || 0;
                      const offerType = (item.applied_offer || '').toLowerCase().trim();

                      return (
                        <div key={idx} className="p-6 flex justify-between items-center hover:bg-white dark:hover:bg-white/5 transition-colors">
                          <div className="flex gap-5 items-center">
                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#060D0A] flex items-center justify-center font-black text-lg text-gray-500 dark:text-gray-300 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-inner transition-colors duration-300">
                              {itemQty}x
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-3 mb-1">
                                <p className="font-bold text-[#0F2318] dark:text-white text-lg tracking-wide transition-colors duration-300">
                                  {item.product_name || 'Market Item'}
                                </p>
                                {offerType === 'bulk' && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-[#EBF5EA] dark:bg-[#1A4D2E]/30 text-[#2D6A27] dark:text-[#7DC57A] border border-[#2D6A27]/20 dark:border-[#7DC57A]/30">Bulk Deal</span>}
                                {offerType === 'discount' && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">Discounted</span>}
                              </div>
                              <p className="text-sm text-gray-500 font-medium">@ KES {itemPrice.toLocaleString()} / ea</p>
                            </div>
                          </div>
                          <p className="font-black text-[#0F2318] dark:text-white text-xl tracking-wider transition-colors duration-300">KES {(itemPrice * itemQty).toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Totals Block */}
                  <div className="bg-white dark:bg-[#060D0A] p-8 flex flex-col items-end gap-3 transition-colors duration-300">
                    <div className="flex justify-between w-full max-w-xs text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">
                      <span>Delivery Fee</span>
                      <span>KES {parseFloat(selectedOrder.delivery_fee || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-full max-w-xs text-3xl font-black text-[#0F2318] dark:text-white pt-4 border-t border-gray-200 dark:border-white/10 mt-1 transition-colors duration-300">
                      <span>Total</span>
                      <span className="text-[#2D6A27] dark:text-[#7DC57A] transition-colors duration-300">KES {parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── ACTION FOOTER ─── */}
              {(selectedOrder.status === 'Pending' || selectedOrder.status === 'Ready for Packing' || selectedOrder.status === 'Out for Delivery') && (
                <div className="bg-gray-50 dark:bg-[#060D0A] p-6 border-t border-gray-200 dark:border-[#7DC57A]/20 flex flex-wrap gap-4 justify-end relative z-20 transition-colors duration-300">
                  
                  {/* NEW: PENDING ACTIONS */}
                  {selectedOrder.status === 'Pending' && (
                    <>
                      <motion.button
                        whileHover={buttonHover} whileTap={buttonTap}
                        onClick={() => alert("Integration pending: This will query the Safaricom Daraja API to check if the transaction is stuck, failed, or completed.")}
                        className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-sm transition-all w-full sm:w-auto hover:bg-blue-100 dark:hover:bg-blue-500/20"
                      >
                        Verify Payment Sync
                      </motion.button>
                      
                      <motion.button
                        whileHover={buttonHover} whileTap={buttonTap}
                        onClick={() => {
                          if(window.confirm("Are you sure you want to manually mark this order as Paid?")) {
                            handleUpdateStatus(selectedOrder.id, 'Paid');
                          }
                        }}
                        className="bg-white dark:bg-[#0F2318] text-[#0F2318] dark:text-white border border-gray-200 dark:border-white/10 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-sm transition-all w-full sm:w-auto hover:bg-gray-100 dark:hover:bg-white/5"
                      >
                        Override: Mark Paid
                      </motion.button>
                    </>
                  )}

                  {selectedOrder.status === 'Ready for Packing' && (
                    <motion.button
                      whileHover={buttonHover} whileTap={buttonTap}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Out for Delivery')}
                      className="bg-[#2D6A27] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-lg dark:shadow-[0_0_30px_rgba(125,197,122,0.15)] transition-all w-full sm:w-auto hover:bg-[#1A4D2E] dark:hover:bg-white"
                    >
                      Package Ready: Send to Dispatch
                    </motion.button>
                  )}

                  {selectedOrder.status === 'Out for Delivery' && (
                    <>
                      <motion.button
                        whileHover={buttonHover} whileTap={buttonTap}
                        onClick={() => alert("Glovo/Bolt API Integration will trigger the rider request here!")}
                        className="bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-lg transition-all w-full sm:w-auto hover:bg-yellow-500 dark:hover:bg-yellow-400"
                      >
                        Request External Rider
                      </motion.button>
                      
                      <motion.button
                        whileHover={buttonHover} whileTap={buttonTap}
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}
                        className="bg-[#0F2318] dark:bg-white text-white dark:text-[#0F2318] px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-lg transition-all w-full sm:w-auto hover:bg-gray-800 dark:hover:bg-gray-200"
                      >
                        Mark Successfully Delivered
                      </motion.button>
                    </>
                  )}
                </div>
              )}

            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 transition-colors duration-300">
              <div className="w-24 h-24 mb-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm dark:shadow-lg transition-colors duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
              </div>
              <p className="text-sm font-black uppercase tracking-[0.2em]">Select an order to view dispatch details</p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}