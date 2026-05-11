import { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the Context
const CartContext = createContext();

// 2. Create a Custom Hook for easy access
export const useCart = () => useContext(CartContext);

// 3. Create the Provider Component
export const CartProvider = ({ children }) => {
  
  // Initialize state by checking Local Storage FIRST
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('marketDaysCart');
    // If there is a saved cart, parse it. Otherwise, start empty.
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Whenever cartItems changes, immediately save it to Local Storage
  useEffect(() => {
    localStorage.setItem('marketDaysCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Function to add an item to the cart 
  const addToCart = (product, variant, quantityToAdd = 1) => {
    setCartItems(prevItems => {
      // Check if this exact product and size is already in the cart
      const existingItem = prevItems.find(
        item => item.product.id === product.id && item.variant.id === variant.id
      );

      if (existingItem) {
        // If it is, increase it by the specific quantity requested
        return prevItems.map(item =>
          item.product.id === product.id && item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }
      
      // If it's new, add it with the specific quantity requested
      return [...prevItems, { product, variant, quantity: quantityToAdd }];
    });
  };

  // Function to remove an item entirely
  const removeFromCart = (productId, variantId) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.product.id === productId && item.variant.id === variantId))
    );
  };

  // Calculate total items (counts unique product lines instead of total weight)
  const totalItems = cartItems.length;

  // Calculate total price
  const cartTotal = cartItems.reduce((total, item) => total + (item.variant.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, totalItems, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};