import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
      
      setSuccessMessage("Login successful! Redirecting...");
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      const errorDetail = error.response?.data?.detail;
      setErrorMessage(errorDetail || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

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
      if (data) {
        const firstErrorKey = Object.keys(data)[0];
        const msg = data[firstErrorKey];
        setErrorMessage(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative flex min-h-[550px]">
        
        {/* LEFT FORM: SIGN IN */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-gray-50">
          <h2 className="text-3xl font-black text-gray-900 mb-8">Sign In</h2>
          {isLogin && errorMessage && <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-2 rounded">{errorMessage}</p>}
          {isLogin && successMessage && <p className="text-green-600 text-xs font-bold mb-4 bg-green-50 p-2 rounded">{successMessage}</p>}
          
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" required 
                className="w-full border-b-2 py-3 focus:outline-none focus:border-brand-green bg-transparent transition-all"
                value={loginData.username} 
                onChange={(e) => setLoginData({...loginData, username: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
              <input 
                type="password" required 
                className="w-full border-b-2 py-3 focus:outline-none focus:border-brand-green bg-transparent transition-all"
                value={loginData.password} 
                onChange={(e) => setLoginData({...loginData, password: e.target.value})} 
              />
            </div>
            <button disabled={isLoading} className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold shadow-lg mt-4 transition-transform active:scale-95 disabled:opacity-50 uppercase tracking-wider">
              {isLoading && isLogin ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* RIGHT FORM: SIGN UP */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-gray-50">
          <h2 className="text-3xl font-black text-gray-900 mb-8">Create Account</h2>
          {!isLogin && errorMessage && <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-2 rounded">{errorMessage}</p>}
          
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" required 
                className="w-full border-b-2 py-2 focus:outline-none focus:border-brand-green bg-transparent transition-all"
                value={registerData.username}
                onChange={(e) => setRegisterData({...registerData, username: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</label>
              <input 
                type="email" required 
                className="w-full border-b-2 py-2 focus:outline-none focus:border-brand-green bg-transparent transition-all"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
              <input 
                type="password" required 
                className="w-full border-b-2 py-2 focus:outline-none focus:border-brand-green bg-transparent transition-all"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirm Password</label>
              <input 
                type="password" required 
                className="w-full border-b-2 py-2 focus:outline-none focus:border-brand-green bg-transparent transition-all"
                value={registerData.re_password}
                onChange={(e) => setRegisterData({...registerData, re_password: e.target.value})} 
              />
            </div>
            <button disabled={isLoading} className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold shadow-lg mt-4 transition-transform active:scale-95 disabled:opacity-50 uppercase tracking-wider">
              {isLoading && !isLogin ? 'Creating...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* OVERLAY PANEL */}
        <div 
          className={`absolute top-0 left-0 h-full w-1/2 bg-brand-green transition-transform duration-700 ease-in-out z-30 hidden md:flex flex-col items-center justify-center p-12 text-center text-brand-cream shadow-2xl`}
          style={{ transform: isLogin ? 'translateX(100%)' : 'translateX(0)' }}
        >
          <div className="space-y-6 flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-black tracking-tighter">MARKET DAYS</h1>
            <div className="py-8">
              <p className="text-2xl font-medium italic opacity-90 underline decoration-brand-brown underline-offset-8">I Shop. You Relax.</p>
            </div>
            <p className="text-sm font-medium opacity-80 max-w-xs mx-auto">
              {isLogin ? "Don't have an account yet? Join us to enjoy a seamless shopping experience." : "Already a member? Sign in to access your saved details."}
            </p>
            <button 
              type="button"
              onClick={toggleMode}
              className="mt-8 px-10 py-3 border-2 border-brand-brown rounded-full font-bold hover:bg-brand-brown transition-all uppercase tracking-widest text-xs"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}