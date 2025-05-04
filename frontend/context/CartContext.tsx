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
  addToCart: (productId: string, quantity: number, productDetails?: Partial<CartItem['product']>) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
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
      setInitialLoad(false);
      return;
    }

    // Only show loading on initial load
    const isInitialLoading = initialLoad;
    if (isInitialLoading) {
      setLoading(true);
    }

    try {
      // Use the correct endpoint from backend/src/index.ts (/cart)
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
      setError(null);
    } catch (err) {
      // Don't overwrite local cart on error to maintain UI consistency
      if (!cart) {
        setError('Failed to fetch cart');
      }
      console.error('Error fetching cart:', err);
    } finally {
      if (isInitialLoading) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  // Generate a temporary ID for optimistic updates
  const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;

  // Add item to cart
  const addToCart = async (productId: string, quantity: number, productDetails?: Partial<CartItem['product']>) => {
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
        } else if (productDetails) {
          // Create a temporary item with available product details
          const tempItem: CartItem = {
            id: generateTempId(),
            productId,
            quantity,
            product: {
              id: productId,
              name: productDetails.name || 'Loading...',
              price: productDetails.price || 0,
              description: productDetails.description || '',
              images: productDetails.images || [{url: ''}]
            }
          };
          
          setCart({
            ...cart,
            cartItems: [...cart.cartItems, tempItem]
          });
        }
      }
      
      // Use the correct endpoint from backend/src/index.ts (/cart/items)
      await axios.post(
        `${API_URL}/cart/items`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Silently refresh cart to get the actual server state
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

    // Optimistic update - clear cart immediately
    const originalCart = cart;
    setCart(cart ? { ...cart, cartItems: [] } : null);
    
    try {
      // Use the correct endpoint from backend/src/index.ts (/cart)
      await axios.delete(
        `${API_URL}/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Cart cleared');
    } catch (err: any) {
      // Restore original cart on failure
      setCart(originalCart);
      setError(err.response?.data?.message || 'Failed to clear cart');
      toast.error(err.response?.data?.message || 'Failed to clear cart');
    }
  };

  // Fetch cart when user or token changes
  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCart(null);
      setInitialLoad(false);
    }
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