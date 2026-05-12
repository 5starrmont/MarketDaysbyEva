import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Start loading as true so the app pauses rendering until we check the token
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('access');
    
    // If no token exists, immediately stop loading and render the logged-out app
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Djoser endpoint to get the current logged-in user details
      const res = await axios.get('http://127.0.0.1:8000/api/auth/users/me/', {
        headers: { Authorization: `JWT ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error("Session expired or invalid");
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      setUser(null);
    } finally {
      // Always stop loading once the API call finishes, success or fail
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Updated logout to accept a callback (like clearCart) to wipe all data at once
  const logout = (onLogout) => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    
    // Executes the cart clearing logic if provided
    if (onLogout && typeof onLogout === 'function') {
      onLogout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, fetchUser, loading }}>
      {/* This prevents the "logged out" flicker on refresh */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);