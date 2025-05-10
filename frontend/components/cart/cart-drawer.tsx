"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ShoppingCart, Truck, Trash2, X, MapPin, CalculatorIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { formatCurrency } from "@/lib/utils"
import axios from "axios"
import { getUrl } from "@/utils"
import { useAuth } from "@/contexts/AuthContext"

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

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Cart drawer component that displays from the right side of the screen.
 * Shows cart items, subtotal, and checkout options.
 *
 * @param open - Whether the cart drawer is open
 * @param onOpenChange - Function to call when the open state changes
 */
export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cart, loading, removeCartItem, updateCartItem, totalPrice, itemCount } = useCart();
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
    
    if (user && token && open) {
      fetchUserAddresses();
    }
  }, [user, token, API_URL, open]);
  
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
  
  // Fetch shipping estimate when cart changes or drawer opens or default address changes
  useEffect(() => {
    if (open && cart && cart.cartItems.length > 0) {
      fetchShippingEstimate();
    } else if (!open) {
      setShippingEstimate(null);
    }
  }, [cart, totalPrice, open, defaultAddress]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0" side="right">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart ({itemCount})
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : !cart || cart.cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Button onClick={() => onOpenChange(false)}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {cart.cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-20 w-20 relative rounded-md overflow-hidden border flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 && item.product.images[0].url ? (
                        <Image 
                          src={item.product.images[0].url} 
                          alt={item.product.name} 
                          fill 
                          className="object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <Link 
                        href={`/home/products/${item.product.id}`} 
                        className="font-medium hover:underline"
                        onClick={() => onOpenChange(false)}
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(item.product.price)} x {item.quantity}
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => removeCartItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-6 space-y-4">
              {/* Display shipping location if available */}
              {defaultAddress && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Shipping to: {defaultAddress.city}, {defaultAddress.state}, {defaultAddress.country}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(totalPrice)}</span>
              </div>
              
              {/* Display shipping estimate */}
              {shippingEstimate && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      <span>Shipping ({shippingEstimate.method})</span>
                    </div>
                    <span className="font-medium">{formatCurrency(shippingEstimate.cost)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pl-5">
                    <span>Base Fee</span>
                    <span>{formatCurrency(shippingEstimate.baseCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pl-5">
                    <span>Distance Fee</span>
                    <span>{formatCurrency(shippingEstimate.distanceFee)}</span>
                  </div>
                </div>
              )}
              
              {/* Display estimated tax */}
              {shippingEstimate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CalculatorIcon className="h-4 w-4" />
                    <span>Est. Tax ({(shippingEstimate.taxRate * 100).toFixed(1)}%)</span>
                  </div>
                  <span>{formatCurrency(totalPrice * shippingEstimate.taxRate)}</span>
                </div>
              )}
              
              {/* Estimated Total */}
              {shippingEstimate && (
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(totalPrice + shippingEstimate.cost + (totalPrice * shippingEstimate.taxRate))}</span>
                </div>
              )}
              
              {/* Note for non-logged in users */}
              {!user && (
                <div className="text-xs text-muted-foreground">
                  <Link href="/login" className="text-blue-600 hover:underline" onClick={() => onOpenChange(false)}>
                    Log in
                  </Link> to see accurate shipping rates for your address.
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                Shipping and taxes calculated at checkout
              </div>
              
              <div className="flex flex-col gap-2">
                <Link href="/home/checkout" onClick={() => onOpenChange(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700" size="lg">
                    Checkout
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" size="lg" onClick={() => onOpenChange(false)}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
