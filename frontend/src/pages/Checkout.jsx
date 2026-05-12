import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
const defaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

const shopIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const SHOP_LOCATION = { lat: -1.4333, lng: 36.6833 };

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.5 }); 
  }, [center, map]);
  return null;
}

function PinDrop({ position, onPinDrop }) {
  useMapEvents({
    click(e) {
      onPinDrop(e.latlng.lat, e.latlng.lng);
    },
  });
  return <Marker position={position}><Popup>Delivery Location</Popup></Marker>;
}

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user ? user.username : '', 
    phone: '',
    addressNotes: '',
  });

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

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/orders/delivery-configs/')
      .then(response => {
        if (response.data && response.data.length > 0) {
          setDeliveryConfigs(response.data[0]);
        }
      })
      .catch(error => console.error("Failed to load delivery configs:", error));
  }, []);

  useEffect(() => {
    if (deliveryConfigs && pinLocation) {
      const dist = calculateDistance(SHOP_LOCATION.lat, SHOP_LOCATION.lng, pinLocation.lat, pinLocation.lng);
      setDistanceKm(dist);

      let fee = 0;
      if (dist <= parseFloat(deliveryConfigs.tier_1_max_km)) {
        fee = parseFloat(deliveryConfigs.tier_1_fee);
      } else if (dist <= parseFloat(deliveryConfigs.tier_2_max_km)) {
        fee = parseFloat(deliveryConfigs.tier_2_fee);
      } else if (dist <= parseFloat(deliveryConfigs.tier_3_max_km)) {
        fee = parseFloat(deliveryConfigs.tier_3_fee);
      } else {
        fee = parseFloat(deliveryConfigs.tier_4_fee);
      }
      setDeliveryFee(fee);

      if (dist > 0.1) {
        axios.get(`https://router.project-osrm.org/route/v1/driving/${SHOP_LOCATION.lng},${SHOP_LOCATION.lat};${pinLocation.lng},${pinLocation.lat}?overview=full&geometries=geojson`)
          .then(res => {
            if (res.data.routes && res.data.routes.length > 0) {
              const coords = res.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
              setRouteCoordinates(coords);
            }
          })
          .catch(err => console.error("Routing error:", err));
      } else {
        setRouteCoordinates([]);
      }
    }
  }, [pinLocation, deliveryConfigs]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&countrycodes=ke&limit=5`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
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
      if (res.data && res.data.display_name) {
        const shortName = res.data.display_name.split(',').slice(0, 2).join(',');
        setDisplayLocationName(shortName);
      } else {
        setDisplayLocationName("Unnamed Road");
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      setDisplayLocationName("Pinned Location");
    }
  };

  const finalTotal = cartTotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const orderPayload = {
      customer_name: user ? user.username : formData.name, 
      customer_phone: formData.phone,
      delivery_address: `${formData.addressNotes} | Location: ${displayLocationName} (Distance: ${distanceKm.toFixed(1)}km, Lat: ${pinLocation.lat.toFixed(5)}, Lng: ${pinLocation.lng.toFixed(5)})`,
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
      // --- CRITICAL FIX: Attach token if logged in ---
      const token = localStorage.getItem('access');
      const config = {
        headers: token ? { Authorization: `JWT ${token}` } : {}
      };

      await axios.post('http://127.0.0.1:8000/api/orders/orders/', orderPayload, config);
      clearCart(); 
      alert("Success! Your order has been placed."); 
      navigate('/profile'); // Redirect straight to profile to see it!
    } catch (error) {
      setErrorMessage("Something went wrong processing your order.");
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
      
      {/* Left Side: Form */}
      <div className="md:w-2/3 bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-brand-green mb-6">Delivery Details</h2>
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            
            {user ? (
              <div className="bg-brand-cream/30 p-4 rounded-xl border border-brand-green/20">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ordering For</p>
                <p className="text-lg font-bold text-gray-900">{user.username}</p>
                <p className="text-xs text-brand-green font-medium italic mt-1">Order will be linked to your account</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-brand-green"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-brand-green"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Apartment / Suite / Notes</label>
              <textarea 
                name="addressNotes"
                required
                rows="2"
                value={formData.addressNotes}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-brand-green"
                placeholder="House number, gate color, specific instructions..."
              ></textarea>
            </div>
          </div>

          {/* Map Section */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-1">Set Delivery Location</label>
            <p className="text-xs text-gray-500 mb-3">Search for your road/estate, then tap the map to place the pin precisely on your house.</p>
            
            <div className="space-y-3 relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search road or estate..."
                  className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:border-brand-green"
                  onKeyDown={(e) => { e.key === 'Enter' && handleSearch(e); }}
                />
                <button 
                  type="button"
                  onClick={handleSearch}
                  className="bg-brand-green text-white px-6 rounded-md font-bold hover:bg-opacity-90 transition-colors shadow-sm"
                >
                  {isSearching ? '...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto mt-14 divide-y divide-gray-100">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() => selectLocation(result)}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors focus:outline-none"
                    >
                      <p className="font-bold text-gray-800 text-sm">{result.display_name.split(',')[0]}</p>
                      <p className="text-xs text-gray-500 truncate">{result.display_name}</p>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-200 z-0 relative shadow-inner">
                <MapContainer 
                  center={[pinLocation.lat, pinLocation.lng]} 
                  zoom={14} 
                  scrollWheelZoom={true} 
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution="Map data ©2026 Google"
                  />
                  <MapController center={[pinLocation.lat, pinLocation.lng]} />
                  <Marker position={SHOP_LOCATION} icon={shopIcon}>
                    <Popup><strong className="text-brand-green">Market Days Shop</strong></Popup>
                  </Marker>
                  <PinDrop position={pinLocation} onPinDrop={handlePinDrop} />
                  {routeCoordinates.length > 0 && (
                    <Polyline positions={routeCoordinates} color="#2563eb" weight={5} opacity={0.7} />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-brown text-brand-cream py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all mt-6 disabled:opacity-70 flex justify-center items-center shadow-md"
          >
            {isSubmitting ? 'Processing...' : `Place Order (KES ${finalTotal.toLocaleString()})`}
          </button>
        </form>
      </div>

      {/* Right Side: Order Summary */}
      <div className="md:w-1/3 space-y-6">
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
          <div className="py-3 flex justify-between text-sm text-gray-600 border-t border-gray-200">
            <span>Subtotal</span>
            <span>KES {cartTotal.toLocaleString()}</span>
          </div>
          <div className="py-3 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Destination</p>
            <p className="text-sm text-gray-800 font-medium">{displayLocationName}</p>
          </div>
          <div className="py-2 flex justify-between text-sm text-gray-800 mb-2 items-center">
            <div className="flex flex-col">
              <span>Delivery Fee</span>
              <span className="text-xs text-gray-500">{distanceKm.toFixed(1)} km from shop</span>
            </div>
            <span className="font-bold">{deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee}`}</span>
          </div>
          <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
            <span className="font-bold text-gray-700 uppercase tracking-wider text-sm">Total</span>
            <span className="text-2xl font-bold text-brand-green">KES {finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}