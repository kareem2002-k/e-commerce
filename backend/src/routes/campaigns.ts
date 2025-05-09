import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Track campaign click - public route
router.post('/track/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    });
    
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }
    
    // Increment click count
    await prisma.campaign.update({
      where: { id },
      data: {
        clickCount: { increment: 1 }
      }
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking campaign click:', error);
    res.status(500).json({ message: 'Error tracking campaign click' });
  }
});

// Track campaign conversion (when coupon is used) - public route
router.post('/track/:id/conversion', async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    });
    
    if (!campaign) {
       res.status(404).json({ message: 'Campaign not found' });
       return;
    }
    
    // Increment conversion count
    await prisma.campaign.update({
      where: { id },
      data: {
        conversionCount: { increment: 1 }
      }
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking campaign conversion:', error);
    res.status(500).json({ message: 'Error tracking campaign conversion' });
  }
});

// Get active campaign for homepage - public route
router.get('/active', async (req, res) => {
  try {
    const activeCampaign = await prisma.campaign.findFirst({
      where: { 
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      include: {
        coupon: {
          select: {
            code: true,
            discountType: true,
            discountValue: true,
            description: true,
            validFrom: true,
            validUntil: true,
            usageLimit: true,
            usedCount: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(activeCampaign);
  } catch (error) {
    console.error('Error fetching active campaign:', error);
    res.status(500).json({ message: 'Error fetching active campaign' });
  }
});

// All admin routes below require authentication and admin role
router.use(authenticate, requireAdmin);

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        coupon: {
          select: {
            code: true,
            discountType: true,
            discountValue: true,
            validFrom: true,
            validUntil: true,
            usageLimit: true,
            usedCount: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Error fetching campaigns' });
  }
});

// Get a specific campaign
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        coupon: true
      }
    });
    
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Error fetching campaign' });
  }
});

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      imageUrl,
      couponId,
      isActive,
      startDate,
      endDate,
      position,
    } = req.body;
    
    // Check if coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId }
    });
    
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    
    // If this campaign is being set as active, deactivate all other campaigns
    if (isActive) {
      await prisma.campaign.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }
    
    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        imageUrl,
        couponId,
        isActive: isActive || false,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        position
      }
    });
    
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Error creating campaign' });
  }
});

// Update a campaign
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      imageUrl,
      couponId,
      isActive,
      startDate,
      endDate,
      position,
    } = req.body;
    
    // If this campaign is being set as active, deactivate all other campaigns
    if (isActive) {
      await prisma.campaign.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      });
    }
    
    // Update campaign
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl,
        couponId,
        isActive: isActive || false,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        position
      }
    });
    
    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Error updating campaign' });
  }
});

// Delete a campaign
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.campaign.delete({
      where: { id }
    });
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Error deleting campaign' });
  }
});

export default router; 