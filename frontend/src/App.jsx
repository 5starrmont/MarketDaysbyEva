import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Shop from './pages/Shop'; 
import ProductDetail from './pages/ProductDetail'; 
import Cart from './pages/Cart'; 
import Checkout from './pages/Checkout'; 
import Login from './pages/Login'; 
import Profile from './pages/Profile'; 
import { useCart } from './context/CartContext'; 
import { useAuth } from './context/AuthContext'; 

// Temporary placeholder page
function Home() { 
  return <div className="text-2xl font-bold text-brand-green">Welcome to Market Days</div>; 
}

function App() {
  const { totalItems, clearCart } = useCart(); // <-- Extract clearCart here
  const { user, logout } = useAuth(); 

  return (
    <Router>
      <div className="min-h-screen bg-brand-cream text-gray-900 font-sans">
        
        {/* Basic Navbar Foundation */}
        <nav className="bg-brand-green text-brand-cream p-4 shadow-md">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-wider">
              MARKET DAYS <span className="text-brand-brown text-sm">by Eva</span>
            </h1>
            <div className="flex gap-6 font-medium items-center">
              <Link to="/" className="hover:text-brand-brown transition-colors">Home</Link>
              <Link to="/products" className="hover:text-brand-brown transition-colors">Shop</Link>
              
              {/* Cart Link with Live Badge */}
              <Link to="/cart" className="relative hover:text-brand-brown transition-colors">
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-4 bg-brand-brown text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Dynamic Auth Section */}
              {user ? (
                <div className="flex items-center gap-4">
                  {/* Professional Account Link */}
                  <Link 
                    to="/profile" 
                    className="text-sm font-bold text-brand-brown bg-white/10 px-4 py-1.5 rounded-full hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Account
                  </Link>
                  <button 
                    onClick={() => logout(clearCart)} // <-- Pass clearCart as the callback
                    className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60 hover:opacity-100 hover:text-brand-brown transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-brand-brown text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all shadow-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Page Content Rendered Here */}
        <main className="max-w-6xl mx-auto py-8 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Shop />} /> 
            <Route path="/products/:id" element={<ProductDetail />} /> 
            <Route path="/cart" element={<Cart />} /> 
            <Route path="/checkout" element={<Checkout />} /> 
            <Route path="/login" element={<Login />} /> 
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;