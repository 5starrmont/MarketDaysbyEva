import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Home from './pages/Home'; 
import Shop from './pages/Shop'; 
import ProductDetail from './pages/ProductDetail'; 
import Cart from './pages/Cart'; 
import Checkout from './pages/Checkout'; 
import Login from './pages/Login'; 
import Profile from './pages/Profile'; 
import { useCart } from './context/CartContext'; 
import { useAuth } from './context/AuthContext'; 

// Import the logo
import brandLogo from './assets/logos/logo.jpeg';

// Helper component to auto-scroll to top OR to a specific section (hash)
function ScrollManager() {
  const { pathname, hash } = useLocation();
  
  useEffect(() => {
    if (hash) {
      // Small delay ensures the page is fully rendered before scrolling
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          // Offset accounts for the fixed sticky navbar so it doesn't cover the title
          const yOffset = -120; 
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  
  return null;
}

function App() {
  const { totalItems, clearCart } = useCart(); 
  const { user, logout } = useAuth(); 
  
  // State for interactive UI
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect scroll to trigger floating glassmorphism navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  return (
    <Router>
      <ScrollManager />
      <div className="min-h-screen bg-[#F9F7F3] text-gray-900 font-sans flex flex-col relative">
        
        {/* ══════════════════════════════════════════
            PREMIUM INTERACTIVE NAVBAR
        ══════════════════════════════════════════ */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`fixed w-full z-50 transition-all duration-500 flex justify-center ${isScrolled ? 'top-4 px-4' : 'top-0 px-0'}`}
        >
          <nav className={`transition-all duration-500 w-full ${
              isScrolled 
              ? 'max-w-6xl bg-[#0F2318]/85 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl py-3 px-6 md:px-8' 
              : 'max-w-full bg-[#0F2318] py-4 px-6 md:px-12 border-b border-white/5 rounded-none'
            }`}
          >
            <div className={`mx-auto flex justify-between items-center ${isScrolled ? 'max-w-none' : 'max-w-7xl'}`}>
              
              {/* Brand Logo & Name */}
              <Link to="/" className="flex items-center gap-3 group relative z-50" onClick={() => setMobileMenuOpen(false)}>
                <img src={brandLogo} alt="Market Days Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover shadow-sm transition-transform group-hover:scale-105" />
                <div className="hidden sm:flex items-baseline gap-1.5">
                  <h1 className="text-xl md:text-2xl font-black tracking-widest text-[#F5EDD8] group-hover:text-white transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    MARKET DAYS
                  </h1>
                  <span className="text-[#C4892A] text-sm md:text-base italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    by Eva
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-6 lg:gap-8 font-medium items-center text-sm tracking-wide">
                <Link to="/" className="text-[#F5EDD8]/80 hover:text-[#C4892A] transition-colors">Home</Link>
                <Link to="/products" className="text-[#F5EDD8]/80 hover:text-[#C4892A] transition-colors">Shop</Link>
                
                {/* FIXED: These are now hash links! */}
                <Link to="/#download" className="text-[#F5EDD8]/80 hover:text-[#C4892A] transition-colors">Download</Link>
                <Link to="/#contact" className="text-[#F5EDD8]/80 hover:text-[#C4892A] transition-colors">Contact Us</Link>
                
                {/* Premium Cart Icon/Badge */}
                <Link to="/cart" className="relative text-[#F5EDD8]/80 hover:text-[#C4892A] transition-colors flex items-center gap-2 group ml-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  Cart
                  {totalItems > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-2 -right-3 bg-[#C4892A] text-[#0F2318] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </Link>

                <div className="w-px h-4 bg-white/20 mx-1 lg:mx-2"></div>

                {/* Auth Section */}
                {user ? (
                  <div className="flex items-center gap-4 lg:gap-5">
                    <Link to="/profile" className="text-sm font-bold text-[#F5EDD8] bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#7DC57A] text-[#0F2318] flex items-center justify-center text-[10px] font-black uppercase">
                        {user.username?.charAt(0) || 'U'}
                      </div>
                      Account
                    </Link>
                    <button onClick={() => logout(clearCart)} className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F5EDD8]/40 hover:text-[#C4892A] transition-colors">
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="bg-[#7DC57A] text-[#0F2318] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#6ab367] hover:shadow-[0_0_15px_rgba(125,197,122,0.4)] transition-all">
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Menu Hamburger Toggle */}
              <button 
                className="md:hidden text-[#F5EDD8] p-2 relative z-50 focus:outline-none" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-7 h-7">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile Fullscreen Menu overlay */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: "-100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-100%" }}
                transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 bg-[#0F2318]/95 backdrop-blur-2xl z-40 flex flex-col pt-32 px-8"
              >
                <div className="flex flex-col gap-6 text-3xl font-medium text-[#F5EDD8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7DC57A] transition-colors">Home</Link>
                  <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7DC57A] transition-colors">Marketplace</Link>
                  
                  {/* FIXED: Mobile links are now hashes too! */}
                  <Link to="/#download" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7DC57A] transition-colors">Download App</Link>
                  <Link to="/#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7DC57A] transition-colors">Contact Us</Link>
                  
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between hover:text-[#7DC57A] transition-colors mt-2">
                    <span>Your Cart</span>
                    {totalItems > 0 && <span className="bg-[#C4892A] text-[#0F2318] text-lg font-bold px-4 py-1 rounded-full font-sans">{totalItems}</span>}
                  </Link>
                  
                  <div className="w-full h-px bg-white/10 my-4"></div>
                  
                  <div className="font-sans text-lg tracking-wide flex flex-col gap-6">
                    {user ? (
                      <>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="font-bold flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#7DC57A] text-[#0F2318] flex items-center justify-center text-sm font-black uppercase">
                            {user.username?.charAt(0) || 'U'}
                          </div>
                          My Account
                        </Link>
                        <button onClick={() => { logout(clearCart); setMobileMenuOpen(false); }} className="text-left text-[#C4892A] font-bold">Logout</button>
                      </>
                    ) : (
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-[#7DC57A] font-bold">Sign In to Account</Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* ══════════════════════════════════════════
            MAIN CONTENT AREA
        ══════════════════════════════════════════ */}
        <main className="w-full flex-grow pt-24 md:pt-28">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Shop />} /> 
            <Route path="/products/:id" element={<ProductDetail />} /> 
            <Route path="/cart" element={<Cart />} /> 
            <Route path="/checkout" element={<Checkout />} /> 
            <Route path="/login" element={<Login />} /> 
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;