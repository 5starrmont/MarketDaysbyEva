import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import imgSukuma1 from '../../assets/images/Sukuma_Wiki_and_Roma_tomatoes_202605130018-removebg-preview.png';

// Staggered fade in animations
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function DashboardHome() {
  const { user } = useAuth(); // Pull dynamic user data
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mocking an API fetch for dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      // Simulate network delay
      setTimeout(() => {
        setKpis([
          { id: 1, label: 'Today\'s Sales', value: 'KES 42,350', change: '+12.5%', color: 'text-[#2D6A27] dark:text-[#7DC57A]', icon: '💰' },
          { id: 2, label: 'Pending Orders', value: '7', change: '-20%', color: 'text-brand-brown dark:text-[#C4892A]', icon: '🛒' },
          { id: 3, label: 'Low Stock Items', value: '3', change: '', color: 'text-red-600 dark:text-red-400', icon: '🥬' },
          { id: 4, label: 'Avg Order Value', value: 'KES 3,850', change: '+3%', color: 'text-gray-900 dark:text-white', icon: '💳' },
        ]);
        setLoading(false);
      }, 500);
    };
    
    fetchStats();
  }, []);

  const today = new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <motion.div 
      className="pb-20"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      
      {/* ─── Page Header with Dynamic Name ─── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-12 border-b border-gray-200 dark:border-white/10 pb-8 transition-colors">
        <div>
          <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold text-[#0F2318] dark:text-[#F5EDD8] leading-[1.1] tracking-[-0.02em] transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Welcome back, {user?.username || 'Manager'}.
          </h2>
          <p className="text-sm text-[#2D6A27] dark:text-[#7DC57A] tracking-wider uppercase font-bold mt-1.5 transition-colors">{today}</p>
        </div>
        <Link className="text-xs font-bold px-6 py-3 rounded-full transition-all bg-[#0F2318] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] hover:bg-brand-brown dark:hover:bg-white flex items-center gap-2 shadow-lg" to="/manager/inventory">
            Add New Product
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </Link>
      </motion.div>

      {/* ─── KPI Grid (Dynamic Data) ─── */}
      <motion.section variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {loading ? (
           // Skeleton loading state
           Array(4).fill(0).map((_, i) => (
             <div key={i} className="bg-white dark:bg-[#0A1810] rounded-[2rem] h-40 animate-pulse border border-gray-100 dark:border-white/5"></div>
           ))
        ) : (
          kpis.map((kpi) => (
            <div key={kpi.id} className="bg-white dark:bg-[#0A1810] rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-between mb-5">
                <span className="text-4xl" aria-hidden="true">{kpi.icon}</span>
                {kpi.change && (
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm transition-colors duration-300 ${kpi.change.startsWith('+') ? 'bg-[#EBF5EA] text-[#2D6A27] dark:bg-[#1A4D2E]/30 dark:text-[#7DC57A]' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {kpi.change} vs Yesterday
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 transition-colors">{kpi.label}</p>
              <p className={`text-3xl font-black transition-colors ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))
        )}
      </motion.section>

      {/* ─── Recent Orders placeholder section ─── */}
      <motion.section variants={fadeUp} className="bg-white dark:bg-[#0A1810] rounded-[2.5rem] p-10 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none mb-12 relative overflow-hidden transition-colors duration-300">
        <img src={imgSukuma1} className="absolute right-0 bottom-0 w-80 opacity-[0.03] dark:opacity-10 mix-blend-multiply dark:mix-blend-screen pointer-events-none" alt="" />
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <h3 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold text-[#0F2318] dark:text-[#F5EDD8] leading-[1.1] mb-4 transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Recent Orders <span className="font-light italic text-[#C4892A]">(Next Phase)</span>
          </h3>
          <Link className="hidden md:inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3 text-[#2D6A27] dark:text-[#7DC57A] hover:text-[#C4892A]" to="/manager/orders">
              View all orders
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </div>
        
        <div className="h-64 flex flex-col items-center justify-center text-center gap-4 bg-[#F9F7F3] dark:bg-[#0F2318]/50 rounded-[1.5rem] border-2 border-dashed border-[#E8E0D4] dark:border-white/10 p-10 relative z-10 transition-colors duration-300">
          <div className="w-16 h-16 rounded-full bg-[#EBF5EA] dark:bg-[#1A4D2E]/30 text-[#2D6A27] dark:text-[#7DC57A] flex items-center justify-center transition-colors duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.119-1.243l1.263-12c.078-.737.691-1.288 1.438-1.288h12.913c.747 0 1.36.55 1.438 1.288z" /></svg>
          </div>
          <div>
            <p className="text-xl font-medium text-gray-900 dark:text-[#F5EDD8] leading-snug transition-colors">Order Management UI incoming.</p>
            <p className="text-sm text-[#9CA3AF] dark:text-gray-400 mt-1.5 font-light transition-colors">Soon, real-time incoming orders will be listed here.</p>
          </div>
        </div>
      </motion.section>

      {/* ─── Inventory Management placeholder section ─── */}
      <motion.section variants={fadeUp} className="bg-white dark:bg-[#0A1810] rounded-[2.5rem] p-10 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden transition-colors duration-300">
        <div className="flex items-center justify-between mb-10 relative z-10">
          <h3 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold text-[#0F2318] dark:text-[#F5EDD8] leading-[1.1] mb-4 transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Pantry Inventory <span className="font-light italic text-[#C4892A]">(Next Phase)</span>
          </h3>
          <Link className="hidden md:inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3 text-[#2D6A27] dark:text-[#7DC57A] hover:text-[#C4892A]" to="/manager/inventory">
              Manage Inventory
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </div>
        
        <div className="h-64 flex flex-col items-center justify-center text-center gap-4 bg-[#F9F7F3] dark:bg-[#0F2318]/50 rounded-[1.5rem] border-2 border-dashed border-[#E8E0D4] dark:border-white/10 p-10 relative z-10 transition-colors duration-300">
           <div className="w-16 h-16 rounded-full bg-[#EBF5EA] dark:bg-[#1A4D2E]/30 text-[#2D6A27] dark:text-[#7DC57A] flex items-center justify-center transition-colors duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
          </div>
          <div>
            <p className="text-xl font-medium text-gray-900 dark:text-[#F5EDD8] leading-snug transition-colors">Inventory Management UI incoming.</p>
            <p className="text-sm text-[#9CA3AF] dark:text-gray-400 mt-1.5 font-light transition-colors">You will soon be able to add, edit, and restock products here.</p>
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
}