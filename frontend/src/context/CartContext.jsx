import { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the Context
const CartContext = createContext();

// 2. Create a Custom Hook for easy access
export const useCart = () => useContext(CartContext);

// 3. Create the Provider Component
export const CartProvider = ({ children }) => {
  
  // Initialize state by checking Local Storage FIRST (with crash protection)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('marketDaysCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from local storage", error);
      return [];
    }
  });

  // Whenever cartItems changes, immediately save it to Local Storage
  useEffect(() => {
    localStorage.setItem('marketDaysCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Function to add an item to the cart 
  const addToCart = (product, variant, quantityToAdd = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.product.id === product.id && item.variant.id === variant.id
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id && item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }
      
      return [...prevItems, { product, variant, quantity: quantityToAdd }];
    });
  };

  // Function to explicitly set a new quantity (useful for a Cart page input field)
  const updateQuantity = (productId, variantId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId && item.variant.id === variantId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Function to remove an item entirely
  const removeFromCart = (productId, variantId) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.product.id === productId && item.variant.id === variantId))
    );
  };

  // Clears state AND wipes Local Storage to ensure a clean slate
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('marketDaysCart');
  };

  // Calculate total items (counts unique product lines)
  const totalItems = cartItems.length;

  // Calculate total price
  const cartTotal = cartItems.reduce((total, item) => total + (item.variant.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart, 
      totalItems, 
      cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};