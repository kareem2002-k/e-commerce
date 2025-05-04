import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Public route - Validate coupon code
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const coupon = await prisma.coupon.findUnique({
      where: { code }
    });
    
    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Coupon not found' });
    }
    
    const now = new Date();
    
    // Check if coupon is valid
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ valid: false, message: 'Coupon is not valid at this time' });
    }
    
    // Check if coupon has exceeded usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Coupon usage limit has been reached' });
    }
    
    // Return valid coupon
    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description
      }
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Error validating coupon' });
  }
});

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Get all coupons (admin only)
router.get('/', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        validUntil: 'desc'
      }
    });
    
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

// Get a specific coupon (admin only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupon' });
  }
});

// Create a new coupon (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      usageLimit
    } = req.body;
    
    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });
    
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    
    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        usageLimit: usageLimit ? parseInt(usageLimit) : null
      }
    });
    
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon' });
  }
});

// Update a coupon (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      usageLimit
    } = req.body;
    
    // Update coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        usageLimit: usageLimit ? parseInt(usageLimit) : null
      }
    });
    
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon' });
  }
});

// Delete a coupon (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if coupon has been used in orders
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true
          }
        }
      }
    });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    if (coupon.orders.length > 0) {
      return res.status(400).json({ 
        message: 'This coupon has been used in orders and cannot be deleted. Consider updating validUntil instead.' 
      });
    }
    
    // Delete coupon
    await prisma.coupon.delete({
      where: { id }
    });
    
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon' });
  }
});

export default router; 