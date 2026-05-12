import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
        // Automatically select the first variant (the default unit size/price)
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

  const incrementQuantity = () => setQuantity(prev => Number(prev) + 0.5);
  const decrementQuantity = () => setQuantity(prev => (Number(prev) > 0.5 ? Number(prev) - 0.5 : 0.5));

  // ══════════════════════════════════════════
  // LOADING STATE
  // ══════════════════════════════════════════
  if (loading) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center bg-[#F9F7F3]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: '#D1E8CE', borderTopColor: '#2D6A27' }}></div>
        <p className="text-[#2D6A27] font-bold tracking-widest uppercase text-xs">Loading Details...</p>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // NOT FOUND STATE
  // ══════════════════════════════════════════
  if (!product) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center bg-[#F9F7F3] p-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-16 rounded-[3rem] shadow-xl text-center border border-gray-100 max-w-lg">
          <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Item not found</h2>
          <p className="text-gray-500 mb-8 font-light">We couldn't locate the specific item you are looking for.</p>
          <button onClick={() => navigate('/products')} className="bg-[#0F2318] text-[#F5EDD8] px-8 py-3.5 rounded-full font-bold hover:bg-[#1A2E18] transition-colors shadow-md">
            Return to Marketplace
          </button>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // MAIN PRODUCT DETAIL UI
  // ══════════════════════════════════════════
  return (
    <div className="w-full min-h-screen bg-[#F9F7F3] py-12 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/products" className="inline-flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#C4892A] mb-8 transition-colors group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Marketplace
          </Link>
        </motion.div>

        <motion.div 
          variants={staggerContainer} initial="hidden" animate="visible"
          className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 flex flex-col lg:flex-row"
        >
          
          {/* ─── Left Side: Product Image ─── */}
          <motion.div variants={fadeUp} className="lg:w-1/2 bg-gray-50 relative min-h-[400px] lg:min-h-[600px] flex items-center justify-center p-12 overflow-hidden group">
            {/* Subtle background circle behind image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white rounded-full blur-[60px] opacity-70 pointer-events-none"></div>
            
            {product.image ? (
              <motion.img 
                whileHover={{ scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }}
                src={product.image} alt={product.name} 
                className="object-contain w-full h-full max-h-[500px] relative z-10 drop-shadow-2xl" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-300 relative z-10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="h-32 w-32 mb-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-lg font-medium tracking-wide">No Image Available</span>
              </div>
            )}
            
            {product.category?.name && (
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full shadow-sm border border-gray-100 z-20">
                <p className="text-[10px] text-gray-900 font-black tracking-widest uppercase">
                  {product.category.name}
                </p>
              </div>
            )}
          </motion.div>

          {/* ─── Right Side: Details & Purchasing ─── */}
          <motion.div variants={fadeUp} className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center">
            
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {product.name}
            </h2>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed font-light">
              {product.description}
            </p>

            <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 mb-10">
              
              {/* Unit Price Display */}
              {selectedVariant ? (
                <div className="mb-8">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Unit Price</h3>
                  <p className="text-3xl font-black text-gray-900">
                    KES {parseFloat(selectedVariant.price).toLocaleString()}
                    <span className="text-xs font-bold text-gray-400 ml-3 uppercase tracking-widest">per {selectedVariant.unit_size}</span>
                  </p>
                </div>
              ) : (
                <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <p className="text-orange-600 font-bold text-sm flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" /></svg>
                    Currently out of stock.
                  </p>
                </div>
              )}

              {/* Quantity Selection */}
              {selectedVariant && (
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Quantity</h3>
                  <div className="flex items-center bg-white border border-gray-200 rounded-2xl w-max overflow-hidden focus-within:border-[#7DC57A] focus-within:ring-2 focus-within:ring-[#7DC57A]/20 transition-all shadow-sm">
                    <button onClick={decrementQuantity} className="px-6 py-3 text-gray-400 hover:bg-gray-50 hover:text-gray-900 font-black text-xl transition-colors select-none">-</button>
                    
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
                      className="w-16 text-center font-black text-gray-900 text-lg py-3 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent"
                    />

                    <button onClick={incrementQuantity} className="px-6 py-3 text-gray-400 hover:bg-gray-50 hover:text-gray-900 font-black text-xl transition-colors select-none">+</button>
                  </div>
                </div>
              )}
            </div>

            {/* Total Price & Add to Cart */}
            <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Order Value</div>
                <div className="text-4xl font-black text-[#2D6A27]">
                  {selectedVariant ? `KES ${(selectedVariant.price * (parseFloat(quantity) || 0)).toLocaleString()}` : '---'}
                </div>
              </div>
              
              <motion.button 
                whileHover={!added && selectedVariant ? buttonHover : {}}
                whileTap={!added && selectedVariant ? buttonTap : {}}
                onClick={handleAddToCart}
                disabled={!selectedVariant || parseFloat(quantity) <= 0 || isNaN(parseFloat(quantity))}
                className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg flex justify-center items-center gap-3 ${
                  added 
                  ? 'bg-[#7DC57A] text-[#0F2318] shadow-[#7DC57A]/30 border border-[#7DC57A]' 
                  : 'bg-[#0F2318] text-[#F5EDD8] hover:bg-[#1A2E18] disabled:opacity-50 disabled:cursor-not-allowed border border-[#0F2318]'
                }`}
              >
                {added ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Added to Basket
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>
                    Add to Cart
                  </>
                )}
              </motion.button>
            </div>
            
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}