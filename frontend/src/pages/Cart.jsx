import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Animation Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemRemove = {
  hidden: { opacity: 0, scale: 0.9, filter: 'blur(5px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -50, scale: 0.9, transition: { duration: 0.3 } }
};

/* ─── Button Interactions ─────────────────────────────────────── */
const buttonHover = { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } };
const buttonTap = { scale: 0.95 };

export default function Cart() {
  const { cartItems, removeFromCart, cartTotal } = useCart();

  // ══════════════════════════════════════════
  // EMPTY STATE
  // ══════════════════════════════════════════
  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-[75vh] bg-[#F9F7F3] dark:bg-[#060D0A] flex items-center justify-center p-4 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-[#0A1810] rounded-[3rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 p-16 md:p-24 text-center max-w-2xl w-full transition-colors duration-300"
        >
          <div className="w-24 h-24 mx-auto bg-[#EBF5EA] dark:bg-[#1A4D2E]/30 text-[#7DC57A] rounded-full flex items-center justify-center mb-8 shadow-inner transition-colors duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F2318] dark:text-[#F5EDD8] mb-4 transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Your basket is empty.
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg font-light max-w-md mx-auto transition-colors duration-300">
            Looks like you haven't added anything yet. Explore our curated marketplace to find fresh essentials.
          </p>
          <motion.div whileHover={buttonHover} whileTap={buttonTap} className="inline-block">
            <Link to="/products" className="bg-[#0F2318] dark:bg-[#7DC57A] text-[#F5EDD8] dark:text-[#0F2318] px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-[#0F2318]/20 dark:hover:bg-white transition-all flex items-center gap-3">
              Browse Marketplace
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // FILLED STATE
  // ══════════════════════════════════════════
  return (
    <div className="w-full min-h-screen bg-[#F9F7F3] dark:bg-[#060D0A] pb-24 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Sleek Page Header */}
      <div className="bg-[#0F2318] pt-16 pb-32 px-4 relative overflow-hidden rounded-b-[3rem] shadow-xl">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[#7DC57A] font-bold tracking-[0.2em] uppercase text-xs mb-3">
            Review Order
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-[#F5EDD8]" 
            style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '-0.02em' }}
          >
            Your Basket.
          </motion.h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ─── LEFT COLUMN: CART ITEMS ─── */}
          <motion.div 
            variants={staggerContainer} initial="hidden" animate="visible" 
            className="lg:col-span-8 flex flex-col gap-6"
          >
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div 
                  variants={itemRemove}
                  key={`${item.product.id}-${item.variant.id}`} 
                  className="bg-white dark:bg-[#0A1810] rounded-[2rem] p-6 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group transition-colors duration-300"
                >
                  
                  {/* Product Details (Image + Info) */}
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-3xl flex items-center justify-center overflow-hidden flex-shrink-0 rounded-2xl border border-gray-100 dark:border-white/5 relative transition-colors duration-300">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-8 h-8 text-gray-300 dark:text-gray-700"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 21h15M3.75 3.75h16.5M12 3.75v13.5" /></svg>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-3 transition-colors duration-300">
                        {item.variant.unit_size}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#0F2318] dark:text-[#F5EDD8] bg-gray-50 dark:bg-[#1A2E18] border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-sm shadow-sm transition-colors duration-300">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-medium text-gray-400 dark:text-gray-500 transition-colors duration-300">
                          (KES {parseFloat(item.variant.price).toLocaleString()} each)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Remove Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-none border-gray-100 dark:border-white/5 pt-4 sm:pt-0 transition-colors duration-300">
                    <p className="text-2xl font-black text-[#2D6A27] dark:text-[#7DC57A] sm:mb-4 transition-colors duration-300">
                      KES {(item.variant.price * item.quantity).toLocaleString()}
                    </p>
                    <button 
                      onClick={() => removeFromCart(item.product.id, item.variant.id)}
                      className="text-xs font-bold text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-3 py-1.5 rounded-md"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      Remove
                    </button>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* ─── RIGHT COLUMN: ORDER SUMMARY ─── */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-4 sticky top-32"
          >
            <div className="bg-[#0F2318] dark:bg-[#0A1810] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-[#F5EDD8] dark:border dark:border-white/5 transition-colors duration-300">
              {/* Premium Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>

              <h3 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-[#F5EDD8]/70">
                  <span className="font-light">Subtotal</span>
                  <span className="font-medium">KES {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[#F5EDD8]/70 pb-6 border-b border-white/10">
                  <span className="font-light">Delivery Fee</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-[#C4892A]">Calculated Next</span>
                </div>
                
                <div className="flex justify-between items-end pt-2">
                  <span className="text-lg font-bold">Estimated Total</span>
                  <span className="text-4xl font-black text-[#7DC57A]">
                    <span className="text-lg text-[#7DC57A]/70 mr-1">KES</span>
                    {cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <motion.div whileHover={buttonHover} whileTap={buttonTap} className="mt-8">
                <Link 
                  to="/checkout"
                  className="w-full bg-[#C4892A] text-[#0F2318] py-4 rounded-xl font-bold text-lg hover:bg-[#b07b25] dark:hover:bg-[#d69832] transition-colors shadow-[0_10px_20px_rgba(196,137,42,0.3)] flex justify-center items-center gap-3"
                >
                  Proceed to Checkout
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
              </motion.div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#F5EDD8]/40 font-medium">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" /></svg>
                Secure 256-bit SSL encryption
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}