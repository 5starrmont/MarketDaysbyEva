import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

/* ─── Animation Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/inventory/products/')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = products
      .map(p => p.category?.name)
      .filter(Boolean); 
    return ['All', ...new Set(cats)]; 
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'All' || product.category?.name === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#F9F7F3] dark:bg-[#060D0A] transition-colors duration-300">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[#D1E8CE] dark:border-[#1A4D2E] !border-t-[#2D6A27] dark:!border-t-[#7DC57A] animate-spin mb-4"></div>
        <p className="text-[#2D6A27] dark:text-[#7DC57A] font-bold tracking-widest uppercase text-xs transition-colors duration-300">Curating Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F9F7F3] dark:bg-[#060D0A] pb-24 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* ══════════════════════════════════════════
          SHOP HERO
      ══════════════════════════════════════════ */}
      <div className="bg-[#0F2318] pt-12 pb-24 px-4 relative overflow-hidden rounded-b-[3rem] shadow-xl">
        {/* Subtle background noise/patterns */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/20 dark:bg-[#7DC57A]/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[#7DC57A] font-bold tracking-[0.2em] uppercase text-xs mb-4">
            Curated For You
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-[#F5EDD8] mb-6" 
            style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '-0.02em' }}
          >
            The Marketplace.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-[#F5EDD8]/70 max-w-2xl mx-auto text-lg font-light leading-relaxed"
          >
            Browse our meticulous selection of fresh produce, pantry staples, and premium daily essentials. Hand-picked and delivered to your door.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        
        {/* ══════════════════════════════════════════
            CONTROLS (SEARCH & FILTERS)
        ══════════════════════════════════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#0A1810] rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 p-4 md:p-6 mb-12 flex flex-col lg:flex-row gap-6 justify-between items-center transition-colors duration-300"
        >
          {/* Categories */}
          {categories.length > 1 && (
            <div className="flex gap-3 overflow-x-auto w-full lg:w-auto no-scrollbar pb-2 lg:pb-0 items-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                    activeCategory === category 
                    ? 'bg-[#0F2318] dark:bg-[#7DC57A] text-[#F5EDD8] dark:text-[#0F2318] shadow-md' 
                    : 'bg-gray-50 dark:bg-[#0F2318] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Search Bar */}
          <div className="w-full lg:w-96 relative group">
            <input 
              type="text" 
              placeholder="Search onions, milk..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50 dark:bg-[#0F2318] border border-gray-100 dark:border-white/5 rounded-full focus:outline-none focus:bg-white dark:focus:bg-[#0A1810] focus:ring-2 focus:ring-[#7DC57A]/30 focus:border-[#7DC57A] dark:focus:border-[#7DC57A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all text-sm font-medium"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-4 top-3.5 group-focus-within:text-[#2D6A27] dark:group-focus-within:text-[#7DC57A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </motion.div>

        {/* Results Meta */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">
            Showing <span className="font-bold text-gray-900 dark:text-white">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'item' : 'items'}
          </p>
          {activeCategory !== 'All' && (
            <p className="text-xs font-bold uppercase tracking-widest text-[#C4892A]">
              Category: {activeCategory}
            </p>
          )}
        </div>

        {/* ══════════════════════════════════════════
            PRODUCT GRID
        ══════════════════════════════════════════ */}
        {products.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#0A1810] border border-gray-100 dark:border-white/5 p-16 rounded-[2.5rem] text-center shadow-sm transition-colors duration-300">
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No products available.</p>
            <p className="text-gray-500 dark:text-gray-400">Please ensure your Django backend is running and inventory is active.</p>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#0A1810] border border-gray-100 dark:border-white/5 p-16 rounded-[2.5rem] text-center shadow-sm transition-colors duration-300">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No matches found</p>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">We couldn't find anything matching "{searchQuery}" in the {activeCategory} category.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="bg-[#0F2318] dark:bg-[#7DC57A] text-[#F5EDD8] dark:text-[#0F2318] px-8 py-3.5 rounded-full text-sm font-bold shadow-md hover:bg-[#1A2E18] dark:hover:bg-white transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={staggerContainer} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredProducts.map(product => {
              const price = product.variants?.length > 0 ? `KES ${parseFloat(product.variants[0].price).toLocaleString()}` : 'N/A';
              
              return (
                <motion.div 
                  variants={fadeUp} key={product.id} 
                  whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }} 
                  className="rounded-3xl overflow-hidden flex flex-col group bg-white dark:bg-[#0A1810] shadow-md border border-gray-100 dark:border-white/5 cursor-pointer transition-colors duration-300"
                >
                  <div className="h-56 relative overflow-hidden bg-gray-50 dark:bg-black">
                    {product.image ? (
                      <motion.img whileHover={{ scale: 1.08 }} transition={{ duration: 0.6 }} src={product.image} alt={product.name} className="object-cover h-full w-full" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300 dark:text-gray-700">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 21h15M3.75 3.75h16.5M12 3.75v13.5" /></svg>
                      </div>
                    )}
                    {product.category?.name && (
                      <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full bg-white/90 dark:bg-black/60 text-gray-900 dark:text-gray-200 backdrop-blur-md shadow-sm border border-gray-100 dark:border-white/10 transition-colors duration-300">
                        {product.category.name}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white leading-snug group-hover:text-[#2D6A27] dark:group-hover:text-[#7DC57A] transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {product.name}
                    </h3>
                    <p className="text-sm leading-relaxed mb-6 flex-grow line-clamp-2 text-gray-500 dark:text-gray-400 font-light transition-colors duration-300">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-5 mt-auto border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1 text-gray-400 dark:text-gray-500 transition-colors duration-300">from</p>
                        <span className="font-black text-xl text-[#2D6A27] dark:text-[#7DC57A] transition-colors duration-300">{price}</span>
                      </div>
                      <Link to={`/products/${product.id}`} className="text-xs font-bold px-6 py-3 rounded-full transition-all bg-[#0F2318] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] hover:bg-[#C4892A] dark:hover:bg-white hover:shadow-lg">
                        View →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}