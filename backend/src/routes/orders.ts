import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Get user's orders
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        coupons: true,
        shippingMethod: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log(orders);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get a specific order
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        coupons: true,
        shippingMethod: true
      }
    });
    
    if (!order) {
      
       res.status(404).json({ message: 'Order not found' });
       return;
    }
    
    // Check if user owns the order or is an admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (order.userId !== userId && user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized to view this order' });
      return;
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      shippingAddressId, 
      billingAddressId, 
      paymentMethod, 
      couponCode,
      cartItems,
      shippingMethodId
    } = req.body;
    
    // Validate cart items
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      res.status(400).json({ message: 'Cart is empty or invalid' });
      return;
    }
    
    // Verify addresses belong to user
    const shippingAddress = await prisma.address.findFirst({
      where: {
        id: shippingAddressId,
        userId
      }
    });
    
    const billingAddress = await prisma.address.findFirst({
      where: {
        id: billingAddressId,
        userId
      }
    });
    
    if (!shippingAddress || !billingAddress) {
      res.status(400).json({ message: 'Invalid addresses' });
      return;
    }
    
    // Verify shipping method exists if provided
    let shippingMethod = null;
    if (shippingMethodId) {
      shippingMethod = await prisma.shippingMethod.findUnique({
        where: { id: shippingMethodId, isActive: true }
      });
      
      if (!shippingMethod) {
        res.status(400).json({ message: 'Invalid shipping method' });
        return;
      }
    }
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    let totalWeight = 0;
    
    for (const item of cartItems) {
      // Get product details from database to ensure accuracy and prevent tampering
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      
      if (!product) {
        res.status(400).json({ message: `Product not found: ${item.productId}` });
        return;
      }
      
      // Verify product is in stock
      if (product.stock < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        return;
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      // Add to total weight for shipping calculation
      totalWeight += (product.weight || 1.0) * item.quantity;
      
      orderItems.push({
        productId: product.id,
        unitPrice: product.price,
        quantity: item.quantity,
        totalPrice: itemTotal
      });
      
      // Update product stock
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: product.stock - item.quantity
        }
      });
    }
    
    // Apply coupon if provided
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          validFrom: {
            lte: new Date()
          },
          validUntil: {
            gte: new Date()
          }
        }
      });
      
      if (appliedCoupon) {
        // Apply discount
        if (appliedCoupon.discountType === 'FIXED') {
          totalAmount -= appliedCoupon.discountValue;
        } else {
          totalAmount -= (totalAmount * appliedCoupon.discountValue / 100);
        }
        
        // Ensure total amount doesn't go below 0
        totalAmount = Math.max(totalAmount, 0);
        
        // Update coupon usage
        await prisma.coupon.update({
          where: { id: appliedCoupon.id },
          data: {
            usedCount: appliedCoupon.usedCount + 1
          }
        });
      }
    }
    
    // Calculate shipping cost based on location, weight, and method
    let shippingCost = 0;
    if (shippingMethod) {
      // Find the most specific shipping rate
      let applicableRate = await prisma.shippingRate.findFirst({
        where: {
          shippingMethodId: shippingMethod.id,
          country: shippingAddress.country,
          state: shippingAddress.state,
          minWeight: { lte: totalWeight },
          maxWeight: { gte: totalWeight },
          OR: [
            { minOrderAmount: { lte: totalAmount } },
            { minOrderAmount: null }
          ],
    
        }
      });
      
      // If no specific rate found, try country-level rate
      if (!applicableRate) {
        applicableRate = await prisma.shippingRate.findFirst({
          where: {
            shippingMethodId: shippingMethod.id,
            country: shippingAddress.country,
            state: null,
            minWeight: { lte: totalWeight },
            maxWeight: { gte: totalWeight },
            OR: [
              { minOrderAmount: { lte: totalAmount } },
              { minOrderAmount: null }
            ],
          }
        });
      }
      
      // If no country-level rate, use default
      if (!applicableRate) {
        applicableRate = await prisma.shippingRate.findFirst({
          where: {
            shippingMethodId: shippingMethod.id,
            country: '',
            minWeight: { lte: totalWeight },
            maxWeight: { gte: totalWeight },
            OR: [
              { minOrderAmount: { lte: totalAmount } },
              { minOrderAmount: null }
            ],
          }
        });
      }
      
      // Set shipping cost
      shippingCost = applicableRate ? applicableRate.cost : shippingMethod.defaultCost;
      
      // Check for free shipping
      const freeShippingItem = await prisma.product.findFirst({
        where: {
          id: { in: cartItems.map(item => item.productId) },
          AND: [
            { freeShippingThreshold: { not: null } },
            { freeShippingThreshold: { lte: totalAmount } }
          ]
        }
      });
      
      if (freeShippingItem) {
        shippingCost = 0;
      }
    } else {
      // Default shipping cost if no method provided
      shippingCost = 10.0;
    }
    
    // Calculate tax based on address
    let taxRate = 0.1; // Default 10% tax
    
    // Try to find location-specific tax rate
    const addressTaxRate = await prisma.taxRate.findFirst({
      where: {
        country: shippingAddress.country,
        state: shippingAddress.state,
        isActive: true
      }
    });
    
    // If no state-specific rate, try country-level rate
    if (!addressTaxRate) {
      const countryTaxRate = await prisma.taxRate.findFirst({
        where: {
          country: shippingAddress.country,
          state: null,
          isActive: true
        }
      });
      
      if (countryTaxRate) {
        taxRate = countryTaxRate.rate;
      }
    } else {
      taxRate = addressTaxRate.rate;
    }
    
    const taxAmount = totalAmount * taxRate;
    
    // Add tax and shipping to total
    totalAmount += taxAmount + shippingCost;
    
    // Create order
    const order = await prisma.order.create({
      data: {
        user: {
          connect: { id: userId }
        },
        totalAmount,
        shippingAddress: {
          connect: { id: shippingAddressId }
        },
        billingAddress: {
          connect: { id: billingAddressId }
        },
        paymentMethod,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        shippingMethod: shippingMethodId ? {
          connect: { id: shippingMethodId }
        } : undefined,
        shippingCost,
        taxAmount,
        coupons: appliedCoupon ? {
          connect: [{ id: appliedCoupon.id }]
        } : undefined,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        coupons: true,
        shippingMethod: true
      }
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Cancel an order
router.post('/:id/cancel', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    
    // Check if user owns the order
    if (order.userId !== userId) {
      res.status(403).json({ message: 'Not authorized to cancel this order' });
      return;
    }
    
    // Check if order can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
        res.status(400).json({ message: 'Cannot cancel this order' });
      return;
    }
    
    // Restore product stock
    for (const item of order.orderItems) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: {
          stock: item.product.stock + item.quantity
        }
      });
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: 'CANCELLED',
        paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED'
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        coupons: true,
        shippingMethod: true
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// Admin routes
// Get all orders (admin only)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        coupons: true,
        shippingMethod: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Admin: Get all refund requests
