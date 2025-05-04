import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { OrderStatus, PaymentStatus } from '../generated/prisma';

// Get user's orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.userId },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: { take: 1 }
                }
              }
            }
          },
          shippingAddress: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.order.count({
        where: { userId: req.userId }
      })
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: { take: 1 }
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
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the user or if the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (order.userId !== req.userId && user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { shippingAddressId, billingAddressId, paymentMethod, couponCodes = [] } = req.body;

    // Validate required fields
    if (!shippingAddressId || !billingAddressId || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Missing required fields: shippingAddressId, billingAddressId, and paymentMethod are required' 
      });
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: {
        cartItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Verify addresses belong to the user
    const [shippingAddress, billingAddress] = await Promise.all([
      prisma.address.findFirst({
        where: { id: shippingAddressId, userId: req.userId }
      }),
      prisma.address.findFirst({
        where: { id: billingAddressId, userId: req.userId }
      })
    ]);

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Invalid shipping address' });
    }

    if (!billingAddress) {
      return res.status(400).json({ message: 'Invalid billing address' });
    }

    // Check for valid coupons
    const coupons = await prisma.coupon.findMany({
      where: {
        code: { in: couponCodes },
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
        usageLimit: {
          OR: [
            { equals: null },
            { gt: { usedCount: true } }
          ]
        }
      }
    });

    // Calculate totals
    const subtotal = cart.cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Apply discounts from coupons
    let discountAmount = 0;
    for (const coupon of coupons) {
      if (coupon.discountType === 'FIXED') {
        discountAmount += coupon.discountValue;
      } else if (coupon.discountType === 'PERCENTAGE') {
        discountAmount += subtotal * (coupon.discountValue / 100);
      }
    }

    // Calculate shipping and tax
    const shippingCost = 10.0; // This would typically be calculated based on shipping address, weight, etc.
    const taxRate = 0.1; // 10% tax (would be determined by shipping location)
    const taxAmount = (subtotal - discountAmount) * taxRate;

    // Calculate final total
    const totalAmount = subtotal - discountAmount + shippingCost + taxAmount;

    // Create the order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: req.userId,
          totalAmount,
          shippingAddressId,
          billingAddressId,
          paymentMethod,
          shippingCost,
          taxAmount,
          orderStatus: 'PENDING',
          paymentStatus: 'PENDING',
          coupons: {
            connect: coupons.map(coupon => ({ id: coupon.id }))
          }
        }
      });

      // Create order items
      await tx.orderItem.createMany({
        data: cart.cartItems.map(item => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity
        }))
      });

      // Update coupon usage counts
      for (const coupon of coupons) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      // Update product stock
      for (const item of cart.cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      // Return the created order with relations
      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  images: { take: 1 }
                }
              }
            }
          },
          shippingAddress: true,
          billingAddress: true,
          coupons: true
        }
      });
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update order status' });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate order status if provided
    if (orderStatus && !Object.values(OrderStatus).includes(orderStatus as OrderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // Validate payment status if provided
    if (paymentStatus && !Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(orderStatus && { orderStatus: orderStatus as OrderStatus }),
        ...(paymentStatus && { paymentStatus: paymentStatus as PaymentStatus })
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view all orders' });
    }

    const { 
      status, 
      paymentStatus, 
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(status && { orderStatus: status as OrderStatus }),
      ...(paymentStatus && { paymentStatus: paymentStatus as PaymentStatus }),
      ...(search && { 
        OR: [
          { id: { contains: String(search) } },
          { user: { name: { contains: String(search), mode: 'insensitive' } } },
          { user: { email: { contains: String(search), mode: 'insensitive' } } }
        ]
      })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          shippingAddress: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 