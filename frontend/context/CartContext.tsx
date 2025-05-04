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

interface LocalCart {
  id: string;
  cartItems: LocalCartItem[];
  lastSynced?: string;
}

interface LocalCartItem {
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
  syncCartWithServer: () => Promise<boolean>;
  itemCount: number;
  totalPrice: number;
  isLocalCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Get API URL with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncingCart, setSyncingCart] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [updatingCart, setUpdatingCart] = useState<Record<string, boolean>>({});
  const [removingFromCart, setRemovingFromCart] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLocalCart, setIsLocalCart] = useState<boolean>(true);
  const { user, token } = useAuth();

  // Calculate total items in cart
  const itemCount = cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  
  // Calculate total price
  const totalPrice = cart?.cartItems?.reduce(
    (total, item) => total + (item.product.price * item.quantity), 
    0
  ) || 0;

  // Get cart key based on user status
  const getCartKey = (): string => {
    return user ? `cart_${user.id}` : `cart_guest_${getGuestId()}`;
  };

  // Generate or get guest ID for non-logged in users
  const getGuestId = (): string => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      // Use timestamp + random string instead of UUID library
      guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  };

  // Load cart from localStorage
  const loadLocalCart = (): LocalCart | null => {
    try {
      const cartKey = getCartKey();
      const cartData = localStorage.getItem(cartKey);
      if (cartData) {
        return JSON.parse(cartData);
      }
    } catch (err) {
      console.error('Error loading cart from localStorage:', err);
    }
    return null;
  };

  // Save cart to localStorage
  const saveLocalCart = (cartData: LocalCart) => {
    try {
      const cartKey = getCartKey();
      localStorage.setItem(cartKey, JSON.stringify(cartData));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  };

  // Convert server cart to local cart format
  const serverCartToLocalCart = (serverCart: Cart): LocalCart => {
    return {
      id: serverCart.id,
      cartItems: serverCart.cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          description: item.product.description,
          images: item.product.images
        }
      })),
      lastSynced: new Date().toISOString()
    };
  };

  // Convert local cart to server format
  const localCartToServerFormat = (localCart: LocalCart): Cart => {
    return {
      id: localCart.id,
      userId: user?.id || getGuestId(),
      cartItems: localCart.cartItems
    };
  };

  // Generate a temporary ID for optimistic updates
  const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;

  // Fetch cart from localStorage, fallback to API only if needed
  const fetchCart = async () => {
    // Always load from localStorage first
    const localCart = loadLocalCart();
    
    if (localCart) {
      setCart(localCartToServerFormat(localCart));
      setInitialLoad(false);
      return;
    }
    
    // Only if no local cart exists and user is logged in, try server
    if (!token) {
      // Initialize an empty cart
      const newCart: LocalCart = {
        id: generateTempId(),
        cartItems: []
      };
      saveLocalCart(newCart);
      setCart(localCartToServerFormat(newCart));
      setInitialLoad(false);
      setIsLocalCart(true);
      return;
    }

    // No local cart but user is logged in - get from server once
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const serverCart = response.data;
      
      // Save to local storage
      saveLocalCart(serverCartToLocalCart(serverCart));
      setCart(serverCart);
      setIsLocalCart(false);
      setError(null);
    } catch (err) {
      // Create an empty cart if fetch fails
      const newCart: LocalCart = {
        id: generateTempId(),
        cartItems: []
      };
      saveLocalCart(newCart);
      setCart(localCartToServerFormat(newCart));
      setError('Failed to fetch cart from server');
      console.error('Error fetching cart:', err);
      setIsLocalCart(true);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Sync the local cart with the server (only when explicitly called or during checkout)
  const syncCartWithServer = async (): Promise<boolean> => {
    if (!token || !user) {
      return false; // Can't sync without authentication
    }
    
    const localCart = loadLocalCart();
    if (!localCart) {
      return false; // No cart to sync
    }
    
    setSyncingCart(true);
    
    try {
      // First get server cart
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const serverCart = response.data;
      
      // Clear server cart first (easier than calculating differences)
      await axios.delete(
        `${API_URL}/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Add all local items to server
      for (const item of localCart.cartItems) {
        await axios.post(
          `${API_URL}/cart/items`,
          { 
            productId: item.productId, 
            quantity: item.quantity 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Get updated server cart
      const updatedResponse = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local with server state
      const updatedServerCart = updatedResponse.data;
      saveLocalCart(serverCartToLocalCart(updatedServerCart));
      setCart(updatedServerCart);
      setIsLocalCart(false);
      
      toast.success('Cart synchronized with server');
      return true;
    } catch (err) {
      console.error('Error syncing cart with server:', err);
      toast.error('Failed to sync cart with server');
      return false;
    } finally {
      setSyncingCart(false);
    }
  };

  // Add item to cart (local only)
  const addToCart = async (productId: string, quantity: number, productDetails?: Partial<CartItem['product']>) => {
    setAddingToCart(true);
    
    try {
      // Update local cart first for instant feedback
      const localCart = loadLocalCart() || { id: generateTempId(), cartItems: [] };
      const existingItemIndex = localCart.cartItems.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        // Item exists in local cart, update quantity
        localCart.cartItems[existingItemIndex].quantity += quantity;
      } else if (productDetails) {
        // Add new item to local cart
        localCart.cartItems.push({
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
        });
      }
      
      // Save to localStorage
      saveLocalCart(localCart);
      
      // Update state with local cart
      setCart(localCartToServerFormat(localCart));
      setIsLocalCart(true);
      
      toast.success('Item added to cart');
    } catch (err) {
      toast.error('Failed to add item to cart');
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  // Update cart item quantity (local only)
  const updateCartItem = async (itemId: string, quantity: number) => {
    // Update local cart
    const localCart = loadLocalCart();
    if (!localCart) return;
    
    // Find the item in local cart
    const itemIndex = localCart.cartItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    // Track updating state for this specific item
    setUpdatingCart(prev => ({ ...prev, [itemId]: true }));
    
    try {
      // Handle item removal if quantity is 0
      if (quantity <= 0) {
        localCart.cartItems.splice(itemIndex, 1);
      } else {
        // Update quantity
        localCart.cartItems[itemIndex].quantity = quantity;
      }
      
      // Save to localStorage
      saveLocalCart(localCart);
      
      // Update state with local cart
      setCart(localCartToServerFormat(localCart));
      setIsLocalCart(true);
    } catch (err) {
      console.error('Error updating cart item:', err);
      toast.error('Failed to update cart item');
    } finally {
      setUpdatingCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Remove item from cart (local only)
  const removeCartItem = async (itemId: string) => {
    // Update local cart
    const localCart = loadLocalCart();
    if (!localCart) return;
    
    // Track removing state for this specific item
    setRemovingFromCart(prev => ({ ...prev, [itemId]: true }));
    
    try {
      // Remove item from local cart
      localCart.cartItems = localCart.cartItems.filter(item => item.id !== itemId);
      
      // Save to localStorage
      saveLocalCart(localCart);
      
      // Update state with local cart
      setCart(localCartToServerFormat(localCart));
      setIsLocalCart(true);
      
      toast.success('Item removed from cart');
    } catch (err) {
      console.error('Error removing cart item:', err);
      toast.error('Failed to remove item from cart');
    } finally {
      setRemovingFromCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Clear entire cart (local only)
  const clearCart = async () => {
    try {
      // Clear local cart
      const cartKey = getCartKey();
      localStorage.removeItem(cartKey);
      
      // Update state
      setCart({ id: generateTempId(), userId: user?.id || getGuestId(), cartItems: [] });
      setIsLocalCart(true);
      
      toast.success('Cart cleared');
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error('Failed to clear cart');
    }
  };

  // Handle user login - merge guest cart with user cart
  useEffect(() => {
    if (user && token) {
      // Check if we have a guest cart to migrate
      const guestId = localStorage.getItem('guestId');
      if (guestId) {
        const guestCartKey = `cart_guest_${guestId}`;
        const guestCartData = localStorage.getItem(guestCartKey);
        
        if (guestCartData) {
          try {
            const guestCart = JSON.parse(guestCartData) as LocalCart;
            
            // If guest cart has items, keep using it but with new user ID
            if (guestCart.cartItems.length > 0) {
              // Create a new user cart with guest items
              const userCartKey = `cart_${user.id}`;
              localStorage.setItem(userCartKey, guestCartData);
              
              // Remove guest cart
              localStorage.removeItem(guestCartKey);
              
              // Display toast notification
              if (guestCart.cartItems.length > 0) {
                toast.success('Your cart has been restored');
              }
            }
          } catch (err) {
            console.error('Error parsing guest cart data:', err);
          }
        }
      }
    }
    
    // Always load cart from local storage on auth change
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
    syncCartWithServer,
    itemCount,
    totalPrice,
    isLocalCart
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