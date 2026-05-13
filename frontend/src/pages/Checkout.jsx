import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Setup Leaflet Icons
const defaultIcon = L.icon({
  iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

const shopIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const SHOP_LOCATION = { lat: -1.4333, lng: 36.6833 };

/* ─── Animation Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const buttonHover = { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 10 } };
const buttonTap = { scale: 0.98 };

/* ─── Map Helpers ────────────────────────────────────────────── */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function MapController({ center }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 15, { duration: 1.5 }); }, [center, map]);
  return null;
}

function PinDrop({ position, onPinDrop }) {
  useMapEvents({ click(e) { onPinDrop(e.latlng.lat, e.latlng.lng); } });
  return <Marker position={position}><Popup>Delivery Location</Popup></Marker>;
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user ? user.username : '', 
    phone: '',
    addressNotes: '',
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);

  const [deliveryConfigs, setDeliveryConfigs] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  
  const [pinLocation, setPinLocation] = useState(SHOP_LOCATION);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLocationName, setDisplayLocationName] = useState('Select a location on the map');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]); 

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Delivery Configs
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/orders/delivery-configs/')
      .then(res => { if (res.data && res.data.length > 0) setDeliveryConfigs(res.data[0]); })
      .catch(err => console.error(err));
  }, []);

  // 2. Fetch User's Saved Addresses
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('access');
      axios.get('http://127.0.0.1:8000/api/orders/addresses/', { headers: { Authorization: `JWT ${token}` } })
        .then(res => {
          setSavedAddresses(res.data);
          if (res.data.length > 0) {
            handleSelectAddress(res.data[0]);
          }
        })
        .catch(err => console.error("Failed to load saved addresses", err));
    }
  }, [user]);

  // 3. Distance & Fee Calculation
  useEffect(() => {
    if (deliveryConfigs && pinLocation) {
      const dist = calculateDistance(SHOP_LOCATION.lat, SHOP_LOCATION.lng, pinLocation.lat, pinLocation.lng);
      setDistanceKm(dist);

      let fee = 0;
      if (dist <= parseFloat(deliveryConfigs.tier_1_max_km)) fee = parseFloat(deliveryConfigs.tier_1_fee);
      else if (dist <= parseFloat(deliveryConfigs.tier_2_max_km)) fee = parseFloat(deliveryConfigs.tier_2_fee);
      else if (dist <= parseFloat(deliveryConfigs.tier_3_max_km)) fee = parseFloat(deliveryConfigs.tier_3_fee);
      else fee = parseFloat(deliveryConfigs.tier_4_fee);
      setDeliveryFee(fee);

      if (dist > 0.1) {
        axios.get(`https://router.project-osrm.org/route/v1/driving/${SHOP_LOCATION.lng},${SHOP_LOCATION.lat};${pinLocation.lng},${pinLocation.lat}?overview=full&geometries=geojson`)
          .then(res => {
            if (res.data.routes && res.data.routes.length > 0) {
              setRouteCoordinates(res.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
            }
          }).catch(err => console.error("Routing error:", err));
      } else {
        setRouteCoordinates([]);
      }
    }
  }, [pinLocation, deliveryConfigs]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSelectAddress = (address) => {
    setSelectedSavedAddress(address);
    if (address) {
      setPinLocation({ lat: parseFloat(address.latitude), lng: parseFloat(address.longitude) });
      setDisplayLocationName(address.location_name);
    } else {
      setPinLocation(SHOP_LOCATION);
      setDisplayLocationName('Select a location on the map');
      setSearchQuery('');
    }
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
    setPinLocation({ lat, lng });
    setSearchQuery(placeName);
    setDisplayLocationName(placeName); 
    setSearchResults([]); 
  };

  const handlePinDrop = async (lat, lng) => {
    setPinLocation({ lat, lng });
    setDisplayLocationName("Translating map coordinates..."); 
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      setDisplayLocationName(res.data && res.data.display_name ? res.data.display_name.split(',').slice(0, 2).join(',') : "Unnamed Road");
    } catch (err) { setDisplayLocationName("Pinned Location"); }
  };

  const finalTotal = cartTotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (distanceKm < 0.1 && !selectedSavedAddress) {
      setErrorMessage("Please select a valid delivery location.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const locationString = selectedSavedAddress 
      ? `[${selectedSavedAddress.address_type}] ${displayLocationName}` 
      : displayLocationName;

    const orderPayload = {
      customer_name: user ? user.username : formData.name, 
      customer_phone: formData.phone,
      delivery_address: `${formData.addressNotes} | Location: ${locationString} (Distance: ${distanceKm.toFixed(1)}km, Lat: ${pinLocation.lat.toFixed(6)}, Lng: ${pinLocation.lng.toFixed(6)})`,
      delivery_fee: deliveryFee, 
      total_amount: finalTotal,  
      items: cartItems.map(item => ({
        product_id: item.product.id,
        variant_id: item.variant.id,
        quantity: item.quantity,
        price: item.variant.price
      }))
    };

    try {
      const token = localStorage.getItem('access');
      const config = { headers: token ? { Authorization: `JWT ${token}` } : {} };
      await axios.post('http://127.0.0.1:8000/api/orders/orders/', orderPayload, config);
      clearCart(); 
      navigate('/profile'); 
    } catch (error) {
      setErrorMessage("Something went wrong processing your order.");
      setIsSubmitting(false);
    }
  };

  // ══════════════════════════════════════════
  // EMPTY STATE
  // ══════════════════════════════════════════
  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-[75vh] bg-[#F9F7F3] dark:bg-[#060D0A] flex items-center justify-center p-4 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-[#0A1810] rounded-[3rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 p-16 md:p-24 text-center max-w-2xl w-full transition-colors duration-300"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F2318] dark:text-[#F5EDD8] mb-4 transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Nothing to checkout.
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg font-light max-w-md mx-auto transition-colors duration-300">
            Your basket is currently empty. Let's find some fresh items for you.
          </p>
          <motion.div whileHover={buttonHover} whileTap={buttonTap} className="inline-block">
            <Link to="/products" className="bg-[#0F2318] dark:bg-[#7DC57A] text-[#F5EDD8] dark:text-[#0F2318] px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-[#0F2318]/20 dark:hover:bg-white transition-all flex items-center gap-3">
              Return to Shop
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // MAIN CHECKOUT UI
  // ══════════════════════════════════════════
  return (
    <div className="w-full min-h-screen bg-[#F9F7F3] dark:bg-[#060D0A] pb-24 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Sleek Page Header */}
      <div className="bg-[#0F2318] pt-16 pb-32 px-4 relative overflow-hidden rounded-b-[3rem] shadow-xl">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[#7DC57A] font-bold tracking-[0.2em] uppercase text-xs mb-3">
            Secure Checkout
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-[#F5EDD8]" 
            style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '-0.02em' }}
          >
            Final Details.
          </motion.h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ─── LEFT COLUMN: CHECKOUT FORM ─── */}
          <motion.div 
            variants={staggerContainer} initial="hidden" animate="visible" 
            className="lg:col-span-8 flex flex-col gap-6"
          >
            <motion.div variants={fadeUp} className="bg-white dark:bg-[#0A1810] rounded-[2.5rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5 p-8 md:p-12 transition-colors duration-300">
              
              {errorMessage && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-2xl text-sm font-bold flex items-center gap-3 transition-colors duration-300">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" /></svg>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* Section 1: Customer Details */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-[#F5EDD8] mb-6 transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>1. Recipient Details</h3>
                  
                  {user ? (
                    <div className="bg-[#EBF5EA]/50 dark:bg-[#1A4D2E]/20 p-6 rounded-2xl border border-[#7DC57A]/20 dark:border-[#7DC57A]/10 flex items-center justify-between transition-colors duration-300">
                      <div>
                        <p className="text-[10px] font-black text-[#2D6A27] dark:text-[#7DC57A] uppercase tracking-[0.2em] mb-1 transition-colors duration-300">Ordering As</p>
                        <p className="text-xl font-bold text-[#0F2318] dark:text-[#F5EDD8] transition-colors duration-300">{user.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5 transition-colors duration-300">{user.email}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#7DC57A] text-[#0F2318] flex items-center justify-center text-lg font-black uppercase shadow-sm">
                        {user.username?.charAt(0) || 'U'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 transition-colors duration-300">Full Name</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} disabled={isSubmitting} className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:bg-white dark:focus:bg-[#060D0A] focus:border-[#7DC57A] dark:focus:border-[#7DC57A] focus:ring-2 focus:ring-[#7DC57A]/20 transition-all font-medium text-gray-800 dark:text-white" />
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 transition-colors duration-300">Phone Number</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} disabled={isSubmitting} placeholder="07XX XXX XXX" className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:bg-white dark:focus:bg-[#060D0A] focus:border-[#7DC57A] dark:focus:border-[#7DC57A] focus:ring-2 focus:ring-[#7DC57A]/20 transition-all font-medium text-gray-800 dark:text-white dark:placeholder-gray-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 transition-colors duration-300">Apt / Notes (Optional)</label>
                      <input type="text" name="addressNotes" value={formData.addressNotes} onChange={handleChange} disabled={isSubmitting} placeholder="House number, gate color..." className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:bg-white dark:focus:bg-[#060D0A] focus:border-[#7DC57A] dark:focus:border-[#7DC57A] focus:ring-2 focus:ring-[#7DC57A]/20 transition-all font-medium text-gray-800 dark:text-white dark:placeholder-gray-500" />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-white/5 transition-colors duration-300" />

                {/* Section 2: Delivery Location */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-[#F5EDD8] mb-6 transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>2. Delivery Destination</h3>
                  
                  {/* Saved Addresses */}
                  {user && savedAddresses.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {savedAddresses.map(addr => (
                        <motion.div 
                          whileHover={{ y: -2 }}
                          key={addr.id} 
                          onClick={() => handleSelectAddress(addr)}
                          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 ${
                            selectedSavedAddress?.id === addr.id 
                            ? 'border-[#7DC57A] bg-[#7DC57A]/5 shadow-md' 
                            : 'border-gray-100 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${selectedSavedAddress?.id === addr.id ? 'text-[#2D6A27] dark:text-[#7DC57A]' : 'text-gray-900 dark:text-gray-300'}`}>
                              {addr.address_type}
                            </p>
                            {selectedSavedAddress?.id === addr.id && (
                              <div className="h-5 w-5 rounded-full bg-[#7DC57A] text-[#0F2318] flex items-center justify-center shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate transition-colors duration-300">{addr.location_name}</p>
                        </motion.div>
                      ))}
                      
                      {/* Manual Map Trigger */}
                      <motion.div 
                        whileHover={{ y: -2 }}
                        onClick={() => handleSelectAddress(null)}
                        className={`cursor-pointer p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${
                          !selectedSavedAddress 
                          ? 'border-[#C4892A] bg-[#C4892A]/5 text-[#C4892A]' 
                          : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:border-gray-400 dark:hover:border-white/30 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        <span className="text-sm font-bold">New Location</span>
                      </motion.div>
                    </div>
                  )}

                  {/* Interactive Map UI */}
                  <AnimatePresence>
                    {!selectedSavedAddress && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-4 rounded-xl flex items-start gap-3 transition-colors duration-300">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">Search for your general area, then <strong className="text-gray-900 dark:text-white">tap directly on the map</strong> to drop the pin on your exact doorstep.</p>
                        </div>
                        
                        <div className="flex gap-3 relative z-20">
                          <input 
                            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                            placeholder="Search road or estate..." 
                            className="flex-1 bg-gray-50 dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:bg-white dark:focus:bg-[#0A1810] focus:border-[#7DC57A] dark:focus:border-[#7DC57A] font-medium text-gray-800 dark:text-white dark:placeholder-gray-500 transition-colors text-sm" 
                            onKeyDown={(e) => { e.key === 'Enter' && handleSearch(e); }} 
                          />
                          <button 
                            type="button" onClick={handleSearch} 
                            className="bg-[#0F2318] dark:bg-[#7DC57A] text-[#F5EDD8] dark:text-[#0F2318] px-6 rounded-xl font-bold text-sm hover:bg-[#1A2E18] dark:hover:bg-white transition-colors shadow-sm"
                          >
                            {isSearching ? '...' : 'Search'}
                          </button>
                          
                          {/* Search Dropdown */}
                          {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0F2318] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5 transition-colors duration-300">
                              {searchResults.map((result) => (
                                <button key={result.place_id} type="button" onClick={() => selectLocation(result)} className="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                  <p className="font-bold text-gray-900 dark:text-white text-sm mb-0.5 transition-colors duration-300">{result.display_name.split(',')[0]}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate transition-colors duration-300">{result.display_name}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Map Canvas with Dark Mode Invert Magic */}
                        <div className="h-96 w-full rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 shadow-inner relative z-0 transition-colors duration-300 dark:[&_.leaflet-layer]:invert dark:[&_.leaflet-layer]:hue-rotate-180 dark:[&_.leaflet-layer]:contrast-75 dark:[&_.leaflet-layer]:brightness-95">
                          <MapContainer center={[pinLocation.lat, pinLocation.lng]} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                            <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="Map data ©Google" />
                            <MapController center={[pinLocation.lat, pinLocation.lng]} />
                            <Marker position={SHOP_LOCATION} icon={shopIcon}>
                              <Popup><strong className="text-[#2D6A27] font-sans">Market Days Hub</strong></Popup>
                            </Marker>
                            <PinDrop position={pinLocation} onPinDrop={handlePinDrop} />
                            {routeCoordinates.length > 0 && <Polyline positions={routeCoordinates} color="#0F2318" weight={4} opacity={0.8} dashArray="8, 8" />}
                          </MapContainer>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </motion.div>
          </motion.div>

          {/* ─── RIGHT COLUMN: ORDER SUMMARY ─── */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-4 sticky top-32"
          >
            <div className="bg-[#0F2318] dark:bg-[#0A1810] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-[#F5EDD8] dark:border dark:border-white/5 transition-colors duration-300">
              {/* Premium Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>

              <h3 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Order Summary</h3>
              
              {/* Mini Item List */}
              <div className="divide-y divide-white/10 mb-6 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.variant.id}`} className="py-3 flex justify-between gap-4">
                    <div>
                      <p className="font-bold text-[#F5EDD8] text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] font-bold text-[#F5EDD8]/50 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#F5EDD8] text-sm">KES {(item.variant.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center text-[#F5EDD8]/70">
                  <span className="font-light">Subtotal</span>
                  <span className="font-medium">KES {cartTotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-start text-[#F5EDD8]/70 pb-6 border-b border-white/10">
                  <div className="flex flex-col">
                    <span className="font-light">Delivery Fee</span>
                    <span className="text-[10px] font-bold text-[#C4892A] uppercase tracking-widest mt-1">{distanceKm.toFixed(1)} km distance</span>
                  </div>
                  <span className="font-medium text-[#F5EDD8]">{deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee}`}</span>
                </div>

                {/* Destination Display Tag */}
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 mt-2 backdrop-blur-sm">
                  <p className="text-[9px] font-black text-[#7DC57A] uppercase tracking-widest mb-1">Destination</p>
                  <p className="text-xs font-medium text-[#F5EDD8] line-clamp-2 leading-relaxed">
                    {selectedSavedAddress ? `[${selectedSavedAddress.address_type}] ` : ''} 
                    {displayLocationName}
                  </p>
                </div>
                
                <div className="flex justify-between items-end pt-4">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-4xl font-black text-[#7DC57A]">
                    <span className="text-lg text-[#7DC57A]/70 mr-1">KES</span>
                    {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Big Submit Button */}
              <motion.button 
                whileHover={!isSubmitting ? buttonHover : {}} 
                whileTap={!isSubmitting ? buttonTap : {}} 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#C4892A] text-[#0F2318] py-4 rounded-xl font-bold text-lg hover:bg-[#b07b25] dark:hover:bg-[#d69832] transition-colors shadow-[0_10px_20px_rgba(196,137,42,0.3)] flex justify-center items-center gap-3 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Order'}
                {!isSubmitting && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>}
              </motion.button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#F5EDD8]/40 font-medium">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" /></svg>
                Secure Checkout Process
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}