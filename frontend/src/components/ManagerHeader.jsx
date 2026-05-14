import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import brandLogoTransparent from '../assets/logos/logo-removebg-preview.png';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// ─── THEME TOGGLE FOR MANAGER HEADER ───
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center w-14 h-7 p-1 rounded-full cursor-pointer transition-colors duration-500 border focus:outline-none ${
        theme === 'dark' 
        ? 'bg-[#1A2E18] border-[#7DC57A]/30' 
        : 'bg-white/50 border-gray-300 shadow-inner'
      }`}
      aria-label="Toggle Dark Mode"
    >
      <motion.div 
        animate={{ x: theme === 'dark' ? 26 : 0 }} 
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute w-5 h-5 bg-[#C4892A] rounded-full flex items-center justify-center shadow-lg"
      >
        {theme === 'dark' ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-[#0F2318]"><path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59M21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.757 17.834a.75.75 0 00-1.06 1.06l1.591 1.591a.75.75 0 001.06-1.06l-1.59-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" /></svg>
        )}
      </motion.div>
    </button>
  );
};

const navItems = [
  { label: 'Overview', path: '/manager/dashboard', icon: '📊' },
  { label: 'Orders', path: '/manager/orders', icon: '🛒' },
  { label: 'Inventory', path: '/manager/inventory', icon: '🥬' },
];

export default function ManagerHeader() {
  const location = useLocation();
  const { user } = useAuth(); 

  return (
    <header className="bg-[#F9F7F3]/85 dark:bg-[#060D0A]/85 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 shadow-sm fixed top-0 left-0 right-0 z-50 h-20 transition-colors duration-300">
      <nav className="h-full px-6 md:px-10 flex items-center justify-between max-w-[1920px] mx-auto">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/manager/dashboard" className="flex items-center gap-3 group">
            <img 
              src={brandLogoTransparent} 
              alt="Market Days" 
              className="h-10 w-auto object-contain bg-[#EBF5EA] dark:bg-white/5 p-1 rounded-md transition-transform group-hover:scale-105" 
            />
            <h1 className="font-black text-xl tracking-widest text-gray-900 dark:text-[#F5EDD8] transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
              MANAGER
            </h1>
          </Link>
        </div>

        {/* Dynamic Nav Links */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#0F2318] p-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm transition-colors duration-300">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link 
                key={item.label}
                to={item.path}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 
                  ${isActive 
                    ? 'bg-[#0F2318] text-[#F5EDD8] dark:bg-[#7DC57A] dark:text-[#0F2318] shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Area & Theme Toggle */}
        <div className="flex items-center gap-6">
          <ThemeToggle />
          
          <button className="text-gray-400 hover:text-[#2D6A27] dark:hover:text-[#7DC57A] relative transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C4892A] text-[#0F2318] text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">2</span>
          </button>
          
          <div className="w-10 h-10 rounded-full bg-[#EBF5EA] dark:bg-[#7DC57A] text-[#2D6A27] dark:text-[#0F2318] font-black flex items-center justify-center shadow-inner uppercase text-sm border border-gray-200 dark:border-transparent transition-colors">
            {user?.username?.charAt(0) || 'I'}
          </div>
        </div>
      </nav>
    </header>
  );
}