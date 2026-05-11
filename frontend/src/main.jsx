import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx' // <-- Added import

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider> {/* <-- Wrapped the App */}
      <App />
    </CartProvider>
  </StrictMode>,
)