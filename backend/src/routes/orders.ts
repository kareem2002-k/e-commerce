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
        coupons: true
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
        coupons: true
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
      couponCodes 
    } = req.body;
    
    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!cart || cart.cartItems.length === 0) {
      res.status(400).json({ message: 'Cart is empty' });
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
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of cart.cartItems) {
      // Verify product is in stock
      if (item.product.stock < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for ${item.product.name}` });
        return;
      }
      
      const itemTotal = item.product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        productId: item.product.id,
        unitPrice: item.product.price,
        quantity: item.quantity,
        totalPrice: itemTotal
      });
      
      // Update product stock
      await prisma.product.update({
        where: { id: item.product.id },
        data: {
          stock: item.product.stock - item.quantity
        }
      });
    }
    
    // Apply coupons if provided
    let coupons: any[] = [];
    if (couponCodes && couponCodes.length > 0) {
      coupons = await prisma.coupon.findMany({
        where: {
          code: {
            in: couponCodes
          },
          validFrom: {
            lte: new Date()
          },
          validUntil: {
            gte: new Date()
          }
        }
      });
      
      // Apply discount
      for (const coupon of coupons) {
        if (coupon.discountType === 'FIXED') {
          totalAmount -= coupon.discountValue;
        } else {
          totalAmount -= (totalAmount * coupon.discountValue / 100);
        }
        
        // Ensure total amount doesn't go below 0
        totalAmount = Math.max(totalAmount, 0);
        
        // Update coupon usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: {
            usedCount: coupon.usedCount + 1
          }
        });
      }
    }
    
    // Add tax and shipping (simplified calculation)
    const taxRate = 0.1; // 10% tax
    const taxAmount = totalAmount * taxRate;
    const shippingCost = 10.0; // Flat shipping rate
    
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
        shippingCost,
        taxAmount,
        coupons: {
          connect: coupons.map(coupon => ({ id: coupon.id }))
        },
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
        coupons: true
      }
    });
    
    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
    
    // Update cart timestamp
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() }
    });
    
    res.status(201).json(order);
  } catch (error) {
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
        coupons: true
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
        coupons: true
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
        coupons: true
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

export default router; 