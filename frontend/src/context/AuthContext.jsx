import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('access');
    if (token) {
      try {
        // Djoser endpoint to get the current logged-in user details
        const res = await axios.get('http://127.0.0.1:8000/api/auth/users/me/', {
          headers: { Authorization: `JWT ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error("Session expired");
        logout();
      }
    }
    setLoading(false);
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
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);