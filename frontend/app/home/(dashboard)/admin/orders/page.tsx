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
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, MoreHorizontal, Filter, Search, RefreshCw, UserIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useOrders } from "@/hooks/useOrders"
import { Order } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axios from "axios"
import { getUrl } from "@/utils"
import { Textarea } from "@/components/ui/textarea"
import { cn, formatCurrency } from "@/lib/utils"

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

// Refund status and reason mappings
const REFUND_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "PROCESSED"
] as const;

const REFUND_REASON_LABELS: Record<string, string> = {
  "DAMAGED": "Item arrived damaged",
  "WRONG_ITEM": "Received wrong item",
  "NOT_AS_DESCRIBED": "Item not as described",
  "ARRIVED_LATE": "Item arrived too late",
  "CHANGED_MIND": "Changed mind",
  "OTHER": "Other reason"
};

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

// Add Refund type definition right after imports
interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  description: string | null;
  status: string;
  requestedAt: string;
  processedAt: string | null;
  adminNotes: string | null;
  refundMethod: string | null;
  transactionId: string | null;
  order: {
    id: string;
    totalAmount: number;
    user: {
      id: string;
      name: string;
      email: string;
    }
  }
}

// Update the getStatusBadgeClassNames function to use className instead of variant
const getStatusBadgeClassNames = (status: string): string => {
  switch (status) {
    case 'PENDING': return "bg-gray-100 text-gray-800 border-gray-300"
    case 'CONFIRMED': return "bg-blue-100 text-blue-800 border-blue-300"
    case 'PROCESSING': return "bg-purple-100 text-purple-800 border-purple-300"
    case 'SHIPPED': return "bg-indigo-100 text-indigo-800 border-indigo-300"
    case 'DELIVERED': return "bg-green-100 text-green-800 border-green-300"
    case 'CANCELLED': return "bg-red-100 text-red-800 border-red-300"
    case 'RETURNED': return "bg-amber-100 text-amber-800 border-amber-300"
    case 'PAID': return "bg-green-100 text-green-800 border-green-300"
    case 'FAILED': return "bg-red-100 text-red-800 border-red-300"
    case 'REFUNDED': return "bg-amber-100 text-amber-800 border-amber-300"
    case 'REQUESTED': return "bg-blue-100 text-blue-800 border-blue-300"
    case 'APPROVED': return "bg-green-100 text-green-800 border-green-300"
    case 'REJECTED': return "bg-red-100 text-red-800 border-red-300"
    case 'PROCESSED': return "bg-indigo-100 text-indigo-800 border-indigo-300"
    default: return "bg-gray-100 text-gray-800 border-gray-300"
  }
};

