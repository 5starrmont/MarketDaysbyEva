import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

// Logo Imports
import brandLogoTransparent from '../assets/logos/logo-removebg-preview.png'; 
import bannerLogo from '../assets/logos/Logo_on_dark_green_surface_ 2.jpeg'; 

// Asset Imports - ALL TRANSPARENT PNGS & WEBP
import img01 from '../assets/images/01-removebg-preview.png';
import imgMeat from '../assets/images/Premium_culinary_photography._High-quality__perfectly_202605130024-removebg-preview.png';
import imgSukuma1 from '../assets/images/Sukuma_Wiki_and_Roma_tomatoes_202605130018-removebg-preview.png';
import imgFruit from '../assets/images/Fruit-PNG-Picture.webp';
import imgMilk from '../assets/images/brookside-milk.png'; 
import imgSecondaryBag from '../assets/images/rs=w_1280.webp';
import imgCart from '../assets/images/full-shopping-cart-with-groceries-cut-out-stock-png-removebg-preview.png';
import imgEggs from '../assets/images/fresh-white-farm-eggs-in-wooden-crate-with-green-leaves-free-png-removebg-preview.png';
import imgButter from '../assets/images/img-2massociates-blue-band-butter-450g-removebg-preview.png';
import imgAjab from '../assets/images/ajab-maize-flour-2kg-wholesale-nairobi-kenya-300x300-removebg-preview.png';
import imgApples from '../assets/images/apples-removebg-preview.png';
import imgAvocado from '../assets/images/avocado-removebg-preview.png';

/* ─── Font injection ──────────────────────────────────────────── */
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap';
if (!document.head.querySelector('[data-mde-font]')) {
  fontLink.setAttribute('data-mde-font', '1');
  document.head.appendChild(fontLink);
}

/* ─── Ticker items ──────────────────────────── */
const TICKER_ITEMS = [
  '🛒 Eva shops so you don\'t have to',
  '🍞 Breakfast Essentials & Dairy',
  '🥩 Prime Butchery Cuts',
  '🥬 Fresh Market Produce',
  '🍚 Unga, Rice & Pantry Staples',
  '☕ Tea, Coffee & Sugar',
  '🥑 Ripe Avocados & Fruits',
  '🧴 Basic Supermarket Restocks',
  '✨ I shop. You relax.',
];

/* ─── Steps data ──────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    title: 'Browse & Add to Cart',
    desc: 'Select from our fresh groceries and daily essentials — then place your order.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Drop Your Pin',
    desc: 'Use our interactive map to mark exactly where you want your groceries delivered.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Fast Doorstep Delivery',
    desc: 'Eva handles the shopping, our riders handle the run — fresh groceries at your door.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

/* ─── Floating Cards Data ──────────────────── */
const FLOATING_CARDS = [
  { id: 1, icon: '🥛', title: 'Fresh Milk', desc: 'Morning essentials', pos: 'top-8 right-[60%]', color: 'bg-white/20', border: 'border-white/20', delay: 0.2, duration: 4 },
  { id: 2, icon: '🥩', title: 'Butchery Cuts', desc: 'Prime meat', pos: 'top-12 right-4', color: 'bg-red-500/20', border: 'border-red-500/30', delay: 0.4, duration: 5 },
  { id: 3, icon: '🍞', title: 'Artisan Bread', desc: 'Soft & fresh', pos: 'top-[45%] right-[65%]', color: 'bg-[#C4892A]/20', border: 'border-[#C4892A]/30', delay: 0.6, duration: 4.5 },
  { id: 4, icon: '🌾', title: 'Pantry Staples', desc: 'Unga & Sugar', pos: 'top-[50%] right-10', color: 'bg-blue-300/20', border: 'border-blue-300/30', delay: 0.8, duration: 5.5 },
  { id: 5, icon: '🍅', title: 'Fresh Produce', desc: 'Hand-picked', pos: 'bottom-8 right-[40%]', color: 'bg-green-400/20', border: 'border-green-400/30', delay: 1.0, duration: 4 },
];

