"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { getUrl } from '@/utils';
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
  itemCount: number;
  totalPrice: number;
  isLocalCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Get API URL with fallback
const API_URL = getUrl();

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [updatingCart, setUpdatingCart] = useState<Record<string, boolean>>({});
  const [removingFromCart, setRemovingFromCart] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLocalCart, setIsLocalCart] = useState<boolean>(true);
  const { user } = useAuth();

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

  // Fetch cart from localStorage
  const fetchCart = async () => {
    setLoading(true);
    
    try {
      // Always load from localStorage first
      const localCart = loadLocalCart();
      
      if (localCart) {
        setCart(localCartToServerFormat(localCart));
      } else {
        // Initialize an empty cart
        const newCart: LocalCart = {
          id: generateTempId(),
          cartItems: []
        };
        saveLocalCart(newCart);
        setCart(localCartToServerFormat(newCart));
      }
      
      setError(null);
    } catch (err) {
      // Create an empty cart if fetch fails
      const newCart: LocalCart = {
        id: generateTempId(),
        cartItems: []
      };
      saveLocalCart(newCart);
      setCart(localCartToServerFormat(newCart));
      setError('Failed to load cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
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
            name: productDetails.name || 'Product',
            price: typeof productDetails.price === 'number' ? productDetails.price : 0,
            description: productDetails.description || '',
            images: Array.isArray(productDetails.images) && productDetails.images.length > 0 
              ? productDetails.images.map(img => ({ 
                  url: img.url || '' 
                }))
              : []
          }
        });
      } else {
        console.error('No product details provided for new cart item');
        toast.error('Could not add item to cart: missing product details');
        setAddingToCart(false);
        return;
      }
      
      // Save to localStorage
      saveLocalCart(localCart);
      
      // Update state with local cart
      setCart(localCartToServerFormat(localCart));
      
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
      
      toast.success('Cart cleared');
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error('Failed to clear cart');
    }
  };

  // Handle user login - merge guest cart with user cart
  useEffect(() => {
    if (user) {
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
  }, [user]);

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
    totalPrice,
    isLocalCart: true // Always true since we're using local cart only
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