export default function AdminOrdersPage() {
  const { orders, loading, error, fetchOrders, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "refunds">("orders");
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [refundStatusFilter, setRefundStatusFilter] = useState("ALL");
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundNotes, setRefundNotes] = useState("");
  const [newRefundStatus, setNewRefundStatus] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/home');
    }
  }, [user, router]);
  
  // Apply filters when orders, status filter or search query changes
  useEffect(() => {
    if (orders) {
      filterOrders();
    }
  }, [orders, statusFilter, searchQuery]);

  const filterOrders = () => {
    let result = [...orders];
    
    // Apply status filter
    if (statusFilter !== "ALL") {
      result = result.filter(order => order.orderStatus === statusFilter);
    }
    
    // Apply search filter (search by order ID or customer email/name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) || 
        (order.user?.email?.toLowerCase().includes(query) || false) ||
        (order.user?.name?.toLowerCase().includes(query) || false)
      );
    }
    
    setFilteredOrders(result);
  };

  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
    setStatusDialogOpen(true);
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    
    try {
      setUpdatingStatus(true);
      await updateOrderStatus(selectedOrder.id, newOrderStatus, newPaymentStatus);
      setStatusDialogOpen(false);
    } catch (error) {
      console.error("Error in component while updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const fetchRefunds = async () => {
    try {
      setLoadingRefunds(true);
      const API_URL = getUrl();
      const response = await axios.get(
        `${API_URL}/orders/admin/refunds${refundStatusFilter !== "ALL" ? `?status=${refundStatusFilter}` : ""}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRefunds(response.data);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast({
        title: "Error",
        description: "Failed to load refund requests",
        variant: "destructive"
      });
    } finally {
      setLoadingRefunds(false);
    }
  };

  useEffect(() => {
    if (activeTab === "refunds" && user?.isAdmin) {
      fetchRefunds();
    }
  }, [activeTab, refundStatusFilter, user]);

  const openRefundProcessDialog = (refund: Refund) => {
    setSelectedRefund(refund);
    setNewRefundStatus(refund.status);
    setRefundNotes(refund.adminNotes || "");
    setRefundMethod(refund.refundMethod || "");
    setTransactionId(refund.transactionId || "");
    setRefundDialogOpen(true);
  };

  const handleProcessRefund = async () => {
    if (!selectedRefund) return;
    
    try {
      setProcessingRefund(true);
      
      const API_URL = getUrl();
      const response = await axios.put(
        `${API_URL}/orders/admin/refunds/${selectedRefund.id}`,
        {
          status: newRefundStatus,
          adminNotes: refundNotes,
          refundMethod,
          transactionId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh refunds list
      await fetchRefunds();
      
      // Close dialog
      setRefundDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Refund status updated successfully",
      });
    } catch (error) {
      console.error("Error processing refund:", error);
      toast({
        title: "Error",
        description: "Failed to update refund status",
        variant: "destructive"
      });
    } finally {
      setProcessingRefund(false);
    }
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        
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
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "orders" | "refunds")} className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="refunds">Refund Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Manage customer orders, update their status and track deliveries.
              </CardDescription>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by order ID or customer..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
                    }}
                  >
                    Reset
                  </Button>
                </div>
                
                <div className="flex gap-2 items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Orders</SelectItem>
                      {ORDER_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="text-destructive mb-2">{error}</p>
                  <Button onClick={handleRefresh} variant="outline">Try Again</Button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  {orders.length === 0 ? 
                    "No orders found in the system." : 
                    "No orders match your filter criteria. Try changing the filters."}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} onClick={() => router.push(`/home/admin/orders/${order.id}`)}>
                          <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            {order.user ? (
                              <>
                                <div>{order.user.name}</div>
                                <div className="text-sm text-muted-foreground">{order.user.email}</div>
                              </>
                            ) : (
                              <div className="flex items-center text-muted-foreground">
                                <UserIcon className="h-4 w-4 mr-2" />
                                <span>User unavailable</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeClassNames(order.orderStatus)}>
                              {order.orderStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeClassNames(order.paymentStatus)}>
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openStatusDialog(order)}>
                                  Update Status
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/home/admin/orders/${order.id}`)}
                                >
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="refunds">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Refund Management</h2>
            
            <div className="flex items-center space-x-2">
              <Select 
                value={refundStatusFilter} 
                onValueChange={setRefundStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {REFUND_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchRefunds}
                disabled={loadingRefunds}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingRefunds ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {loadingRefunds ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : refunds.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No refund requests found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refunds.map((refund) => (
                      <TableRow key={refund.id}>
                        <TableCell>
                          {formatDate(refund.requestedAt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {refund.orderId.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {refund.order.user.name || refund.order.user.email}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(refund.amount)}
                        </TableCell>
                        <TableCell>
                          {REFUND_REASON_LABELS[refund.reason] || refund.reason}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClassNames(refund.status)}>
                            {refund.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openRefundProcessDialog(refund)}
                          >
                            Process
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{selectedOrder?.id?.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <label className="text-sm font-medium leading-none mb-2 block">
                  Order Status
                </label>
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
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <label className="text-sm font-medium leading-none mb-2 block">
                  Payment Status
                </label>
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
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrderStatus} disabled={updatingStatus}>
              {updatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Process Refund Request</DialogTitle>
            <DialogDescription>
              Update the status of this refund request
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Order ID:</span>
                <span>{selectedRefund?.orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customer:</span>
                <span>{selectedRefund?.order.user.name || selectedRefund?.order.user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Requested Amount:</span>
                <span>{selectedRefund ? formatCurrency(selectedRefund.amount) : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reason:</span>
                <span>{selectedRefund ? (REFUND_REASON_LABELS[selectedRefund.reason] || selectedRefund.reason) : '-'}</span>
              </div>
              {selectedRefund?.description && (
                <div className="mt-2">
                  <span className="text-sm font-medium">Customer Description:</span>
                  <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedRefund.description}</p>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select value={newRefundStatus} onValueChange={setNewRefundStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {REFUND_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="refundMethod" className="text-sm font-medium">
                Refund Method
              </label>
              <Select value={refundMethod} onValueChange={setRefundMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORIGINAL_PAYMENT">Original Payment Method</SelectItem>
                  <SelectItem value="STORE_CREDIT">Store Credit</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="transactionId" className="text-sm font-medium">
                Transaction ID (optional)
              </label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="External transaction reference"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Admin Notes
              </label>
              <Textarea
                id="notes"
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about this refund"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessRefund}
              disabled={processingRefund}
            >
              {processingRefund ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 