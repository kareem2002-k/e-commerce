"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  ExternalLink,
  ChevronRight,
  Clock,
  Package,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface OrderItem {
  id: string;
  productId: string;
  orderId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    description: string;
    images: { url: string }[];
  };
}

interface Address {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  userId: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCancel, setLoadingCancel] = useState<Record<string, boolean>>({});
  
  // Get API URL with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  useEffect(() => {
    fetchOrders();
  }, [token, router]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelOrder = async (orderId: string) => {
    try {
      setLoadingCancel(prev => ({ ...prev, [orderId]: true }));
      
      await axios.post(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh orders
      await fetchOrders();
      
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setLoadingCancel(prev => ({ ...prev, [orderId]: false }));
    }
  };
  
  const getOrderStatusBadge = (status: string) => {
    const statusColors: Record<string, { color: string; bg: string; text: string }> = {
      'PENDING': { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'Pending' },
      'CONFIRMED': { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'Confirmed' },
      'SHIPPED': { color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'Shipped' },
      'DELIVERED': { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', text: 'Delivered' },
      'CANCELLED': { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', text: 'Cancelled' }
    };
    
    const statusInfo = statusColors[status] || { color: 'text-gray-600', bg: 'bg-gray-100', text: status };
    
    return (
      <Badge variant="outline" className={`${statusInfo.bg} ${statusInfo.color} border-0`}>
        {statusInfo.text}
      </Badge>
    );
  };
  
  const getPaymentStatusBadge = (status: string) => {
    const statusColors: Record<string, { color: string; bg: string; text: string }> = {
      'PENDING': { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'Pending' },
      'PAID': { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', text: 'Paid' },
      'FAILED': { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', text: 'Failed' },
      'REFUNDED': { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'Refunded' }
    };
    
    const statusInfo = statusColors[status] || { color: 'text-gray-600', bg: 'bg-gray-100', text: status };
    
    return (
      <Badge variant="outline" className={`${statusInfo.bg} ${statusInfo.color} border-0`}>
        {statusInfo.text}
      </Badge>
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-purple-600" />
            </div>
            
            <h3 className="text-xl font-medium mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to place your first order.
            </p>
            
            <Button
              onClick={() => router.push('/home/products')}
              className="bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700"
            >
              Browse Products
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" /> 
                      {formatDate(order.createdAt)}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex items-center gap-2">
                      {getOrderStatusBadge(order.orderStatus)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="items">
                    <AccordionTrigger className="py-2">
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-600" />
                        {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 mt-2">
                        {order.orderItems.map((item) => (
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
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.unitPrice)} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-sm font-medium">
                              {formatCurrency(item.totalPrice)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="shipping">
                    <AccordionTrigger className="py-2">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        Shipping Information
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 mt-2">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Shipping Address</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Billing Address</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.billingAddress.streetAddress}, {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}, {order.billingAddress.country}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="payment">
                    <AccordionTrigger className="py-2">
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-purple-600" />
                        Payment Details
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatCurrency(order.totalAmount - order.shippingCost - order.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>{formatCurrency(order.shippingCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span>{formatCurrency(order.taxAmount)}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Payment Method</span>
                            <span>
                              {order.paymentMethod === 'CREDIT_CARD' ? 'Credit Card' : 'Cash on Delivery'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/home/products`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> 
                  Buy Again
                </Button>
                
                {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={loadingCancel[order.id]}
                  >
                    {loadingCancel[order.id] ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Order'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}