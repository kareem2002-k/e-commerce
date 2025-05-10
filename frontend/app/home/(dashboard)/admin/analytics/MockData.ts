// Mock data for analytics dashboard testing

export const getMockAnalyticsData = () => {
  return {
    salesSummary: {
      totalRevenue: 24786.43,
      orderCount: 182,
      averageOrderValue: 136.19,
      revenueChange: 12.5
    },
    weeklySales: [
      { date: 'May 04', amount: 1230.45, count: 12 },
      { date: 'May 05', amount: 1542.78, count: 15 },
      { date: 'May 06', amount: 1345.92, count: 13 },
      { date: 'May 07', amount: 1876.34, count: 18 },
      { date: 'May 08', amount: 2134.67, count: 21 },
      { date: 'May 09', amount: 1954.21, count: 19 },
      { date: 'May 10', amount: 1832.45, count: 17 }
    ],
    monthlySales: [
      { date: 'Dec 2024', amount: 15243.87, count: 145 },
      { date: 'Jan 2025', amount: 18765.32, count: 178 },
      { date: 'Feb 2025', amount: 17432.98, count: 165 },
      { date: 'Mar 2025', amount: 19876.54, count: 189 },
      { date: 'Apr 2025', amount: 21543.76, count: 205 },
      { date: 'May 2025', amount: 23421.65, count: 223 }
    ],
    topProducts: [
      { id: '1', name: 'Wireless Bluetooth Headphones', stock: 45, sales: 32, revenue: 3840.00 },
      { id: '2', name: 'Ultra HD Smart TV 55"', stock: 12, sales: 8, revenue: 7992.00 },
      { id: '3', name: 'Premium Leather Wallet', stock: 78, sales: 25, revenue: 1250.00 },
      { id: '4', name: 'Stainless Steel Water Bottle', stock: 65, sales: 42, revenue: 1260.00 },
      { id: '5', name: 'Organic Cotton T-Shirt', stock: 120, sales: 37, revenue: 1110.00 },
      { id: '6', name: 'Professional DSLR Camera', stock: 8, sales: 5, revenue: 4995.00 }
    ],
    customerMetrics: {
      total: 342,
      new: 47,
      returning: 178,
      churnRate: 34.2
    },
    geoDistribution: [
      { country: 'United States', count: 98, revenue: 13456.78 },
      { country: 'Canada', count: 32, revenue: 4321.54 },
      { country: 'United Kingdom', count: 24, revenue: 3654.32 },
      { country: 'Germany', count: 18, revenue: 2789.65 },
      { country: 'Egypt', count: 15, revenue: 1932.45 },
      { country: 'Australia', count: 12, revenue: 1654.32 },
      { country: 'Other', count: 23, revenue: 3276.54 }
    ],
    ordersByStatus: [
      { status: 'PENDING', count: 28 },
      { status: 'CONFIRMED', count: 42 },
      { status: 'PROCESSING', count: 35 },
      { status: 'SHIPPED', count: 56 },
      { status: 'DELIVERED', count: 104 },
      { status: 'CANCELLED', count: 12 },
      { status: 'REFUNDED', count: 5 }
    ],
    topCategories: [
      { category: 'Electronics', sales: 87 },
      { category: 'Clothing', sales: 65 },
      { category: 'Home & Kitchen', sales: 54 },
      { category: 'Beauty & Personal Care', sales: 38 },
      { category: 'Sports & Outdoors', sales: 27 }
    ],
    lowStockProducts: [
      { id: '1', name: 'Ultra HD Smart TV 55"', stock: 3, lowStockThreshold: 5 },
      { id: '2', name: 'Professional DSLR Camera', stock: 2, lowStockThreshold: 5 },
      { id: '3', name: 'Smart Home Security System', stock: 4, lowStockThreshold: 5 },
      { id: '4', name: 'Bluetooth Noise-Cancelling Headphones', stock: 4, lowStockThreshold: 10 },
      { id: '5', name: 'Stainless Steel Cookware Set', stock: 3, lowStockThreshold: 8 }
    ]
  };
}; 