router.get('/admin/refunds', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const where: any = {};
    
    // Filter by status if provided
    if (status && typeof status === 'string') {
      where.status = status;
    }
    
    const refunds = await prisma.refund.findMany({
      where,
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    });
    
    res.json(refunds);
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ message: 'Error fetching refunds' });
  }
});

// Admin: Process a refund request
router.put('/admin/refunds/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, refundMethod, transactionId } = req.body;
    
    // Find the refund
    const refund = await prisma.refund.findUnique({
      where: { id },
      include: {
        order: true
      }
    });
    
    if (!refund) {
      res.status(404).json({ message: 'Refund request not found' });
      return;
    }
    
    // Update the refund
    const updatedRefund = await prisma.refund.update({
      where: { id },
      data: {
        status,
        adminNotes,
        refundMethod,
        transactionId,
        processedAt: ['APPROVED', 'REJECTED', 'PROCESSED'].includes(status) ? new Date() : undefined
      },
      include: {
        order: true
      }
    });
    
    // If refund is approved, update order payment status
    if (status === 'APPROVED' || status === 'PROCESSED') {
      await prisma.order.update({
        where: { id: refund.orderId },
        data: {
          paymentStatus: 'REFUNDED',
          orderStatus: 'REFUNDED'
        }
      });
      
      // Here you would add code to process the actual refund through your payment provider
      // e.g. Stripe, PayPal, etc.
    }
    
    res.json(updatedRefund);
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Error processing refund' });
  }
});

// Update order status (admin only)
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus,
        paymentStatus
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        coupons: true,
        shippingMethod: true
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Request a refund (user)
router.post('/:id/refund/request', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { amount, reason, description } = req.body;
    
    // First check if the order exists and belongs to the user
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        refunds: true
      }
    });
    
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    
    if (order.userId !== userId) {
      res.status(403).json({ message: 'Not authorized to request refund for this order' });
      return;
    }
    
    // Check if order is in a refundable state
    if (!['DELIVERED', 'SHIPPED'].includes(order.orderStatus)) {
      res.status(400).json({ 
        message: 'Refund can only be requested for delivered or shipped orders' 
      });
      return;
    }
    
    // Check if a refund has already been requested
    if (order.refunds.some(refund => ['REQUESTED', 'APPROVED', 'PROCESSED'].includes(refund.status))) {
      res.status(400).json({ message: 'A refund has already been requested for this order' });
      return;
    }
    
    // Validate refund amount
    if (!amount || amount <= 0 || amount > order.totalAmount) {
      res.status(400).json({ 
        message: 'Invalid refund amount. Must be greater than 0 and not more than the order total.' 
      });
      return;
    }
    
    // Create the refund request
    const refund = await prisma.refund.create({
      data: {
        order: {
          connect: { id: order.id }
        },
        amount,
        reason,
        description
      }
    });
    
    // Update order status to indicate a refund is in progress
    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'RETURNED'
      }
    });
    
    res.status(201).json(refund);
  } catch (error) {
    console.error('Error requesting refund:', error);
    res.status(500).json({ message: 'Error requesting refund' });
  }
});

// Get refund requests for a specific order (user)
router.get('/:id/refunds', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    // Check if the order exists and belongs to the user
    const order = await prisma.order.findUnique({
      where: { id }
    });
    
    if (!order) {
       res.status(404).json({ message: 'Order not found' });
       return;
    }
    
    if (order.userId !== userId) {
      res.status(403).json({ message: 'Not authorized to view refunds for this order' });
      return;
    }
    
    // Fetch refund requests
    const refunds = await prisma.refund.findMany({
      where: { orderId: id },
      orderBy: { requestedAt: 'desc' }
    });
    
    res.json(refunds);
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ message: 'Error fetching refunds' });
  }
});

export default router; 