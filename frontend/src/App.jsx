import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Shop from './pages/Shop'; 
import ProductDetail from './pages/ProductDetail'; 
import Cart from './pages/Cart'; // <-- Imported your real Cart page
import { useCart } from './context/CartContext'; 

// Temporary placeholder page
function Home() { 
  return <div className="text-2xl font-bold text-brand-green">Welcome to Market Days</div>; 
}

function App() {
  const { totalItems } = useCart(); // <-- Pull the live total items count!

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
            </div>
          </div>
        </nav>

        {/* Page Content Rendered Here */}
        <main className="max-w-6xl mx-auto py-8 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Shop />} /> 
            <Route path="/products/:id" element={<ProductDetail />} /> 
            <Route path="/cart" element={<Cart />} /> {/* <-- Now points to your real component */}
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;