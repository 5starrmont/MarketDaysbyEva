import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

/* ─── Leaflet Setup ──────────────────────────────────────────── */
const defaultIcon = L.icon({
  iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

const SHOP_LOCATION = { lat: -1.4333, lng: 36.6833 };

/* ─── Animation Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const buttonHover = { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 15 } };
const buttonTap = { scale: 0.98 };

/* ─── Map Helpers ────────────────────────────────────────────── */
function MapController({ center }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 15, { duration: 1.5 }); }, [center, map]);
  return null;
}

function PinDrop({ position, onPinDrop }) {
  useMapEvents({ click(e) { onPinDrop(e.latlng.lat, e.latlng.lng); } });
  return <Marker position={position}><Popup>Deliver Here</Popup></Marker>;
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function Profile() {
  const { user, logout } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    address_type: '', 
    location_name: 'Select a location on the map',
    latitude: SHOP_LOCATION.lat,
    longitude: SHOP_LOCATION.lng
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('access');
          const config = { headers: { Authorization: `JWT ${token}` } };
          const [ordersRes, addressesRes] = await Promise.all([
            axios.get('http://127.0.0.1:8000/api/orders/orders/', config),
            axios.get('http://127.0.0.1:8000/api/orders/addresses/', config)
          ]);
          setOrders(ordersRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
          setAddresses(addressesRes.data);
        } catch (error) {
          console.error("Failed to fetch profile data:", error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleLogout = () => { logout(clearCart); navigate('/login'); };
  const toggleExpand = (orderId) => setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  const isWithinTenMinutes = (createdAt) => ((new Date().getTime() - new Date(createdAt).getTime()) / 60000) <= 10;

  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const token = localStorage.getItem('access');
      await axios.patch(`http://127.0.0.1:8000/api/orders/orders/${orderId}/`, { status: 'Cancelled' }, { headers: { Authorization: `JWT ${token}` } });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    } catch (error) { alert("Could not cancel order."); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&countrycodes=ke&limit=5`);
      setSearchResults(res.data);
    } catch (err) { console.error(err); } finally { setIsSearching(false); }
  };

  const selectLocation = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const placeName = result.display_name.split(',').slice(0, 2).join(', ');
    setNewAddress(prev => ({ ...prev, latitude: lat, longitude: lng, location_name: placeName }));
    setSearchQuery(placeName);
    setSearchResults([]);
  };

  const handlePinDrop = async (lat, lng) => {
    setNewAddress(prev => ({ ...prev, latitude: lat, longitude: lng, location_name: "Translating..." }));
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const shortName = (res.data && res.data.display_name) ? res.data.display_name.split(',').slice(0, 2).join(',') : "Unnamed Road";
      setNewAddress(prev => ({ ...prev, location_name: shortName }));
    } catch (err) { setNewAddress(prev => ({ ...prev, location_name: "Pinned Location" })); }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.address_type.trim()) { alert("Please enter a label for this address."); return; }
    setIsSavingAddress(true);
    const payload = { ...newAddress, latitude: parseFloat(newAddress.latitude).toFixed(6), longitude: parseFloat(newAddress.longitude).toFixed(6) };
    try {
      const token = localStorage.getItem('access');
      const res = await axios.post('http://127.0.0.1:8000/api/orders/addresses/', payload, { headers: { Authorization: `JWT ${token}` } });
      setAddresses([...addresses, res.data]);
      setShowAddressModal(false);
      setNewAddress({ address_type: '', location_name: 'Select a location on the map', latitude: SHOP_LOCATION.lat, longitude: SHOP_LOCATION.lng });
      setSearchQuery('');
    } catch (error) { alert("Error saving address."); } finally { setIsSavingAddress(false); }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Remove this address?")) return;
    try {
      const token = localStorage.getItem('access');
      await axios.delete(`http://127.0.0.1:8000/api/orders/addresses/${id}/`, { headers: { Authorization: `JWT ${token}` } });
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (error) { alert("Failed to delete address."); }
  };

  if (!user) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-[#F9F7F3]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl text-center border border-gray-100 max-w-lg mx-4">
          <h2 className="text-4xl font-bold text-[#0F2318] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Member Dashboard</h2>
          <p className="text-gray-500 mb-10 font-light text-lg">Please sign in to access your account.</p>
          <motion.button whileHover={buttonHover} whileTap={buttonTap} onClick={() => navigate('/login')} className="bg-[#0F2318] text-[#F5EDD8] px-12 py-4 rounded-full font-bold shadow-lg shadow-[#0F2318]/20 transition-all">
            Sign In Now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F9F7F3] pb-32" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* ─── Dashboard Header ─── */}
      <div className="bg-[#0F2318] pt-20 pb-40 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 mb-2">
              <div className="h-16 w-16 bg-[#F5EDD8] text-[#0F2318] rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-[#F5EDD8] leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Welcome, {user.username}.
                </h1>
              </div>
            </motion.div>
          </div>
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} whileHover={buttonHover} whileTap={buttonTap} onClick={handleLogout} className="bg-white/10 hover:bg-red-500/20 border border-white/10 text-[#F5EDD8] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all backdrop-blur-md mb-2">
            Sign Out
          </motion.button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-20">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* ─── Left Sidebar: Addresses & Quick Stats ─── */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div variants={fadeUp} className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Saved Addresses</h3>
                <button onClick={() => setShowAddressModal(true)} className="w-8 h-8 rounded-full bg-[#F5EDD8] text-[#C4892A] flex items-center justify-center hover:bg-[#0F2318] hover:text-[#F5EDD8] transition-all shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <p className="text-sm text-gray-400 font-light px-4 text-balance">Add your home or office for faster checkout.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="group flex items-center justify-between bg-gray-50 hover:bg-[#F5EDD8]/20 border border-gray-100 p-4 rounded-2xl transition-all">
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C4892A]"></span>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{addr.address_type}</p>
                        </div>
                        <p className="text-sm text-[#0F2318] font-bold truncate pr-4">{addr.location_name}</p>
                      </div>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-2 bg-white rounded-xl shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="bg-[#F5EDD8] rounded-[2.5rem] p-8 border border-[#E8DDCA]">
              <h3 className="text-[11px] font-black text-[#5C4A2A] uppercase tracking-[0.2em] mb-4">Account Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/40 p-4 rounded-2xl">
                  <p className="text-2xl font-black text-[#0F2318]">{orders.length}</p>
                  <p className="text-[9px] font-bold text-[#5C4A2A] uppercase tracking-widest">Total Orders</p>
                </div>
                <div className="bg-white/40 p-4 rounded-2xl">
                  <p className="text-2xl font-black text-[#0F2318]">{orders.filter(o => o.status === 'Delivered').length}</p>
                  <p className="text-[9px] font-bold text-[#5C4A2A] uppercase tracking-widest">Successful</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── Right Section: Order History ─── */}
          <div className="lg:col-span-8">
            <motion.div variants={staggerContainer} className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-[#0F2318] flex items-center gap-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Recent Orders
                  {loadingData && <div className="w-4 h-4 rounded-full border-2 border-[#0F2318]/20 border-t-[#0F2318] animate-spin"></div>}
                </h2>
              </div>

              {!loadingData && orders.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-[3rem] p-16 text-center shadow-xl shadow-gray-200/40">
                  <p className="text-lg text-gray-400 font-light mb-8">You haven't placed any orders yet.</p>
                  <motion.button whileHover={buttonHover} whileTap={buttonTap} onClick={() => navigate('/products')} className="bg-[#0F2318] text-[#F5EDD8] px-10 py-4 rounded-full font-bold shadow-lg">
                    Start Your First Shop
                  </motion.button>
                </div>
              ) : (
                orders.map((order) => {
                  const isPending = !order.status || order.status.toLowerCase() === 'pending';
                  const canCancel = isPending && isWithinTenMinutes(order.created_at);
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <motion.div variants={fadeUp} key={order.id} className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-[#7DC57A] shadow-2xl' : 'border-gray-100 shadow-xl shadow-gray-200/40 hover:border-gray-200'}`}>
                      <div onClick={() => toggleExpand(order.id)} className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer group relative">
                        {isExpanded && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#7DC57A]"></div>}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                              {order.status || 'Processing'}
                            </span>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Order #{order.id}</p>
                          </div>
                          <p className="text-3xl font-black text-[#0F2318]">KES {parseFloat(order.total_amount).toLocaleString()}</p>
                          <p className="text-sm text-gray-400 mt-2 font-light line-clamp-1 flex items-center gap-2">
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                             {order.delivery_address.split('|')[0]}
                          </p>
                        </div>

                        <div className="flex flex-col items-start md:items-end text-sm w-full md:w-auto border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                          <p className="font-bold text-[#0F2318]">{new Date(order.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric'})}</p>
                          <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-gray-50/70 border-t border-gray-100 overflow-hidden">
                            <div className="p-8">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Order Breakdown</h4>
                              <div className="space-y-3 mb-10">
                                {order.items?.length > 0 ? order.items.map((item, i) => (
                                  <div key={i} className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div>
                                      <p className="text-base font-bold text-[#0F2318]">{item.product_name || `Market Item`}</p>
                                      <p className="text-xs text-gray-400 font-medium">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="text-lg font-black text-[#2D6A27]">KES {parseFloat(item.price).toLocaleString()}</p>
                                  </div>
                                )) : <p className="text-sm text-gray-400 italic">Order details unavailable.</p>}
                              </div>
                              
                              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-200">
                                <div className="text-[11px] text-gray-400 max-w-xs text-center sm:text-left leading-relaxed">
                                  {isPending ? (canCancel ? "Eva is currently picking your items. You have a limited window to cancel this order." : "Your items are already being packed. Cancellation is no longer available.") : "This order has already been finalized."}
                                </div>
                                {canCancel && (
                                  <motion.button whileHover={buttonHover} whileTap={buttonTap} onClick={(e) => handleCancelOrder(e, order.id)} className="bg-red-500 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20">
                                    Cancel Order
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ─── Address Modal ─── */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddressModal(false)} className="absolute inset-0 bg-[#0F2318]/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[95vh]">
              
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-3xl font-black text-[#0F2318]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>New Delivery Point</h3>
                <button onClick={() => setShowAddressModal(false)} className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                <form id="address-form" onSubmit={handleSaveAddress} className="space-y-10">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Label Location</label>
                    <input type="text" required placeholder="e.g. My Apartment, Rongai Office..." value={newAddress.address_type} onChange={(e) => setNewAddress({...newAddress, address_type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 focus:outline-none focus:bg-white focus:border-[#7DC57A] focus:ring-4 focus:ring-[#7DC57A]/10 font-bold text-[#0F2318] transition-all" />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Estate / Street Search</label>
                    <div className="flex gap-3 relative">
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Kiserian, Nairobi..." className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-5 focus:outline-none focus:bg-white focus:border-[#7DC57A] font-bold text-[#0F2318]" onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)} />
                      <button type="button" onClick={handleSearch} className="bg-[#0F2318] text-[#F5EDD8] px-10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#1A2E18] transition-all shadow-lg">{isSearching ? '...' : 'Search'}</button>
                      
                      {searchResults.length > 0 && (
                        <div className="absolute z-[80] w-full bg-white border border-gray-100 rounded-[2rem] shadow-2xl max-h-64 overflow-y-auto mt-20 divide-y divide-gray-50">
                          {searchResults.map((result) => (
                            <button key={result.place_id} type="button" onClick={() => selectLocation(result)} className="w-full text-left px-8 py-5 hover:bg-gray-50 transition-colors">
                              <p className="font-bold text-[#0F2318] text-sm mb-1">{result.display_name.split(',')[0]}</p>
                              <p className="text-xs text-gray-400 truncate">{result.display_name}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-80 w-full rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-2xl relative z-0">
                    <MapContainer center={[newAddress.latitude, newAddress.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
                      <MapController center={[newAddress.latitude, newAddress.longitude]} />
                      <PinDrop position={[newAddress.latitude, newAddress.longitude]} onPinDrop={handlePinDrop} />
                    </MapContainer>
                  </div>
                  
                  <div className="bg-[#F5EDD8]/60 p-6 rounded-[2rem] border border-[#E8DDCA] flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#C4892A] shadow-sm flex-shrink-0">
                       <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#C4892A] uppercase tracking-[0.2em] mb-1">Pin Accuracy</p>
                      <p className="text-sm font-bold text-[#5C4A2A] leading-relaxed">{newAddress.location_name}</p>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-10 border-t border-gray-100 bg-white">
                <motion.button whileHover={buttonHover} whileTap={buttonTap} form="address-form" type="submit" disabled={isSavingAddress} className="w-full bg-[#0F2318] text-[#F5EDD8] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-[#0F2318]/20 disabled:opacity-50">
                  {isSavingAddress ? 'Finalizing Location...' : 'Save New Address'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}