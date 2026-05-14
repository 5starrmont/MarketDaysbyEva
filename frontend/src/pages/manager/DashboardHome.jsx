import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function DashboardHome() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access');
        const config = { headers: { Authorization: `JWT ${token}` } };
        
        const [ordersRes, inventoryRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/orders/orders/', config),
          axios.get('http://127.0.0.1:8000/api/inventory/products/', config)
        ]);

        setOrders(ordersRes.data);
        setInventory(inventoryRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ─── KPI CALCULATIONS ───
  const pendingOrders = orders.filter(o => !o.status || o.status.toLowerCase() === 'pending');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Completed');
  
  const totalRevenue = deliveredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  
  let lowStockCount = 0;
  inventory.forEach(product => {
    product.variants?.forEach(variant => {
      const stock = parseInt(variant.stock_quantity || 0);
      const threshold = parseInt(variant.reorder_level || 10);
      if (stock > 0 && stock <= threshold) lowStockCount++;
      if (stock === 0) lowStockCount++; // Count out of stock as alerts too
    });
  });

  if (loading) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[#D1E8CE] dark:border-[#1A4D2E] !border-t-[#2D6A27] dark:!border-t-[#7DC57A] animate-spin mb-4"></div>
        <p className="text-[#2D6A27] dark:text-[#7DC57A] font-bold tracking-widest uppercase text-xs">Loading Overview...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-gray-200 dark:border-white/10 pb-6 transition-colors">
        <div>
          <h2 className="text-[clamp(2rem,3vw,3rem)] font-bold text-[#0F2318] dark:text-[#F5EDD8] leading-[1.1]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Business Overview
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
            Real-time Store Performance
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/manager/orders" className="bg-[#0F2318] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#1A2E18] dark:hover:bg-white transition-colors shadow-lg">
            Dispatch Orders
          </Link>
        </div>
      </div>

      {/* ─── KPI METRICS GRID ─── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* Metric: Revenue */}
        <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="relative bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden cursor-default group flex flex-col justify-between min-h-[220px]">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#C4892A]/20 dark:bg-[#C4892A]/10 rounded-full blur-3xl group-hover:bg-[#C4892A]/30 transition-all duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-[#C4892A]/10 rounded-2xl text-[#C4892A] shadow-inner">
              <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">KES {totalRevenue.toLocaleString()}</p>
            <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Revenue</p>
          </div>
        </motion.div>

        {/* Metric: Pending Orders */}
        <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="relative bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden cursor-default group flex flex-col justify-between min-h-[220px]">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-500 shadow-inner">
              <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <p className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-1">{pendingOrders.length}</p>
            <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pending Orders</p>
          </div>
        </motion.div>

        {/* Metric: Total Orders */}
        <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="relative bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden cursor-default group flex flex-col justify-between min-h-[220px]">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#7DC57A]/20 dark:bg-[#7DC57A]/10 rounded-full blur-3xl group-hover:bg-[#7DC57A]/30 transition-all duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-[#EBF5EA] dark:bg-[#7DC57A]/10 rounded-2xl text-[#2D6A27] dark:text-[#7DC57A] shadow-inner">
              <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{orders.length}</p>
            <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Orders</p>
          </div>
        </motion.div>

        {/* Metric: Stock Alerts */}
        <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="relative bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-red-200/50 dark:border-red-500/20 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden cursor-default group flex flex-col justify-between min-h-[220px]">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/30 transition-all duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl text-red-500 shadow-inner">
              <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <p className="text-4xl font-black text-red-600 dark:text-red-400 mb-1">{lowStockCount}</p>
            <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Stock Alerts</p>
          </div>
        </motion.div>

      </motion.div>

      {/* ─── QUICK ACTIONS & LISTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders Panel */}
        <div className="bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Action Needed</h3>
            <Link to="/manager/orders" className="text-xs font-bold uppercase tracking-widest text-[#2D6A27] dark:text-[#7DC57A] hover:underline">View All</Link>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {pendingOrders.slice(0, 5).map(order => (
              <div key={order.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900 dark:text-[#F5EDD8]">{order.customer_name || 'Guest'}</p>
                  <p className="text-xs text-gray-500 font-medium">Order #{order.id} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#2D6A27] dark:text-[#7DC57A]">KES {parseFloat(order.total_amount).toLocaleString()}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20">
                    Pending
                  </span>
                </div>
              </div>
            ))}
            {pendingOrders.length === 0 && (
              <p className="text-gray-400 py-4 text-sm font-medium">You are all caught up! No pending orders.</p>
            )}
          </div>
        </div>

        {/* Catalog Overview Panel */}
        <div className="bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Catalog Health</h3>
            <Link to="/manager/inventory" className="text-xs font-bold uppercase tracking-widest text-[#2D6A27] dark:text-[#7DC57A] hover:underline">Manage</Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Active Products</p>
                  <p className="text-xs text-gray-500">Live on storefront</p>
                </div>
              </div>
              <span className="font-black text-xl text-gray-900 dark:text-white">{inventory.filter(p => p.is_active).length}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Low Stock Items</p>
                  <p className="text-xs text-gray-500">Need immediate restock</p>
                </div>
              </div>
              <span className="font-black text-xl text-red-600 dark:text-red-400">{lowStockCount}</span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}