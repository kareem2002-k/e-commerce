"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  Truck, 
  CreditCard, 
  Check, 
  AlertTriangle,
  ShoppingBag,
  UserIcon,
  RefreshCw
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useOrderDetails } from "@/hooks/useOrders"
import { useAuth } from "@/context/AuthContext"

// Order status options
const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED"
] as const

// Payment status options
const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED"
] as const

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Helper to get status badge variant
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'PENDING': return "outline"
    case 'CONFIRMED': return "secondary"
    case 'PROCESSING': return "default"
    case 'SHIPPED': return "blue"
    case 'DELIVERED': return "green"
    case 'CANCELLED': return "destructive"
    case 'RETURNED': return "yellow"
    case 'PAID': return "green"
    case 'FAILED': return "destructive"
    case 'REFUNDED': return "yellow"
    default: return "outline"
  }
}

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter()
  const { user } = useAuth()
  const { order, loading, error, fetchOrderDetails, updateOrderStatus } = useOrderDetails(id)
  const [newOrderStatus, setNewOrderStatus] = useState("")
  const [newPaymentStatus, setNewPaymentStatus] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/home');
    }
  }, [user, router]);

  // Set initial status values when order data is loaded
  useEffect(() => {
    if (order) {
      setNewOrderStatus(order.orderStatus)
      setNewPaymentStatus(order.paymentStatus)
    }
  }, [order])

  const handleUpdateStatus = async () => {
    if (!order) return;
    
    try {
      setUpdatingStatus(true);
      await updateOrderStatus(newOrderStatus, newPaymentStatus);
    } catch (error) {
      console.error("Error in component while updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
    setRefreshing(false);
  };

  // Calculate order progress percentage based on status
  const getOrderProgress = () => {
    if (!order) return 0;
    const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
    if (order.orderStatus === "CANCELLED" || order.orderStatus === "RETURNED") {
      return 0;
    }
    const currentIndex = statuses.indexOf(order.orderStatus);
    return currentIndex >= 0 ? (currentIndex / (statuses.length - 1)) * 100 : 0;
  };

  if (user && !user.isAdmin) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg">{error}</p>
        <div className="mt-4 space-x-3">
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Trying again...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => router.push('/home/admin/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg">Order not found</p>
        <Button className="mt-4" onClick={() => router.push('/home/admin/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/home/admin/orders')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Order Summary */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    Placed on {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getStatusBadgeVariant(order.orderStatus) as any}>
                    {order.orderStatus}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(order.paymentStatus) as any}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Order Progress */}
              {(order.orderStatus !== "CANCELLED" && order.orderStatus !== "RETURNED") && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Order Progress</span>
                    <span>{Math.round(getOrderProgress())}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${getOrderProgress()}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Ordered</span>
                    <span>Processing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                </div>
              )}
              
              {/* Customer Info */}
              <div>
                <h3 className="text-md font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Customer</p>
                    {order.user ? (
                      <>
                        <p>{order.user.name}</p>
                        <p className="text-sm text-muted-foreground">{order.user.email}</p>
                      </>
                    ) : (
                      <div className="flex items-center text-muted-foreground">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>User unavailable</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>{order.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Shipping & Billing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div>
                  <h3 className="text-md font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm">
                    <p>{order.shippingAddress.streetAddress}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
                
                {/* Billing Address */}
                <div>
                  <h3 className="text-md font-semibold mb-2">Billing Address</h3>
                  <div className="text-sm">
                    <p>{order.billingAddress.streetAddress}</p>
                    <p>
                      {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                    </p>
                    <p>{order.billingAddress.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Items */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3">
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img 
                          src={item.product.images[0].url} 
                          alt={item.product.images[0].altText || item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <p>Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(order.totalAmount - order.shippingCost - order.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${order.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.taxAmount.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Update Status Card */}
        <div className="w-full md:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
              <CardDescription>
                Change order status and track progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <Select value={newOrderStatus} onValueChange={setNewOrderStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpdateStatus} 
                disabled={updatingStatus || (order.orderStatus === newOrderStatus && order.paymentStatus === newPaymentStatus)}
                className="w-full"
              >
                {updatingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Update Status
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Additional Actions Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Truck className="mr-2 h-4 w-4" />
                Generate Shipping Label
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Print Packing Slip
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 