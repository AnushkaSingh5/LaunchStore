'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadSavedData = async () => {
      const savedCart = localStorage.getItem('luxe_cart');
      const savedWishlist = localStorage.getItem('luxe_wishlist');
      
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) { console.error('Failed to parse cart', e); }
      }
      
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) { console.error('Failed to parse wishlist', e); }
      }
    };
    loadSavedData();
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('luxe_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('luxe_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (product.stock !== undefined && newQty > product.stock) {
          alert(`Only ${product.stock} items in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      if (product.stock !== undefined && quantity > product.stock) {
        alert(`Only ${product.stock} items in stock.`);
        return prev;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price) || 0,
          image: product.image || product.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
          category: product.category || 'Uncategorized',
          store_id: product.store_id,
          store_slug: product.store_slug || product.store?.slug || '',
          stock: product.stock !== undefined ? product.stock : 999,
          quantity
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          if (item.stock !== undefined && newQty > item.stock) {
            alert(`Only ${item.stock} items in stock.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => wishlist.some(item => item.id === productId);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cart,
    setCart,
    cartCount,
    cartTotal,
    wishlist,
    toggleWishlist,
    isInWishlist,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
