"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format, subDays, startOfMonth, endOfMonth, formatDistanceToNow } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ActivityIcon, 
  BarChart as BarChartIcon, 
  DollarSign, 
  MapIcon, 
  PackageIcon, 
  ShoppingCartIcon, 
  TrendingUpIcon, 
  UserIcon,
  AlertTriangle,
  Globe,
  Map,
  Box,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { getUrl } from '@/utils';
import axios from 'axios';
import { cn } from '@/lib/utils';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Types for our API responses
interface SalesData {
  date: string;
  amount: number;
  count: number;
}

interface ProductData {
  id: string;
  name: string;
  stock: number;
  sales: number;
  revenue: number;
}

interface CustomerData {
  total: number;
  new: number;
  returning: number;
  churnRate: number;
}

interface GeoData {
  country: string;
  count: number;
  revenue: number;
}

interface OrderStatus {
  status: string;
  count: number;
}

interface TopProductCategory {
  category: string;
  sales: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
}

interface DashboardData {
  salesSummary: {
    totalRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    revenueChange: number;
  };
  weeklySales: SalesData[];
  monthlySales: SalesData[];
  topProducts: ProductData[];
  customerMetrics: CustomerData;
  geoDistribution: GeoData[];
  ordersByStatus: OrderStatus[];
  topCategories: TopProductCategory[];
  lowStockProducts: LowStockProduct[];
}

// Custom formatter for currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e8513a', '#55abab'];

// Custom Progress component that supports indicator styling
const CustomProgress = React.forwardRef<
  React.ElementRef<typeof Progress>,
  React.ComponentPropsWithoutRef<typeof Progress> & { indicatorColor?: string }
>(({ className, indicatorColor, ...props }, ref) => (
  <Progress
    ref={ref}
    className={cn(className)}
    {...props}
    style={{
      "--indicator-color": indicatorColor
    } as React.CSSProperties}
  />
));
CustomProgress.displayName = "CustomProgress";

export default function AdminAnalytics() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [salesTab, setSalesTab] = useState('revenue');
  
  // Fetch dashboard data on component mount
  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/home');
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const API_URL = getUrl();
        const response = await axios.get(`${API_URL}/admin/analytics?timeRange=${timeRange}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, token, timeRange, router]);
  
  // Helper function to calculate percentage change
  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <span className="inline-flex items-center text-green-700">
          <TrendingUpIcon className="h-3 w-3 mr-1" />
          <span>{change.toFixed(1)}%</span>
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="inline-flex items-center text-red-700">
          <TrendingUpIcon className="h-3 w-3 mr-1 rotate-180" />
          <span>{Math.abs(change).toFixed(1)}%</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center text-gray-700">
          <span>0%</span>
        </span>
      );
    }
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-28 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Unable to load dashboard data</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the analytics data. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Add global styles for progress components */}
      <style jsx global>{`
        .progress-indicator-red [data-progress-indicator] {
          background-color: rgb(239 68 68) !important;
        }
        .progress-indicator-amber [data-progress-indicator] {
          background-color: rgb(245 158 11) !important;
        }
      `}</style>
    
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="time-range" className="sr-only">
            Time Range
          </Label>
          <select 
            id="time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-md px-3 py-2 bg-background"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="year">This year</option>
          </select>
        </div>
      </div>
      
      {/* Top metrics summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.salesSummary.totalRevenue)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              vs previous period {getChangeIndicator(dashboardData.salesSummary.revenueChange)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Orders
            </CardTitle>
            <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.salesSummary.orderCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg. order: {formatCurrency(dashboardData.salesSummary.averageOrderValue)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Customers
            </CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.customerMetrics.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              New: +{dashboardData.customerMetrics.new} in selected period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory
            </CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.lowStockProducts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Products low in stock
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Sales Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <Tabs defaultValue="revenue" onValueChange={setSalesTab}>
              <div className="flex items-center justify-between">
                <CardTitle>Sales Trends</CardTitle>
                <TabsList>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={dashboardData.weeklySales}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => salesTab === 'revenue' ? formatCurrency(value) : value}
                />
                <Tooltip content={<CustomTooltip />} />
                {salesTab === 'revenue' ? (
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#0088FE" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                ) : (
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#00C49F" 
                    fillOpacity={1} 
                    fill="url(#colorOrders)"
                    name="Orders"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Order distribution across regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex flex-col">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.geoDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <XAxis type="number" tickFormatter={value => formatCurrency(value)} />
                    <YAxis type="category" dataKey="country" />
                    <Tooltip formatter={(value, name) => [formatCurrency(value as number), name]} />
                    <Bar dataKey="revenue" fill="#8884d8" radius={[0, 4, 4, 0]}>
                      {dashboardData.geoDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-3">
                {dashboardData.geoDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs">{entry.country}: {entry.count} orders</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Product Performance & Order Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Products with the highest sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topProducts.slice(0, 5).map((product, i) => (
                <div key={product.id} className="flex items-center">
                  <div className="w-8 text-muted-foreground"># {i + 1}</div>
                  <div className="flex-1 font-medium truncate">{product.name}</div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(product.revenue)}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.sales} sold, {product.stock} in stock
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/home/admin/products')}
            >
              View all products
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} orders`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {dashboardData.ordersByStatus.map((status, index) => (
                <div key={status.status} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs capitalize">{status.status.toLowerCase()}: {status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Category & Inventory Distribution  */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Top selling categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.topCategories}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="sales" 
                    name="Sales"
                    radius={[4, 4, 0, 0]}
                  >
                    {dashboardData.topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Low Stock Alert</CardTitle>
                <CardDescription>Products below threshold</CardDescription>
              </div>
              <Badge variant="destructive">
                {dashboardData.lowStockProducts.length} Items
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.lowStockProducts.slice(0, 5).map((product) => {
                const stockPercentage = (product.stock / product.lowStockThreshold) * 100;
                const isLow = stockPercentage < 50;
                
                return (
                  <div key={product.id} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">{product.name}</span>
                      <span className={`text-sm ${isLow ? 'text-red-500' : 'text-amber-500'}`}>
                        {product.stock} / {product.lowStockThreshold}
                      </span>
                    </div>
                    <Progress
                      value={stockPercentage}
                      className={cn(
                        isLow ? 'bg-red-100 progress-indicator-red' : 'bg-amber-100 progress-indicator-amber'
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/home/admin/products')}
            >
              Manage inventory
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity & Insights</CardTitle>
          <CardDescription>Latest store activity and system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-sm font-medium text-blue-700">
                      Most Active Day
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="font-bold">Friday</div>
                  <p className="text-xs text-blue-700/80">32% of weekly orders</p>
                </CardContent>
              </Card>
              
              <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-emerald-600" />
                    <CardTitle className="text-sm font-medium text-emerald-700">
                      Top Country
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="font-bold">{dashboardData.geoDistribution[0]?.country || "USA"}</div>
                  <p className="text-xs text-emerald-700/80">
                    {dashboardData.geoDistribution[0]?.count || 0} orders (${dashboardData.geoDistribution[0]?.revenue?.toFixed(2) || 0})
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-purple-600" />
                    <CardTitle className="text-sm font-medium text-purple-700">
                      Egypt Shipping
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="font-bold">
                    {dashboardData.geoDistribution.find(g => g.country === 'Egypt')?.count || 0} Orders
                  </div>
                  <p className="text-xs text-purple-700/80">
                    {formatCurrency(dashboardData.geoDistribution.find(g => g.country === 'Egypt')?.revenue || 0)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
