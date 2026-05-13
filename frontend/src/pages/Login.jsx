import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/* ─── Animation Config ───────────────────────────────────────── */
const springTransition = { type: "spring", stiffness: 120, damping: 20 };

export default function Login() {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    username: '', email: '', password: '', re_password: '' 
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/jwt/create/', {
        username: loginData.username,
        password: loginData.password,
      });
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      await fetchUser();
      setSuccessMessage("Welcome back! Redirecting...");
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      setErrorMessage("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.re_password) {
      setErrorMessage("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/auth/users/', {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        re_password: registerData.re_password, 
      });
      setSuccessMessage("Account created! You can now sign in.");
      setIsLogin(true); 
    } catch (error) {
      const data = error.response?.data;
      setErrorMessage(data ? Object.values(data)[0][0] : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Social Login Buttons Component ─── */
  const SocialButtons = ({ action }) => (
    <div className="mt-6">
      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-gray-100 dark:border-white/10"></div>
        <span className="flex-shrink-0 mx-4 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">
          Or {action} with
        </span>
        <div className="flex-grow border-t border-gray-100 dark:border-white/10"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button type="button" className="flex items-center justify-center gap-3 py-3 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-xs font-bold text-gray-700 dark:text-white transition-colors duration-300">Google</span>
        </button>
        <button type="button" className="flex items-center justify-center gap-3 py-3 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          <svg className="w-5 h-5 text-black dark:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.89-1.99 1.57-3.107 1.57-.087 0-.175-.02-.263-.04.045-1.07.56-2.2 1.258-2.99.704-.84 1.832-1.47 2.92-1.57.02.02.04.04.04.04.13.44.33 1.16.33 1.91zm-4.32 18.23c-1.28 0-1.87-.79-3.23-.79-1.38 0-2.07.82-3.25.82-1.25 0-3.32-2.61-4.14-5.32-.87-2.88-.36-6.19 1.63-7.79 1.19-.96 2.51-1.2 3.43-1.2 1.48 0 2.52.84 3.73.84 1.14 0 2.42-.89 4.14-.89 1.27.02 3.12.56 4.23 2.07-3.41 1.8-2.73 6.27.75 7.56-1.03 2.5-2.79 4.7-4.29 4.7z"/>
          </svg>
          <span className="text-xs font-bold text-gray-700 dark:text-white transition-colors duration-300">Apple</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center p-4 bg-[#F9F7F3] dark:bg-[#060D0A] transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Back to Home Link */}
      <Link to="/" className="mb-8 flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-[#0F2318] dark:hover:text-white transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        Return Home
      </Link>

      {/* ─── THE MAIN CARD ─── */}
      <div className="max-w-5xl w-full bg-white dark:bg-[#0A1810] rounded-[3rem] shadow-2xl shadow-gray-200/60 dark:shadow-none relative flex flex-col md:flex-row min-h-[650px] border border-gray-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
        
        {/* 1. THE FORMS LAYER (Sits in the back on desktop, stacked on mobile) */}
        <div className="w-full flex relative z-10 flex-grow">
          
          {/* Register Form (Left Side) */}
          <div className={`w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex-col justify-center transition-all duration-500 
            ${isLogin ? 'hidden md:flex opacity-0 scale-95 pointer-events-none' : 'flex opacity-100 scale-100'}
          `}>
            <p className="text-[#7DC57A] font-bold tracking-[0.2em] uppercase text-[10px] mb-2">Join Marketplace</p>
            <h2 className="text-4xl font-black text-[#0F2318] dark:text-[#F5EDD8] mb-8 transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Sign Up.</h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors duration-300">Full Name</label>
                <input type="text" required value={registerData.username} onChange={(e) => setRegisterData({...registerData, username: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:bg-white dark:focus:bg-[#0A1810] focus:border-[#7DC57A] dark:focus:border-[#7DC57A] transition-all font-medium text-[#0F2318] dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors duration-300">Email</label>
                <input type="email" required value={registerData.email} onChange={(e) => setRegisterData({...registerData, email: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:bg-white dark:focus:bg-[#0A1810] focus:border-[#7DC57A] dark:focus:border-[#7DC57A] transition-all font-medium text-[#0F2318] dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors duration-300">Password</label>
                <input type="password" required value={registerData.password} onChange={(e) => setRegisterData({...registerData, password: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:bg-white dark:focus:bg-[#0A1810] focus:border-[#7DC57A] dark:focus:border-[#7DC57A] transition-all font-medium text-[#0F2318] dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors duration-300">Confirm Password</label>
                <input type="password" required value={registerData.re_password} onChange={(e) => setRegisterData({...registerData, re_password: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:bg-white dark:focus:bg-[#0A1810] focus:border-[#7DC57A] dark:focus:border-[#7DC57A] transition-all font-medium text-[#0F2318] dark:text-white" />
              </div>
              <button disabled={isLoading} className="w-full bg-[#0F2318] dark:bg-[#7DC57A] text-[#F5EDD8] dark:text-[#0F2318] py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl mt-4 hover:bg-[#1A2E18] dark:hover:bg-white transition-colors duration-300 disabled:opacity-50">SIGN UP</button>
            </form>
            <SocialButtons action="sign up" />
          </div>

          {/* Login Form (Right Side) */}
          <div className={`w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex-col justify-center transition-all duration-500 
            ${!isLogin ? 'hidden md:flex opacity-0 scale-95 pointer-events-none' : 'flex opacity-100 scale-100'}
          `}>
            <p className="text-[#7DC57A] font-bold tracking-[0.2em] uppercase text-[10px] mb-2">Member Access</p>
            <h2 className="text-4xl font-black text-[#0F2318] dark:text-[#F5EDD8] mb-8 transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Sign In.</h2>
            {isLogin && errorMessage && <p className="text-red-500 text-[10px] font-bold mb-4 uppercase tracking-wider">{errorMessage}</p>}
            {isLogin && successMessage && <p className="text-[#7DC57A] text-[10px] font-bold mb-4 uppercase tracking-wider">{successMessage}</p>}
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors duration-300">Username</label>
                <input type="text" required value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:bg-white dark:focus:bg-[#0A1810] focus:border-[#7DC57A] dark:focus:border-[#7DC57A] transition-all font-medium text-[#0F2318] dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors duration-300">Password</label>
                <input type="password" required value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:bg-white dark:focus:bg-[#0A1810] focus:border-[#7DC57A] dark:focus:border-[#7DC57A] transition-all font-medium text-[#0F2318] dark:text-white" />
              </div>
              <button disabled={isLoading} className="w-full bg-[#0F2318] dark:bg-[#7DC57A] text-[#F5EDD8] dark:text-[#0F2318] py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl mt-4 hover:bg-[#1A2E18] dark:hover:bg-white transition-colors duration-300 disabled:opacity-50">SIGN IN</button>
            </form>
            <SocialButtons action="sign in" />
          </div>
        </div>

        {/* 2. THE OVERLAY CURTAIN (The sliding part - hidden on mobile) */}
        <motion.div 
          animate={{ x: isLogin ? '0%' : '-100%' }}
          transition={springTransition}
          className="absolute top-0 left-0 h-full w-1/2 bg-[#0F2318] dark:bg-[#060D0A] border-r border-white/5 z-30 hidden md:flex flex-col items-center justify-center p-12 text-center text-[#F5EDD8] shadow-2xl overflow-hidden transition-colors duration-300"
          style={{ left: isLogin ? '0%' : '100%' }}
        >
          {/* Background visuals */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7DC57A]/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 space-y-8 max-w-xs">
            <h1 className="text-2xl font-black tracking-[0.3em] uppercase opacity-80">Market Days</h1>
            <div className="py-4">
              <p className="text-4xl font-bold leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {isLogin ? "I shop. \nYou relax." : "The Market, \nDelivered."}
              </p>
              <div className="h-1.5 w-12 bg-[#C4892A] mx-auto mt-6 rounded-full"></div>
            </div>
            <p className="text-xs font-light opacity-60 leading-relaxed uppercase tracking-wider">
              {isLogin ? "Need an account?" : "Welcome back."}
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={toggleMode}
              className="px-10 py-3 border border-[#C4892A]/50 text-[#C4892A] rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-[#C4892A]/10 transition-colors"
            >
              {isLogin ? "Create Account" : "Sign In"}
            </motion.button>
          </div>
        </motion.div>

        {/* 3. MOBILE TOGGLE (Footer visible only on phones) */}
        <div className="md:hidden p-6 bg-gray-50 dark:bg-[#0F2318]/50 border-t border-gray-100 dark:border-white/5 text-center w-full z-20 mt-auto transition-colors duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={toggleMode} type="button" className="ml-2 text-[#C4892A] font-bold underline">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
        </div>

      </div>
    </div>
  );
}