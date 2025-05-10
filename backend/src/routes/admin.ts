import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';
import { sub, startOfDay, endOfDay, format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// Get analytics data for the admin dashboard
router.get('/analytics', async (req, res) => {
  try {
    // Parse time range from query
    const { timeRange = '30d' } = req.query;
    
    // Set start date based on time range
    let startDate = new Date();
    let previousStartDate = new Date();
    let previousEndDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate = sub(new Date(), { days: 7 });
        previousStartDate = sub(startDate, { days: 7 });
        previousEndDate = sub(startDate, { days: 1 });
        break;
      case '30d':
        startDate = sub(new Date(), { days: 30 });
        previousStartDate = sub(startDate, { days: 30 });
        previousEndDate = sub(startDate, { days: 1 });
        break;
      case '90d':
        startDate = sub(new Date(), { days: 90 });
        previousStartDate = sub(startDate, { days: 90 });
        previousEndDate = sub(startDate, { days: 1 });
        break;
      case 'year':
        startDate = startOfMonth(new Date(new Date().getFullYear(), 0, 1)); // Jan 1 of current year
        previousStartDate = startOfMonth(new Date(new Date().getFullYear() - 1, 0, 1)); // Jan 1 of previous year
        previousEndDate = endOfMonth(new Date(new Date().getFullYear() - 1, 11, 31)); // Dec 31 of previous year
        break;
      default:
        startDate = sub(new Date(), { days: 30 });
        previousStartDate = sub(startDate, { days: 30 });
        previousEndDate = sub(startDate, { days: 1 });
    }
    
    // Get current period orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      }
    });
    
    // Get previous period orders (for comparison)
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate
        }
      }
    });
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueChange = previousRevenue === 0 
      ? 100 
      : ((totalRevenue - previousRevenue) / previousRevenue) * 100;
    
    // Calculate average order value
    const averageOrderValue = orders.length === 0 
      ? 0 
      : totalRevenue / orders.length;
    
    // Get customer metrics
    const allUsers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        createdAt: true
      }
    });
    
    const newCustomers = allUsers.filter(user => 
      user.createdAt >= startDate
    ).length;
    
    // Get weekly sales data
    const weeklySales = [];
    // Create a 7-day sales chart
    for (let i = 6; i >= 0; i--) {
      const date = sub(new Date(), { days: i });
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      // Filter orders for this day
      const dayOrders = orders.filter(order => 
        order.createdAt >= dayStart && order.createdAt <= dayEnd
      );
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      weeklySales.push({
        date: format(date, 'MMM dd'),
        amount: dayRevenue,
        count: dayOrders.length
      });
    }
    
    // Get monthly sales data
    const monthlySales = [];
    // Create a 6-month sales chart
    for (let i = 5; i >= 0; i--) {
      const date = sub(new Date(), { months: i });
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      // Filter orders for this month
      const monthOrders = orders.filter(order => 
        order.createdAt >= monthStart && order.createdAt <= monthEnd
      );
      
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      monthlySales.push({
        date: format(date, 'MMM yyyy'),
        amount: monthRevenue,
        count: monthOrders.length
      });
    }
    
    // Get geographic distribution
    const geoDistribution: { country: any; count: any; revenue: any; }[] = [];
    const countryMap = new Map();
    
    orders.forEach(order => {
      const country = order.shippingAddress.country;
      if (!countryMap.has(country)) {
        countryMap.set(country, { count: 0, revenue: 0 });
      }
      
      countryMap.get(country).count += 1;
      countryMap.get(country).revenue += order.totalAmount;
    });
    
    countryMap.forEach((value, country) => {
      geoDistribution.push({
        country,
        count: value.count,
        revenue: value.revenue
      });
    });
    
    // Sort by revenue (highest first)
    geoDistribution.sort((a, b) => b.revenue - a.revenue);
    
    // Get orders by status
    const ordersByStatus: { status: string; count: number }[] = [];
    const statusMap = new Map();
    
    orders.forEach(order => {
      if (!statusMap.has(order.orderStatus)) {
        statusMap.set(order.orderStatus, 0);
      }
      
      statusMap.set(order.orderStatus, statusMap.get(order.orderStatus) + 1);
    });
    
    statusMap.forEach((count, status) => {
      ordersByStatus.push({ status, count });
    });
    
    // Get top products
    const productMap = new Map();
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const productId = item.product.id;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            id: productId,
            name: item.product.name,
            stock: item.product.stock,
            sales: 0,
            revenue: 0
          });
        }
        
        productMap.get(productId).sales += item.quantity;
        productMap.get(productId).revenue += item.totalPrice;
      });
    });
    
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue);
    
    // Get top categories
    const categoryData = await prisma.category.findMany({
      include: {
        products: {
          include: {
            orderItems: true
          }
        }
      }
    });
    
    const topCategories = categoryData
      .map(category => {
        const sales = category.products.reduce((sum, product) => 
          sum + product.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0)
        , 0);
        
        return {
          category: category.name,
          sales
        };
      })
      .filter(cat => cat.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
    
    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: prisma.product.fields.lowStockThreshold
        }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true
      },
      orderBy: {
        stock: 'asc'
      }
    });
    
    // Calculate total returning customers (approximation - those who placed more than one order)
    const customerOrderCounts = new Map();
    orders.forEach(order => {
      if (!customerOrderCounts.has(order.userId)) {
        customerOrderCounts.set(order.userId, 0);
      }
      customerOrderCounts.set(order.userId, customerOrderCounts.get(order.userId) + 1);
    });
    
    const returningCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length;
    
    // Construct the response
    const analyticsData = {
      salesSummary: {
        totalRevenue,
        orderCount: orders.length,
        averageOrderValue,
        revenueChange
      },
      weeklySales,
      monthlySales,
      topProducts,
      customerMetrics: {
        total: allUsers.length,
        new: newCustomers,
        returning: returningCustomers,
        churnRate: allUsers.length > 0 ? (allUsers.length - newCustomers - returningCustomers) / allUsers.length * 100 : 0
      },
      geoDistribution,
      ordersByStatus,
      topCategories,
      lowStockProducts
    };
    
    res.json(analyticsData);
  } catch (error) {
    console.error('Error generating analytics data:', error);
    res.status(500).json({ message: 'Error generating analytics data' });
  }
});

export default router; 