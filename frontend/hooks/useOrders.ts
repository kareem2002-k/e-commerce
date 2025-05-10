import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Order } from '@/types';
import { getUrl } from '@/utils';



export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_URL = getUrl();
      const response = await fetch(`${API_URL}/orders/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus: string) => {
    try {
      const API_URL = getUrl();
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      const updatedOrder = await response.json();
      
      // Update order in state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      
      toast({
        title: "Success",
        description: `Order status updated to ${orderStatus}`,
      });
      
      return updatedOrder;
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  return { orders, loading, error, fetchOrders, updateOrderStatus };
}

export function useOrderDetails(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (token && orderId) {
      fetchOrderDetails();
    }
  }, [token, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = getUrl();
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Order not found');
          throw new Error('Order not found');
        }
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderStatus: string, paymentStatus: string) => {
    if (!order) return null;
    
    try {
      const API_URL = getUrl();
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      
      return updatedOrder;
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  return { order, loading, error, fetchOrderDetails, updateOrderStatus };
} 


