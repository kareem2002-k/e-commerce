"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Download, ExternalLink, FileText, Package, Search, ShoppingBag, Truck } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { getUrl } from "@/utils";
// Order interfaces
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

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return "bg-green-500"
    case "SHIPPED":
      return "bg-blue-500"
    case "PENDING":
    case "CONFIRMED":
      return "bg-amber-500"
    case "CANCELLED":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusText = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingCancel, setLoadingCancel] = useState<Record<string, boolean>>({})
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  // Get API URL with fallback
  const API_URL = getUrl();

  useEffect(() => {
    if (token) {
      fetchOrders()
    }
  }, [token])

  const fetchOrders = async () => {
    try {
      if (!token) {
        console.error('No authentication token available')
        toast.error('Authentication error. Please log in again.')
        return
      }

      setLoading(true)
      console.log('Fetching orders with token:', token ? 'Token exists' : 'No token')
      
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setOrders(response.data)
    } catch (error: any) {
      console.error('Error fetching orders:', error.response?.data || error.message)
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
        // Redirect to login if needed
        // router.push('/login')
      } else {
        toast.error('Failed to load orders')
      }
      
      // Set empty orders array to avoid displaying old data
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      setLoadingCancel(prev => ({ ...prev, [orderId]: true }))
      
      await axios.post(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Refresh orders
      await fetchOrders()
      
      toast.success('Order cancelled successfully')
    } catch (error: any) {
      console.error('Error cancelling order:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    } finally {
      setLoadingCancel(prev => ({ ...prev, [orderId]: false }))
    }
  }

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems.some((item) => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || order.orderStatus.toLowerCase() === statusFilter

    const matchesDate = dateFilter === "all" || filterByDate(order.createdAt, dateFilter)

    return matchesSearch && matchesStatus && matchesDate
  })

  function filterByDate(dateString: string, filter: string) {
    const orderDate = new Date(dateString)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6))

    switch (filter) {
      case "30days":
        return orderDate >= thirtyDaysAgo
      case "6months":
        return orderDate >= sixMonthsAgo
      default:
        return true
    }
  }

  const currentOrder = selectedOrder ? orders.find((order) => order.id === selectedOrder) : null

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">View and track your order history</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>All Orders</TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>Pending</TabsTrigger>
            <TabsTrigger value="shipped" onClick={() => setStatusFilter("shipped")}>Shipped</TabsTrigger>
            <TabsTrigger value="delivered" onClick={() => setStatusFilter("delivered")}>Delivered</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8 min-w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {filteredOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order.id)}>
                      <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", getStatusColor(order.orderStatus))}></div>
                          <span>{getStatusText(order.orderStatus)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{order.orderItems.length}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "We couldn't find any orders matching your search and filters. Try adjusting your search terms or filters."
                  : "You haven't placed any orders yet. Start shopping to see your orders here."}
              </p>
              <Button asChild>
                <Link href="/home/products">Continue Shopping</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filteredOrders.filter((order) => order.orderStatus.toLowerCase() === "pending").length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders
                    .filter((order) => order.orderStatus.toLowerCase() === "pending")
                    .map((order) => (
                      <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order.id)}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="hidden md:table-cell">{order.orderItems.length}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No pending orders</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                You don't have any orders currently being processed.
              </p>
              <Button asChild>
                <Link href="/home/products">Continue Shopping</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="shipped" className="space-y-4">
          {filteredOrders.filter((order) => order.orderStatus.toLowerCase() === "shipped").length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders
                    .filter((order) => order.orderStatus.toLowerCase() === "shipped")
                    .map((order) => (
                      <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order.id)}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Truck className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No shipped orders</h3>
              <p className="text-muted-foreground max-w-md mb-6">You don't have any orders currently being shipped.</p>
              <Button asChild>
                <Link href="/home/products">Continue Shopping</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          {filteredOrders.filter((order) => order.orderStatus.toLowerCase() === "delivered").length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders
                    .filter((order) => order.orderStatus.toLowerCase() === "delivered")
                    .map((order) => (
                      <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order.id)}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="hidden md:table-cell">{order.orderItems.length}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No delivered orders</h3>
              <p className="text-muted-foreground max-w-md mb-6">You don't have any delivered orders yet.</p>
              <Button asChild>
                <Link href="/home/products">Continue Shopping</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      {currentOrder && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Order #{currentOrder.id.slice(0, 8)}</CardTitle>
              <CardDescription>Placed on {new Date(currentOrder.createdAt).toLocaleDateString()}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn(getStatusColor(currentOrder.orderStatus), "text-white")}>
                {getStatusText(currentOrder.orderStatus)}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Items</h3>
              <div className="space-y-4">
                {currentOrder.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-20 w-20 relative rounded-md overflow-hidden border">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image 
                          src={item.product.images[0].url || "/placeholder.svg"} 
                          alt={item.product.name} 
                          fill 
                          className="object-cover" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-muted">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">{formatCurrency(currentOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Shipping Information</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Method:</span> {currentOrder.paymentMethod === 'CREDIT_CARD' ? 'Standard Shipping' : 'Cash on Delivery'}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span> {currentOrder.shippingAddress.streetAddress}, {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}, {currentOrder.shippingAddress.country}
                  </p>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Payment Information</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Method:</span> {currentOrder.paymentMethod === 'CREDIT_CARD' ? 'Credit Card' : 'Cash on Delivery'}
                    </p>
                    <p>
                    <span className="font-medium">Status:</span> {getStatusText(currentOrder.paymentStatus)}
                    </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/home/products')}>
              <FileText className="mr-2 h-4 w-4" />
              Buy Again
            </Button>
            {(currentOrder.orderStatus.toUpperCase() === 'PENDING' || currentOrder.orderStatus.toUpperCase() === 'CONFIRMED') && (
              <Button 
                variant="destructive"
                onClick={() => handleCancelOrder(currentOrder.id)}
                disabled={loadingCancel[currentOrder.id]}
              >
                {loadingCancel[currentOrder.id] ? (
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
      )}
    </div>
  )
}

