"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ShoppingCart, CreditCard, MapPin, ChevronRight, Truck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import CartItems from '@/components/cart/CartItems';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';

interface Address {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Coupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  description: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, itemCount, totalPrice, clearCart } = useCart();
  const { user, token } = useAuth();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState('');
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Add coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  // Calculate order summary
  const subtotal = totalPrice;
  
  // Calculate discount if coupon is applied
  const discountAmount = appliedCoupon ? 
    (appliedCoupon.discountType === 'PERCENTAGE' 
      ? (subtotal * (appliedCoupon.discountValue / 100)) 
      : appliedCoupon.discountValue) 
    : 0;
  
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  
  const shippingCost = 10.00; // Fixed shipping cost
  const taxRate = 0.1; // 10% tax
  const taxAmount = discountedSubtotal * taxRate;
  const totalAmount = discountedSubtotal + shippingCost + taxAmount;
  
  // Get API URL with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) return;
      
      try {
        setLoadingAddresses(true);
        const response = await axios.get(`${API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAddresses(response.data);
        
        // Set default addresses if available
        if (response.data.length > 0) {
          setSelectedShippingAddressId(response.data[0].id);
          setSelectedBillingAddressId(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses');
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    fetchAddresses();
  }, [token]);
  
  // Apply coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    try {
      setValidatingCoupon(true);
      
      const response = await axios.get(`${API_URL}/coupons/validate/${couponCode.trim()}`);
      
      if (response.data.valid) {
        setAppliedCoupon(response.data.coupon);
        toast.success('Coupon applied successfully!');
      } else {
        setAppliedCoupon(null);
        toast.error(response.data.message || 'Invalid coupon code');
      }
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      setAppliedCoupon(null);
      
      const errorMessage = error.response?.data?.message || 'Failed to validate coupon';
      toast.error(errorMessage);
    } finally {
      setValidatingCoupon(false);
    }
  };
  
  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };
  
  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || cart.cartItems.length === 0) && !orderPlaced) {
      toast.info('Your cart is empty');
      router.push('/products');
    }
  }, [cart, cartLoading, router, orderPlaced]);
  
  // Place order
  const handlePlaceOrder = async () => {
    if (!token) {
      toast.error('Please log in to place an order');
      return;
    }
    
    if (!selectedShippingAddressId || !selectedBillingAddressId) {
      toast.error('Please select shipping and billing addresses');
      return;
    }
    
    try {
      setPlacingOrder(true);
      
      const response = await axios.post(
        `${API_URL}/orders`,
        {
          shippingAddressId: selectedShippingAddressId,
          billingAddressId: selectedBillingAddressId,
          paymentMethod,
          couponCode: appliedCoupon?.code // Include coupon code if applied
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Order placed successfully
      setOrderPlaced(true);
      setOrderId(response.data.id);
      
      // Clear the cart
      await clearCart();
      
      toast.success('Order placed successfully!', {
        description: `Order #${response.data.id.slice(0, 8)} has been placed.`
      });
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };
  
  // If order is placed, show success message
  if (orderPlaced) {
    return (
      <div className="container max-w-4xl py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center py-12"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-muted-foreground mb-8 max-w-lg">
            Your order has been placed successfully. You will receive an email confirmation shortly.
          </p>
          
          <div className="bg-muted p-4 rounded-md mb-8 inline-block">
            <p className="text-sm">Order Reference: <span className="font-bold">{orderId.slice(0, 8)}</span></p>
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/products')}
            >
              Continue Shopping
            </Button>
            
            <Button
              onClick={() => router.push('/orders')}
              className="bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700"
            >
              View My Orders
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Checkout form */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                Shipping Address
              </CardTitle>
              <CardDescription>Select where you want your order to be delivered</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAddresses ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : addresses.length > 0 ? (
                <Select 
                  value={selectedShippingAddressId}
                  onValueChange={setSelectedShippingAddressId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an address" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map(address => (
                      <SelectItem key={address.id} value={address.id}>
                        {address.streetAddress}, {address.city}, {address.state} {address.zipCode}, {address.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">No addresses found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/profile')}
                  >
                    Add New Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                Billing Address
              </CardTitle>
              <CardDescription>Select your billing address</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAddresses ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : addresses.length > 0 ? (
                <Select 
                  value={selectedBillingAddressId}
                  onValueChange={setSelectedBillingAddressId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an address" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map(address => (
                      <SelectItem key={address.id} value={address.id}>
                        {address.streetAddress}, {address.city}, {address.state} {address.zipCode}, {address.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">No addresses found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/profile')}
                  >
                    Add New Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Coupon Code - New section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12h16" />
                  <path d="M4 12a8 8 0 0 1 8-8" />
                  <path d="M4 12a8 8 0 0 0 8 8" />
                  <path d="M9 8l3-3 3 3" />
                  <path d="M9 16l3 3 3-3" />
                </svg>
                Discount Code
              </CardTitle>
              <CardDescription>Enter a coupon code if you have one</CardDescription>
            </CardHeader>
            <CardContent>
              {appliedCoupon ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-400">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium">{appliedCoupon.code}</p>
                      <p className="text-xs text-muted-foreground">{appliedCoupon.description}</p>
                    </div>
                    <div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleRemoveCoupon}
                        className="h-8 text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-green-600 font-medium">
                    {appliedCoupon.discountType === 'PERCENTAGE' 
                      ? `${appliedCoupon.discountValue}% off` 
                      : `${formatCurrency(appliedCoupon.discountValue)} off`} 
                    your order
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="min-w-[100px]"
                  >
                    {validatingCoupon ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                Payment Method
              </CardTitle>
              <CardDescription>Select your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={setPaymentMethod}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="CREDIT_CARD" id="payment-card" />
                  <Label htmlFor="payment-card" className="flex-grow cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <span>Credit Card</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Pay with your credit or debit card</p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="PAY_ON_DELIVERY" id="payment-cod" />
                  <Label htmlFor="payment-cod" className="flex-grow cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-purple-600" />
                      <span>Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - Order summary */}
        <div className="col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
                Order Summary
              </CardTitle>
              <CardDescription>
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-80 overflow-auto pb-0">
              {cartLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart?.cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img 
                            src={item.product.images[0].url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-medium">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <div className="border-t my-6"></div>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {/* Show discount if coupon is applied */}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-lg">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700"
                onClick={handlePlaceOrder}
                disabled={
                  placingOrder || 
                  !selectedShippingAddressId || 
                  !selectedBillingAddressId ||
                  cartLoading ||
                  !cart ||
                  cart.cartItems.length === 0
                }
              >
                {placingOrder ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 