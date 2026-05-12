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
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#F9F7F3]">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: '#D1E8CE', borderTopColor: '#2D6A27' }}></div>
        <p className="text-[#2D6A27] font-bold tracking-widest uppercase text-xs">Curating Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F9F7F3] pb-24" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* ══════════════════════════════════════════
          SHOP HERO
      ══════════════════════════════════════════ */}
      <div className="bg-[#0F2318] pt-12 pb-24 px-4 relative overflow-hidden rounded-b-[3rem] shadow-xl">
        {/* Subtle background noise/patterns */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/20 blur-[100px] rounded-full pointer-events-none"></div>

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
          className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-4 md:p-6 mb-12 flex flex-col lg:flex-row gap-6 justify-between items-center"
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
                    ? 'bg-[#0F2318] text-[#F5EDD8] shadow-md' 
                    : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-gray-300 hover:text-gray-900'
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
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7DC57A]/30 focus:border-[#7DC57A] transition-all text-sm font-medium"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-4 top-3.5 group-focus-within:text-[#2D6A27] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </motion.div>

        {/* Results Meta */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'item' : 'items'}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-gray-100 p-16 rounded-[2.5rem] text-center shadow-sm">
            <div className="w-20 h-20 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No products available.</p>
            <p className="text-gray-500">Please ensure your Django backend is running and inventory is active.</p>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-gray-100 p-16 rounded-[2.5rem] text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No matches found</p>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">We couldn't find anything matching "{searchQuery}" in the {activeCategory} category.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="bg-[#0F2318] text-[#F5EDD8] px-8 py-3.5 rounded-full text-sm font-bold shadow-md hover:bg-[#1A2E18] transition-colors"
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
                  className="rounded-3xl overflow-hidden flex flex-col group bg-white shadow-md border border-gray-100 cursor-pointer"
                >
                  <div className="h-56 relative overflow-hidden bg-gray-50">
                    {product.image ? (
                      <motion.img whileHover={{ scale: 1.08 }} transition={{ duration: 0.6 }} src={product.image} alt={product.name} className="object-cover h-full w-full" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 21h15M3.75 3.75h16.5M12 3.75v13.5" /></svg>
                      </div>
                    )}
                    {product.category?.name && (
                      <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full bg-white/90 text-gray-900 backdrop-blur-md shadow-sm border border-gray-100">
                        {product.category.name}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 leading-snug group-hover:text-[#2D6A27] transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {product.name}
                    </h3>
                    <p className="text-sm leading-relaxed mb-6 flex-grow line-clamp-2 text-gray-500 font-light">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-5 mt-auto border-t border-gray-100">
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1 text-gray-400">from</p>
                        <span className="font-black text-xl text-[#2D6A27]">{price}</span>
                      </div>
                      <Link to={`/products/${product.id}`} className="text-xs font-bold px-6 py-3 rounded-full transition-all bg-[#0F2318] text-white hover:bg-[#C4892A] hover:shadow-lg">
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