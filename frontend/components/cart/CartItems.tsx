"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Truck, Trash2, Plus, Minus, MapPin, CalculatorIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { getUrl } from '@/utils';

// Shipping estimate interface
interface ShippingEstimate {
  cost: number;
  isFreeShipping: boolean;
  baseCost: number;
  distanceFee: number;
  method: string;
  estimatedDays: string;
  taxRate: number;
}

// Add Address interface 
interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export default function CartItems({ onClose }: { onClose?: () => void }) {
  const { 
    cart, 
    loading, 
    updatingCart, 
    removingFromCart, 
    removeCartItem, 
    updateCartItem, 
    totalPrice, 
    itemCount 
  } = useCart();
  const { user, token } = useAuth();
  
  // Add state for user addresses
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Add state for shipping estimate
  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  
  // Get API URL with fallback
  const API_URL = getUrl();
  
  // Fetch user addresses if logged in
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!token) return;
      
      try {
        setLoadingAddresses(true);
        const response = await axios.get(`${API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setUserAddresses(response.data);
          setDefaultAddress(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching user addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    if (user && token) {
      fetchUserAddresses();
    }
  }, [user, token, API_URL]);
  
  // Function to fetch shipping estimate
  const fetchShippingEstimate = async () => {
    if (!cart || cart.cartItems.length === 0) return;
    
    setLoadingShipping(true);
    
    try {
      // Use user's default address if available, otherwise use default location
      const locationData = defaultAddress ? {
        country: defaultAddress.country,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode
      } : {
        country: 'US',
        state: 'CA',
        postalCode: '90210'
      };
      
      const response = await axios.post(`${API_URL}/shipping/estimate`, {
        cartItems: cart.cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        ...locationData,
        subtotal: totalPrice
      });
      
      setShippingEstimate(response.data);
    } catch (error) {
      console.error('Error fetching shipping estimate:', error);
      // Don't show error to user - just don't display shipping
    } finally {
      setLoadingShipping(false);
    }
  };
  
  // Fetch shipping estimate when cart changes or default address changes
  useEffect(() => {
    if (cart && cart.cartItems.length > 0) {
      fetchShippingEstimate();
    } else {
      setShippingEstimate(null);
    }
  }, [cart, totalPrice, defaultAddress]);

  // Only show loading indicator on initial cart fetch, not for individual item operations
  if (loading && !cart) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button 
            onClick={onClose} 
            className="bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700"
          >
            Browse Products
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto">
        <AnimatePresence>
          {cart.cartItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`flex items-center gap-4 py-4 border-b ${removingFromCart[item.id] ? 'opacity-50' : ''}`}
            >
              <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                {item.product.images && item.product.images.length > 0 && item.product.images[0].url ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <Link
                  href={`/home/products/${item.product.id}`} 
                  className="font-medium hover:text-purple-600 transition-colors"
                  onClick={onClose}
                >
                  {item.product.name}
                </Link>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(item.product.price)} × {item.quantity} = <span className="font-medium text-foreground">{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => updateCartItem(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updatingCart[item.id]}
                  >
                    {updatingCart[item.id] ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <span className="text-sm font-medium w-6 text-center">
                    {item.quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    disabled={updatingCart[item.id]}
                  >
                    {updatingCart[item.id] ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                    onClick={() => removeCartItem(item.id)}
                    disabled={removingFromCart[item.id]}
                  >
                    {removingFromCart[item.id] ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="border-t pt-4 mt-auto">
        {/* Display shipping location if available */}
        {defaultAddress && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3" />
            <span>Shipping to: {defaultAddress.city}, {defaultAddress.state}, {defaultAddress.country}</span>
          </div>
        )}
        
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(totalPrice)}</span>
        </div>
        
        {/* Display shipping estimate */}
        {shippingEstimate && (
          <div className="space-y-1 mb-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Truck className="h-3 w-3" />
                <span>Shipping ({shippingEstimate.method})</span>
              </div>
              <span className="font-medium">{formatCurrency(shippingEstimate.cost)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pl-4">
              <span>Base Fee</span>
              <span>{formatCurrency(shippingEstimate.baseCost)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pl-4">
              <span>Distance Fee</span>
              <span>{formatCurrency(shippingEstimate.distanceFee)}</span>
            </div>
          </div>
        )}
        
        {/* Display estimated tax */}
        {shippingEstimate && (
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <CalculatorIcon className="h-3 w-3" />
              <span>Est. Tax ({(shippingEstimate.taxRate * 100).toFixed(1)}%)</span>
            </div>
            <span>{formatCurrency(totalPrice * shippingEstimate.taxRate)}</span>
          </div>
        )}
        
        <div className="flex justify-between mb-4">
          <span className="text-muted-foreground">Items</span>
          <Badge variant="outline" className="rounded-full px-2 py-0">
            {itemCount}
          </Badge>
        </div>
        
        {/* Estimated Total */}
        {shippingEstimate && (
          <div className="flex justify-between font-medium pt-2 border-t mb-4">
            <span>Estimated Total</span>
            <span>{formatCurrency(totalPrice + shippingEstimate.cost + (totalPrice * shippingEstimate.taxRate))}</span>
          </div>
        )}
        
        {/* Note for non-logged in users */}
        {!user && (
          <div className="text-xs text-muted-foreground mb-3">
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link> to see accurate shipping rates for your address.
          </div>
        )}
        
        <Link href="/home/checkout" onClick={onClose}>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
} 