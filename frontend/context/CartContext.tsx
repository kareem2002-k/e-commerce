"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    images: { url: string }[];
  };
}

interface Cart {
  id: string;
  userId: string;
  cartItems: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addingToCart: boolean;
  updatingCart: Record<string, boolean>;
  removingFromCart: Record<string, boolean>;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [updatingCart, setUpdatingCart] = useState<Record<string, boolean>>({});
  const [removingFromCart, setRemovingFromCart] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  // Calculate total items in cart
  const itemCount = cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  
  // Calculate total price
  const totalPrice = cart?.cartItems?.reduce(
    (total, item) => total + (item.product.price * item.quantity), 
    0
  ) || 0;

  // Get API URL with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Fetch cart from API
  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Use the correct endpoint from backend/src/index.ts (/cart)
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, quantity: number) => {
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      setAddingToCart(true);
      
      // Optimistic update - add to cart immediately for better UX
      if (cart) {
        // Check if item already exists
        const existingItemIndex = cart.cartItems.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
          // Item exists, update quantity
          const updatedCartItems = [...cart.cartItems];
          updatedCartItems[existingItemIndex] = {
            ...updatedCartItems[existingItemIndex],
            quantity: updatedCartItems[existingItemIndex].quantity + quantity
          };
          
          setCart({
            ...cart,
            cartItems: updatedCartItems
          });
        } else {
          // If product information is available from elsewhere in the app
          // we could add it here for a more complete optimistic update
        }
      }
      
      // Use the correct endpoint from backend/src/index.ts (/cart/items)
      const response = await axios.post(
        `${API_URL}/cart/items`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh cart after adding to get the actual server state
      await fetchCart();
      toast.success('Item added to cart');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item to cart');
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
      
      // If the API call failed, revert the optimistic update by re-fetching
      await fetchCart();
    } finally {
      setAddingToCart(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId: string, quantity: number) => {
    if (!token || !cart) return;

    try {
      // Track updating state for this specific item
      setUpdatingCart(prev => ({ ...prev, [itemId]: true }));
      
      // Optimistic update
      const updatedCartItems = cart.cartItems.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity };
        }
        return item;
      });
      
      setCart({
        ...cart,
        cartItems: updatedCartItems
      });
      
      // Use the correct endpoint from backend/src/index.ts (/cart/items/:id)
      await axios.put(
        `${API_URL}/cart/items/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // No need to refresh cart as we already updated it optimistically
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update cart item');
      toast.error(err.response?.data?.message || 'Failed to update cart item');
      
      // If the API call failed, revert the optimistic update by re-fetching
      await fetchCart();
    } finally {
      setUpdatingCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Remove item from cart
  const removeCartItem = async (itemId: string) => {
    if (!token || !cart) return;

    try {
      // Track removing state for this specific item
      setRemovingFromCart(prev => ({ ...prev, [itemId]: true }));
      
      // Optimistic update - remove item immediately
      const updatedCartItems = cart.cartItems.filter(item => item.id !== itemId);
      setCart({
        ...cart,
        cartItems: updatedCartItems
      });
      
      // Use the correct endpoint from backend/src/index.ts (/cart/items/:id)
      await axios.delete(
        `${API_URL}/cart/items/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // No need to refresh cart as we already updated it optimistically
      toast.success('Item removed from cart');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove item from cart');
      toast.error(err.response?.data?.message || 'Failed to remove item from cart');
      
      // If the API call failed, revert the optimistic update by re-fetching
      await fetchCart();
    } finally {
      setRemovingFromCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Use the correct endpoint from backend/src/index.ts (/cart)
      await axios.delete(
        `${API_URL}/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Clear the cart locally immediately
      setCart(cart ? { ...cart, cartItems: [] } : null);
      toast.success('Cart cleared');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear cart');
      toast.error(err.response?.data?.message || 'Failed to clear cart');
      
      // If the API call failed, revert by re-fetching
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart when user or token changes
  useEffect(() => {
    fetchCart();
  }, [user, token]);

  const value = {
    cart,
    loading,
    addingToCart,
    updatingCart,
    removingFromCart,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    itemCount,
    totalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 