/* ─── Animation Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const heroReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
  }
};

const imageReveal = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  visible: { 
    opacity: 1, scale: 1, rotate: 0,
    transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] }
  }
};

/* ─── Button Interactions ─────────────────────────────────────── */
const buttonHover = { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } };
const buttonTap = { scale: 0.95 };

/* ─── Component ───────────────────────────────────────────────── */
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/inventory/products/')
      .then((res) => {
        setFeaturedProducts(res.data.slice(0, 8));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="w-full overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ══════════════════════════════════════════
          1. GRAND HERO WITH FAINT ORBITING CLUSTER
      ══════════════════════════════════════════ */}
      <section className="min-h-[85vh] flex flex-col md:flex-row items-center px-4 relative max-w-7xl mx-auto pt-10 pb-20 gap-10">
        
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-brand-green/10 dark:bg-[#7DC57A]/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        {/* Left Content */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="md:w-1/2 z-10 text-left pt-10 md:pt-0 relative">
          <motion.div variants={heroReveal} className="mb-6 inline-block">
             <img src={brandLogoTransparent} alt="Market Days by Eva" className="h-24 md:h-28 w-auto object-contain drop-shadow-xl" />
          </motion.div>
          
          <motion.span variants={heroReveal} className="text-[#C4892A] text-2xl md:text-3xl block mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
            Your Personal Concierge
          </motion.span>
          
          <motion.h1 variants={heroReveal} className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-[#F5EDD8] leading-[1.05] tracking-tight mb-8 transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            The market, <br className="hidden md:block"/> delivered to <br className="hidden md:block"/> your door.
          </motion.h1>
          
          <motion.p variants={heroReveal} className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-md transition-colors duration-300">
            From daily supermarket restocks to prime butchery cuts and fresh pantry staples. We handle the shopping so you can handle life.
          </motion.p>
          
          <motion.div variants={heroReveal} className="flex flex-col sm:flex-row gap-4 relative z-20">
            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
              <Link to="/products" className="block bg-brand-brown dark:bg-[#7DC57A] text-white dark:text-[#0F2318] px-8 py-4 rounded-full font-bold text-center shadow-lg shadow-brand-brown/30 transition-colors">
                 Shop the Market
              </Link>
            </motion.div>
            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
              <Link to="/login" className="block bg-white dark:bg-[#0A1810] text-gray-800 dark:text-[#F5EDD8] border border-gray-200 dark:border-white/20 px-8 py-4 rounded-full font-bold text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                 Create Account
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Content - FAINT ORBITING CLUSTER */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="md:w-1/2 relative h-[500px] lg:h-[600px] w-full mt-10 md:mt-0 flex items-center justify-center">
          
          <div className="absolute inset-0 bg-brand-green/10 dark:bg-[#7DC57A]/10 blur-[80px] rounded-full w-3/4 h-3/4 m-auto z-0 pointer-events-none"></div>

          {/* 5. MAIN BAG (Center Core - Solid & Large) */}
          <motion.div className="absolute inset-0 m-auto z-[20] w-[65%] md:w-[70%] flex items-center justify-center pointer-events-none">
            <motion.div animate={{ y: [-10, 10, -10], x: [5, -5, 5], rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="w-full flex justify-center">
              <motion.img variants={imageReveal} src={img01} alt="Grocery Bag" className="w-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]" />
            </motion.div>
          </motion.div>

          {/* ─── Faint Orbiting Objects (Small, opacity-50) ─── */}
          
          {/* 1. Cart (Top Left Orbit) */}
          <motion.div className="absolute top-[10%] left-[10%] md:left-[15%] w-[14%] md:w-[16%] z-[10] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, 20, 0, -20, 0], y: [-20, 0, 20, 0, -20], rotate: [0, 10, 0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }} 
              src={imgCart} alt="Shopping Cart" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>

          {/* 2. Ajab Flour (Top Center Orbit) */}
          <motion.div className="absolute top-[5%] left-[45%] w-[12%] md:w-[14%] z-[12] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, -15, 0, 15, 0], y: [15, 0, -15, 0, 15], rotate: [0, -15, 0, 15, 0] }} 
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }} 
              src={imgAjab} alt="Ajab Flour" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>

          {/* 3. Meat (Top Right Orbit) */}
          <motion.div className="absolute top-[15%] right-[10%] md:right-[15%] w-[14%] md:w-[16%] z-[10] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, 15, 0, -15, 0], y: [-15, 0, 15, 0, -15], rotate: [0, 8, 0, -8, 0] }} 
              transition={{ repeat: Infinity, duration: 9, ease: "linear" }} 
              src={imgMeat} alt="Prime Meat" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>

          {/* 4. Avocado (Mid Right Orbit) */}
          <motion.div className="absolute top-[40%] right-[2%] md:right-[5%] w-[10%] md:w-[12%] z-[15] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, -20, 0, 20, 0], y: [-20, 0, 20, 0, -20], rotate: [0, -20, 0, 20, 0] }} 
              transition={{ repeat: Infinity, duration: 11, ease: "linear" }} 
              src={imgAvocado} alt="Fresh Avocado" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>

          {/* 5. Secondary Bag (Bottom Right Orbit) */}
          <motion.div className="absolute bottom-[20%] right-[8%] md:right-[12%] w-[15%] md:w-[18%] z-[10] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, 15, 0, -15, 0], y: [15, 0, -15, 0, 15], rotate: [0, 12, 0, -12, 0] }} 
              transition={{ repeat: Infinity, duration: 13, ease: "linear" }} 
              src={imgSecondaryBag} alt="Secondary Groceries" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>

          {/* 6. Fruit (Bottom Center Orbit) */}
          <motion.div className="absolute bottom-[5%] right-[35%] md:right-[40%] w-[14%] md:w-[16%] z-[25] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, -15, 0, 15, 0], y: [-15, 0, 15, 0, -15], rotate: [0, -10, 0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 10.5, ease: "linear" }} 
              src={imgFruit} alt="Fresh Fruits" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>

          {/* 7. Eggs (Bottom Left Orbit) */}
          <motion.div className="absolute bottom-[15%] left-[15%] md:left-[20%] w-[15%] md:w-[18%] z-[15] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, 20, 0, -20, 0], y: [20, 0, -20, 0, 20], rotate: [0, 5, 0, -5, 0] }} 
              transition={{ repeat: Infinity, duration: 9.5, ease: "linear" }} 
              src={imgEggs} alt="Farm Fresh Eggs" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>

          {/* 8. Sukuma Wiki (Mid Left Orbit) */}
          <motion.div className="absolute top-[50%] left-[2%] md:left-[5%] w-[14%] md:w-[16%] z-[10] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, -15, 0, 15, 0], y: [-15, 0, 15, 0, -15], rotate: [0, -8, 0, 8, 0] }} 
              transition={{ repeat: Infinity, duration: 11.5, ease: "linear" }} 
              src={imgSukuma1} alt="Fresh Sukuma" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>

          {/* 9. Milk (Mid Top Left Orbit) */}
          <motion.div className="absolute top-[25%] left-[20%] md:left-[25%] w-[12%] md:w-[14%] z-[12] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, 15, 0, -15, 0], y: [15, 0, -15, 0, 15], rotate: [0, 15, 0, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 8.5, ease: "linear" }} 
              src={imgMilk} alt="Brookside Milk" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>

          {/* 10. Apples (Tucked behind bag, Center Right) */}
          <motion.div className="absolute top-[35%] right-[25%] md:right-[30%] w-[12%] md:w-[14%] z-[5] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, -10, 0, 10, 0], y: [-10, 0, 10, 0, -10], rotate: [0, -12, 0, 12, 0] }} 
              transition={{ repeat: Infinity, duration: 7.5, ease: "linear" }} 
              src={imgApples} alt="Fresh Apples" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>
          
          {/* 11. Butter (Tucked behind bag, Center Bottom) */}
          <motion.div className="absolute bottom-[25%] left-[45%] w-[10%] md:w-[12%] z-[5] opacity-50 pointer-events-none">
            <motion.img 
              animate={{ x: [0, 12, 0, -12, 0], y: [12, 0, -12, 0, 12], rotate: [0, 10, 0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 9.8, ease: "linear" }} 
              src={imgButter} alt="Blue Band Butter" className="w-full object-contain drop-shadow-md" 
            />
          </motion.div>

        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* ══════════════════════════════════════════
            2. VALUE PROP (I SHOP. YOU RELAX.)
        ══════════════════════════════════════════ */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[2.5rem] mb-6 overflow-hidden shadow-2xl bg-[#0F2318] dark:bg-[#0A1810]" 
          style={{ minHeight: 620 }}
        >
          {/* Abstract Background Elements */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full pointer-events-none opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(196,137,42,0.15) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />

          <div className="relative z-10 flex flex-col md:flex-row items-center h-full p-10 md:p-16 gap-10">

            {/* Left Content (Text) */}
            <div className="md:w-1/2 z-20">
              <h2
                className="mb-6 leading-[1.05] text-[clamp(3rem,5vw,4.5rem)] font-bold text-[#F5EDD8] tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                I shop.
                <br />
                <em className="text-[#C4892A] italic">You relax.</em>
              </h2>

              <p className="mb-10 text-lg leading-relaxed max-w-md text-[#F5EDD8]/70 font-light">
                Skip the crowded aisles and heavy bags. We meticulously curate your daily essentials and fresh produce, guaranteeing quality with every single delivery.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
                  <p className="text-xl mb-0.5" aria-hidden="true">⚡</p>
                  <p className="font-bold text-lg text-[#F5EDD8]">Fast</p>
                  <p className="text-xs text-[#F5EDD8]/45">Same-day delivery</p>
                </div>
                <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
                  <p className="text-xl mb-0.5" aria-hidden="true">🧺</p>
                  <p className="font-bold text-lg text-[#F5EDD8]">Fresh</p>
                  <p className="text-xs text-[#F5EDD8]/45">Hand-picked daily</p>
                </div>
              </div>
            </div>

            {/* Right Content (Floating Emoji Cards) */}
            <div className="md:w-1/2 relative h-[500px] w-full hidden md:block">
              {FLOATING_CARDS.map((card) => (
                <motion.div 
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ 
                    opacity: { duration: 0.6, delay: card.delay },
                    scale: { duration: 0.6, delay: card.delay },
                    y: { repeat: Infinity, duration: card.duration, ease: "easeInOut", delay: card.delay } 
                  }}
                  className={`absolute ${card.pos} bg-white/10 backdrop-blur-md border ${card.border} p-4 rounded-2xl shadow-2xl flex items-center gap-3 w-44 z-10 hover:z-30 hover:scale-105 transition-transform cursor-default`}
                >
                  <div className={`text-3xl ${card.color} p-2.5 rounded-xl shadow-inner`}>{card.icon}</div>
                  <div>
                    <p className="text-[#F5EDD8] font-bold text-sm leading-tight">{card.title}</p>
                    <p className="text-[#F5EDD8]/60 text-[10px] uppercase tracking-wider mt-0.5">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════
            SCROLLING TICKER
        ══════════════════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden mb-24 flex items-center shadow-sm h-12 bg-[#F5EDD8] border border-[#E8DDCA] dark:bg-[#0F2318] dark:border-white/5 transition-colors duration-300">
          <div className="flex gap-10 items-center whitespace-nowrap text-[13px] font-medium text-[#5C4A2A] dark:text-[#7DC57A]" style={{ animation: 'marquee 30s linear infinite' }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex-shrink-0">{item}</span>
            ))}
          </div>
          <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        </div>

        {/* ══════════════════════════════════════════
            3. HOW IT WORKS
        ══════════════════════════════════════════ */}
        <motion.section className="mb-24" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-2 text-[#7DC57A]">Simple process</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0F2318] dark:text-[#F5EDD8] leading-[1.1] tracking-[-0.02em] transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Your order, handled<br />start to finish.
              </h2>
            </div>
            <p className="text-sm max-w-xs leading-relaxed text-gray-500 dark:text-gray-400 font-light transition-colors duration-300">
              Eva does the running around so you can spend your time on what matters.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[2.5rem] left-[calc(16.666%+1.5rem)] right-[calc(16.666%+1.5rem)] h-px pointer-events-none bg-gradient-to-r from-[#D1E8CE] to-[#D1E8CE] dark:from-[#1A4D2E] dark:to-[#1A4D2E]" />

            {STEPS.map((step, i) => (
              <motion.div variants={fadeUp} key={i} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }} className="relative rounded-3xl p-8 group border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl bg-white dark:bg-[#0A1810] cursor-pointer transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                  <motion.div whileHover={{ rotate: 10 }} className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold bg-[#EBF5EA] dark:bg-[#1A4D2E]/30 text-[#2D6A27] dark:text-[#7DC57A]">
                    {step.num}
                  </motion.div>
                  <div className="text-gray-300 dark:text-gray-600 group-hover:text-[#7DC57A] transition-colors">{step.icon}</div>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white transition-colors duration-300">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="mt-12 rounded-[2.5rem] overflow-hidden h-[300px] relative">
            <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.8 }} src={bannerLogo} alt="Doorstep Delivery" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F2318]/90 to-transparent flex items-center p-10 md:p-16 pointer-events-none">
              <h3 className="text-3xl md:text-5xl font-bold text-white max-w-md" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Fresh groceries, straight to your kitchen table.
              </h3>
            </div>
          </motion.div>
        </motion.section>

        {/* ══════════════════════════════════════════
            4. FEATURED PRODUCTS
        ══════════════════════════════════════════ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="mb-24">
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-2 text-[#7DC57A]">Fresh & Stocked</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0F2318] dark:text-[#F5EDD8] leading-[1.1] tracking-[-0.02em] transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Featured Market Picks.
              </h2>
            </div>
            <Link to="/products" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3 text-[#2D6A27] dark:text-[#7DC57A] hover:text-brand-brown">
              View all products
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-24"><div className="w-10 h-10 rounded-full border-2 border-t-transparent border-[#D1E8CE] dark:border-white/10 !border-t-[#2D6A27] dark:!border-t-[#7DC57A] animate-spin" /></div>
          ) : featuredProducts.length === 0 ? (
            <div className="rounded-3xl p-16 text-center bg-[#F9F7F3] dark:bg-[#0A1810] border border-[#E8E0D4] dark:border-white/5 transition-colors duration-300">
              <p className="text-sm text-[#9CA3AF] dark:text-gray-500">No products available at the moment.</p>
            </div>
          ) : (
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} featured={idx === 0} />
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* ══════════════════════════════════════════
            5. TRUST BAND
        ══════════════════════════════════════════ */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[3rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 mb-24 relative overflow-hidden shadow-2xl bg-[#F5EDD8] dark:bg-[#0A1810] border border-[#E8DDCA] dark:border-white/5 transition-colors duration-300" 
        >
          {/* Subtle Sukuma Wiki Accent */}
          <img src={imgSukuma1} className="absolute right-0 bottom-0 w-80 opacity-[0.15] dark:opacity-10 mix-blend-multiply dark:mix-blend-screen pointer-events-none" alt="" />
          
          <div className="max-w-md relative z-10">
            <h3 className="text-[clamp(2rem,4vw,2.8rem)] font-bold text-[#0F2318] dark:text-[#F5EDD8] leading-[1.1] mb-4 transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Your personal shopper,<br />on demand.
            </h3>
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-light transition-colors duration-300">
              Eva curates meticulously, our riders navigate flawlessly — you simply open the door and enjoy.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
            {[
              { icon: '🛒', label: 'Eva shops for you' },
              { icon: '🚴', label: 'Fast delivery' },
              { icon: '💳', label: 'Easy payments' },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all bg-white dark:bg-[#1A2E18] border border-gray-100 dark:border-white/5">
                <span className="text-2xl" aria-hidden="true">{t.icon}</span>
                <span className="text-sm font-bold text-gray-800 dark:text-[#F5EDD8] transition-colors duration-300">{t.label}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════
            6. APP DOWNLOAD SECTION
        ══════════════════════════════════════════ */}
        <motion.section 
          id="download" // THE ID IS HERE FOR SCROLLING
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="mb-24 rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl relative bg-[#0F2318]"
        >
          {/* Subtle noise background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          <div className="p-10 md:p-20 md:w-1/2 relative z-10 text-center md:text-left">
            <motion.div variants={fadeUp}>
              <span className="text-brand-green font-bold tracking-widest uppercase text-xs mb-4 inline-block bg-brand-green/10 px-4 py-1.5 rounded-full border border-brand-green/20">
                Coming Soon
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#F5EDD8] mb-6 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Market Days, <br /> in your pocket.
              </h2>
              <p className="text-[#F5EDD8]/70 font-light mb-10 text-lg">
                Soon you will be able to track your personal shopper in real-time, save your favorite grocery lists, and get exclusive app-only deals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <motion.button whileHover={buttonHover} whileTap={buttonTap} className="bg-white dark:bg-[#1A2E18] text-gray-900 dark:text-white dark:border dark:border-white/10 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-3 opacity-80 cursor-not-allowed">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.85 3.73-.7 1.83.14 3.01.88 3.86 2.05-3.08 1.85-2.58 5.75.48 6.94-.65 1.58-1.57 3.08-3.15 3.88zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  <div className="text-left"><p className="text-[10px] leading-none font-normal uppercase tracking-wider">Download for</p><p className="leading-tight text-base">iOS</p></div>
                </motion.button>
                <motion.button whileHover={buttonHover} whileTap={buttonTap} className="bg-white dark:bg-[#1A2E18] text-gray-900 dark:text-white dark:border dark:border-white/10 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-3 opacity-80 cursor-not-allowed">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.609 1.814L13.792 12 3.61 22.186a1.983 1.983 0 01-.58-.87A2.08 2.08 0 013 20.528V3.472c0-.282.03-.553.11-.8.077-.253.23-.55.499-.858zM14.925 10.867l2.802-1.616a2.023 2.023 0 00.742-.71c.18-.28.271-.582.271-.884 0-.295-.088-.588-.261-.861a2.025 2.025 0 00-.713-.695l-12.83-7.4c-.198-.113-.393-.198-.582-.256l10.571 10.422zM15.008 13.123L4.35 23.684a2.21 2.21 0 00.662-.262l12.756-7.36c.264-.15.485-.355.656-.61.168-.251.258-.529.258-.813 0-.272-.081-.54-.236-.786a1.986 1.986 0 00-.638-.616l-2.799 1.614v-.004zM16.125 12l4.896-2.825 1.583.914c.896.516.896 1.354 0 1.871l-1.572.908L16.125 12z"/></svg>
                  <div className="text-left"><p className="text-[10px] leading-none font-normal uppercase tracking-wider">Download for</p><p className="leading-tight text-base">Android</p></div>
                </motion.button>
              </div>
            </motion.div>
          </div>
          
          {/* Floating CSS Phone Mockup */}
          <div className="md:w-1/2 flex justify-center items-end relative h-[400px] md:h-auto mt-10 md:mt-0 pb-10">
            <motion.div 
              animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-64 h-[500px] bg-white dark:bg-black rounded-[3rem] p-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-8 border-gray-800 dark:border-gray-700 relative z-20 translate-y-20 md:translate-y-32 transition-colors duration-300"
            >
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden relative bg-gray-50 dark:bg-gray-900">
                {/* Dynamic Content inside phone */}
                <img src={img01} alt="App UI" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2318] via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-4 right-4 bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 text-white shadow-xl">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1">Order #4092</p>
                  <p className="font-serif text-xl">Arriving in 15 mins</p>
                </div>
              </div>
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 dark:bg-gray-700 rounded-b-xl transition-colors duration-300"></div>
            </motion.div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════
            7. CONTACT US SECTION
        ══════════════════════════════════════════ */}
        <motion.section 
          id="contact" // THE ID IS HERE FOR SCROLLING
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="mb-24 rounded-[3rem] bg-white dark:bg-[#0A1810] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 p-10 md:p-16 transition-colors duration-300"
        >
          <div className="grid md:grid-cols-2 gap-16">
            
            {/* Left Side: Contact Info */}
            <motion.div variants={fadeUp} className="flex flex-col justify-center">
              <p className="text-xs font-bold tracking-widest uppercase mb-2 text-[#7DC57A]">Get in Touch</p>
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold text-[#0F2318] dark:text-[#F5EDD8] leading-[1.1] tracking-[-0.02em] mb-6 transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Have a special request? <br/> Let Eva know.
              </h2>
              <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-10 max-w-md transition-colors duration-300">
                Whether you need a specific brand of unga, have a question about delivery zones, or want to partner with us—we are always here to help.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#EBF5EA] dark:bg-[#1A4D2E]/30 text-[#2D6A27] dark:text-[#7DC57A] flex items-center justify-center transition-colors duration-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Us</p>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">hello@marketdays.co.ke</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#EBF5EA] dark:bg-[#1A4D2E]/30 text-[#2D6A27] dark:text-[#7DC57A] flex items-center justify-center transition-colors duration-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Call Us</p>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">+254 700 000 000</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side: Sleek Contact Form */}
            <motion.div variants={fadeUp} className="bg-[#F9F7F3] dark:bg-[#060D0A] rounded-[2rem] p-8 md:p-10 border border-[#E8E0D4] dark:border-white/5 transition-colors duration-300">
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide transition-colors duration-300">Full Name</label>
                  <input type="text" id="name" placeholder="John Doe" className="bg-white dark:bg-[#0F2318] dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-[#7DC57A] dark:focus:border-[#7DC57A] transition-colors text-sm" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide transition-colors duration-300">Email Address</label>
                  <input type="email" id="email" placeholder="john@example.com" className="bg-white dark:bg-[#0F2318] dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-[#7DC57A] dark:focus:border-[#7DC57A] transition-colors text-sm" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide transition-colors duration-300">Your Message</label>
                  <textarea id="message" rows="4" placeholder="How can Eva help you today?" className="bg-white dark:bg-[#0F2318] dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-[#7DC57A] dark:focus:border-[#7DC57A] transition-colors text-sm resize-none"></textarea>
                </div>

                <motion.button 
                  whileHover={buttonHover} whileTap={buttonTap} 
                  type="submit" 
                  className="bg-[#0F2318] dark:bg-[#7DC57A] text-[#F5EDD8] dark:text-[#0F2318] font-bold text-sm py-4 rounded-xl mt-2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.section>

      </div>

      {/* ══════════════════════════════════════════
          8. COMPREHENSIVE FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-[#0F2318] text-[#F5EDD8] pt-20 pb-10 px-4 mt-10 rounded-t-[3rem] border-t border-brand-green/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* Column 1: Brand */}
            <div className="col-span-1 md:col-span-1">
              {/* FIXED: Uses brandLogoTransparent so it matches Hero import */}
              <img src={brandLogoTransparent} alt="Market Days" className="h-14 rounded-xl mb-6 bg-white p-1" />
              <p className="text-[#F5EDD8]/60 text-sm leading-relaxed mb-6">
                Your personal concierge for everyday shopping. We curate, shop, and deliver the freshest essentials directly to your door.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Explore</h4>
              <ul className="space-y-4 text-sm text-[#F5EDD8]/70">
                <li><Link to="/products" className="hover:text-[#7DC57A] transition-colors">Marketplace</Link></li>
                <li><Link to="/about" className="hover:text-[#7DC57A] transition-colors">How it Works</Link></li>
                <li><Link to="/pricing" className="hover:text-[#7DC57A] transition-colors">Delivery Pricing</Link></li>
                <li><Link to="/login" className="hover:text-[#7DC57A] transition-colors">My Account</Link></li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div>
              <h4 className="font-bold text-lg mb-6 tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Support</h4>
              <ul className="space-y-4 text-sm text-[#F5EDD8]/70">
                <li><Link to="/faq" className="hover:text-[#7DC57A] transition-colors">FAQs</Link></li>
                <li><Link to="/contact" className="hover:text-[#7DC57A] transition-colors">Contact Eva</Link></li>
                <li><Link to="/terms" className="hover:text-[#7DC57A] transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-[#7DC57A] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 className="font-bold text-lg mb-6 tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Join the List</h4>
              <p className="text-sm text-[#F5EDD8]/70 mb-4">Get exclusive market deals and delivery discounts sent to your inbox.</p>
              <form className="flex border border-white/20 rounded-full overflow-hidden bg-white/5 focus-within:border-[#7DC57A] transition-colors">
                <input type="email" placeholder="Your email address" className="bg-transparent text-white px-4 py-3 w-full text-sm outline-none placeholder:text-white/30" />
                <button type="submit" className="bg-[#7DC57A] text-[#0F2318] px-5 font-bold text-sm hover:bg-[#6ab367] transition-colors">Join</button>
              </form>
            </div>
          </div>

          {/* Copyright & Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#F5EDD8]/40">
            <p>&copy; {new Date().getFullYear()} Market Days by Eva. All rights reserved.</p>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <a href="#" className="hover:text-white transition-colors">Instagram</a>
               <a href="#" className="hover:text-white transition-colors">Twitter</a>
               <a href="#" className="hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Product card sub-component ──────────────────────────────── */
function ProductCard({ product, featured }) {
  const price = product.variants?.length > 0 ? `KES ${parseFloat(product.variants[0].price).toLocaleString()}` : 'N/A';

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }} className="rounded-3xl overflow-hidden flex flex-col group bg-white dark:bg-[#0A1810] shadow-md border border-gray-100 dark:border-white/5 cursor-pointer transition-colors duration-300">
      <div className="h-48 relative overflow-hidden bg-gray-50 dark:bg-black">
        {product.image ? (
          <motion.img whileHover={{ scale: 1.08 }} transition={{ duration: 0.6 }} src={product.image} alt={product.name} className="object-cover h-full w-full" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300 dark:text-gray-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 21h15M3.75 3.75h16.5M12 3.75v13.5" /></svg>
          </div>
        )}
        {product.category?.name && (
          <span className="absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-white/90 dark:bg-black/60 text-gray-800 dark:text-gray-200 backdrop-blur-md shadow-sm transition-colors duration-300">
            {product.category.name}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-semibold text-base mb-1 text-gray-900 dark:text-white leading-snug transition-colors duration-300">{product.name}</h3>
        <p className="text-xs leading-relaxed mb-5 flex-grow line-clamp-2 text-gray-500 dark:text-gray-400 font-light transition-colors duration-300">{product.description}</p>
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
          <div>
            <p className="text-[9px] font-bold tracking-widest uppercase mb-0.5 text-gray-400 dark:text-gray-500">from</p>
            <span className="font-bold text-lg text-[#2D6A27] dark:text-[#7DC57A] transition-colors duration-300">{price}</span>
          </div>
          <Link to={`/products/${product.id}`} className="text-xs font-bold px-5 py-2.5 rounded-full transition-all bg-[#0F2318] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] hover:bg-brand-brown dark:hover:bg-white">
            View →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}