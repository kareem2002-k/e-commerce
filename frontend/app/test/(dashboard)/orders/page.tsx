"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Download, ExternalLink, FileText, Package, Search, ShoppingBag, Truck } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock orders data
const orders = [
  {
    id: "ORD-12345",
    date: "2023-04-15",
    status: "delivered",
    total: 1549.98,
    items: [
      {
        id: "1",
        name: "VoltEdge Pro Laptop",
        price: 1299.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "3",
        name: "VoltEdge Noise-Cancelling Headphones",
        price: 249.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shipping: {
      method: "Express Shipping",
      address: "123 Main St, Apt 4B, New York, NY 10001",
      trackingNumber: "TRK-987654321",
    },
    payment: {
      method: "Credit Card",
      last4: "4242",
    },
  },
  {
    id: "ORD-12346",
    date: "2023-03-28",
    status: "shipped",
    total: 899.99,
    items: [
      {
        id: "2",
        name: "VoltEdge Ultra Smartphone",
        price: 899.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shipping: {
      method: "Standard Shipping",
      address: "123 Main St, Apt 4B, New York, NY 10001",
      trackingNumber: "TRK-987654322",
    },
    payment: {
      method: "PayPal",
      email: "j***@example.com",
    },
  },
  {
    id: "ORD-12347",
    date: "2023-03-10",
    status: "processing",
    total: 349.99,
    items: [
      {
        id: "4",
        name: "VoltEdge Smart Watch Series 5",
        price: 349.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shipping: {
      method: "Standard Shipping",
      address: "123 Main St, Apt 4B, New York, NY 10001",
    },
    payment: {
      method: "Credit Card",
      last4: "4242",
    },
  },
  {
    id: "ORD-12348",
    date: "2023-02-22",
    status: "delivered",
    total: 799.99,
    items: [
      {
        id: "5",
        name: "VoltEdge 4K Ultra HD Smart TV",
        price: 799.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shipping: {
      method: "Express Shipping",
      address: "123 Main St, Apt 4B, New York, NY 10001",
      trackingNumber: "TRK-987654323",
    },
    payment: {
      method: "Credit Card",
      last4: "4242",
    },
  },
  {
    id: "ORD-12349",
    date: "2023-01-15",
    status: "cancelled",
    total: 69.99,
    items: [
      {
        id: "6",
        name: "VoltEdge Wireless Gaming Controller",
        price: 69.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shipping: {
      method: "Standard Shipping",
      address: "123 Main St, Apt 4B, New York, NY 10001",
    },
    payment: {
      method: "Credit Card",
      last4: "4242",
    },
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-500"
    case "shipped":
      return "bg-blue-500"
    case "processing":
      return "bg-amber-500"
    case "cancelled":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusText = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    const matchesDate = dateFilter === "all" || filterByDate(order.date, dateFilter)

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">View and track your order history</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
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
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", getStatusColor(order.status))}></div>
                          <span>{getStatusText(order.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{order.items.length}</TableCell>
                      <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
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
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {filteredOrders.filter((order) => order.status === "processing").length > 0 ? (
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
                    .filter((order) => order.status === "processing")
                    .map((order) => (
                      <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order.id)}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell className="hidden md:table-cell">{order.items.length}</TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
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
              <h3 className="text-xl font-semibold mb-2">No processing orders</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                You don't have any orders currently being processed.
              </p>
              <Button asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="shipped" className="space-y-4">
          {filteredOrders.filter((order) => order.status === "shipped").length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Tracking</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders
                    .filter((order) => order.status === "shipped")
                    .map((order) => (
                      <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order.id)}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell className="hidden md:table-cell">{order.shipping.trackingNumber || "N/A"}</TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
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
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          {filteredOrders.filter((order) => order.status === "delivered").length > 0 ? (
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
                    .filter((order) => order.status === "delivered")
                    .map((order) => (
                      <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order.id)}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell className="hidden md:table-cell">{order.items.length}</TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
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
                <Link href="/">Continue Shopping</Link>
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
              <CardTitle className="text-2xl">Order {currentOrder.id}</CardTitle>
              <CardDescription>Placed on {new Date(currentOrder.date).toLocaleDateString()}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn(getStatusColor(currentOrder.status), "text-white")}>
                {getStatusText(currentOrder.status)}
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
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-20 w-20 relative rounded-md overflow-hidden border">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">${currentOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Shipping Information</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Method:</span> {currentOrder.shipping.method}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span> {currentOrder.shipping.address}
                  </p>
                  {currentOrder.shipping.trackingNumber && (
                    <p>
                      <span className="font-medium">Tracking:</span> {currentOrder.shipping.trackingNumber}
                    </p>
                  )}
                  {currentOrder.status === "shipped" && currentOrder.shipping.trackingNumber && (
                    <Button variant="outline" size="sm" className="mt-2">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Track Package
                    </Button>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Payment Information</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Method:</span> {currentOrder.payment.method}
                  </p>
                  {currentOrder.payment.last4 && (
                    <p>
                      <span className="font-medium">Card:</span> •••• {currentOrder.payment.last4}
                    </p>
                  )}
                  {currentOrder.payment.email && (
                    <p>
                      <span className="font-medium">Email:</span> {currentOrder.payment.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Invoice
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
