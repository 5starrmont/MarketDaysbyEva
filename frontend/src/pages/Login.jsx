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

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Back to Home Link */}
      <Link to="/" className="mb-8 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#0F2318] transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        Return Home
      </Link>

      {/* ─── THE MAIN CARD ─── */}
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl shadow-gray-200/60 relative flex min-h-[600px] border border-gray-100 overflow-hidden">
        
        {/* 1. THE FORMS LAYER (Sits in the back) */}
        <div className="w-full flex">
          
          {/* Register Form (Left Side) */}
          <div className={`w-1/2 p-10 md:p-16 flex flex-col justify-center transition-all duration-500 ${isLogin ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <p className="text-[#7DC57A] font-bold tracking-[0.2em] uppercase text-[10px] mb-2">Join Marketplace</p>
            <h2 className="text-4xl font-black text-[#0F2318] mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Sign Up.</h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" required value={registerData.username} onChange={(e) => setRegisterData({...registerData, username: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-[#7DC57A] transition-all font-medium text-[#0F2318]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" required value={registerData.email} onChange={(e) => setRegisterData({...registerData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-[#7DC57A] transition-all font-medium text-[#0F2318]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <input type="password" required value={registerData.password} onChange={(e) => setRegisterData({...registerData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-[#7DC57A] transition-all font-medium text-[#0F2318]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <input type="password" required value={registerData.re_password} onChange={(e) => setRegisterData({...registerData, re_password: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-[#7DC57A] transition-all font-medium text-[#0F2318]" />
              </div>
              <button disabled={isLoading} className="w-full bg-[#0F2318] text-[#F5EDD8] py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl mt-4 disabled:opacity-50">SIGN UP</button>
            </form>
          </div>

          {/* Login Form (Right Side) */}
          <div className={`w-1/2 p-10 md:p-16 flex flex-col justify-center transition-all duration-500 ${!isLogin ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <p className="text-[#7DC57A] font-bold tracking-[0.2em] uppercase text-[10px] mb-2">Member Access</p>
            <h2 className="text-4xl font-black text-[#0F2318] mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Sign In.</h2>
            {isLogin && errorMessage && <p className="text-red-500 text-[10px] font-bold mb-4 uppercase tracking-wider">{errorMessage}</p>}
            {isLogin && successMessage && <p className="text-green-600 text-[10px] font-bold mb-4 uppercase tracking-wider">{successMessage}</p>}
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name / Username</label>
                <input type="text" required value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:bg-white focus:border-[#7DC57A] transition-all font-medium text-[#0F2318]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <input type="password" required value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:bg-white focus:border-[#7DC57A] transition-all font-medium text-[#0F2318]" />
              </div>
              <button disabled={isLoading} className="w-full bg-[#0F2318] text-[#F5EDD8] py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl mt-4">SIGN IN</button>
            </form>
          </div>
        </div>

        {/* 2. THE OVERLAY CURTAIN (The sliding part) */}
        <motion.div 
          animate={{ x: isLogin ? '0%' : '-100%' }}
          transition={springTransition}
          className="absolute top-0 left-0 h-full w-1/2 bg-[#0F2318] z-30 hidden md:flex flex-col items-center justify-center p-12 text-center text-[#F5EDD8] shadow-2xl overflow-hidden"
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
              className="px-10 py-3 border border-[#C4892A]/50 text-[#C4892A] rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg"
            >
              {isLogin ? "Create Account" : "Sign In"}
            </motion.button>
          </div>
        </motion.div>

        {/* 3. MOBILE TOGGLE (Footer for phones) */}
        <div className="md:hidden p-6 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={toggleMode} className="ml-2 text-[#C4892A] font-bold underline">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
        </div>

      </div>
    </div>
  );
}