import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function ManagerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear errors when typing
  };

  const handleManagerLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Get JWT Tokens
      const tokenRes = await axios.post('http://127.0.0.1:8000/api/auth/jwt/create/', formData);
      const access = tokenRes.data.access;
      const refresh = tokenRes.data.refresh;

      // 2. Fetch the User Profile to check permissions
      const userRes = await axios.get('http://127.0.0.1:8000/api/auth/users/me/', {
        headers: { Authorization: `JWT ${access}` }
      });

      const user = userRes.data;

      // 3. Security Gate: Ensure the user is actually staff/superuser
      if (user.is_staff || user.is_superuser) {
        // Safe to let them in! Save tokens to local storage.
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        
        // Redirect directly to the dispatch hub
        navigate('/manager/orders');
      } else {
        // They are just a normal customer. Deny access.
        setError('Access Denied. This portal is strictly for authorized personnel.');
      }
    } catch (err) {
      setError('Invalid credentials. Please verify your manager username and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060D0A] flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Background Styling elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #7DC57A 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#1A4D2E]/20 blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-[#7DC57A]"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          </div>
          <h1 className="text-4xl font-black text-[#F5EDD8] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Manager Portal</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Market Days by Eva • Authorized Access</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleManagerLogin} className="space-y-6">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Username</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#7DC57A] focus:ring-1 focus:ring-[#7DC57A] transition-all font-medium"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#7DC57A] focus:ring-1 focus:ring-[#7DC57A] transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#7DC57A] hover:bg-[#68A865] text-[#0F2318] py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#7DC57A]/20 transition-all disabled:opacity-50 mt-4"
            >
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}