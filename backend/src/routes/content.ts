import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Public routes - Get active content
router.get('/hero', async (req, res) => {
  try {
    const heroSection = await prisma.heroSection.findFirst({
      where: { active: true },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(heroSection);
  } catch (error) {
    console.error('Error fetching hero section:', error);
    res.status(500).json({ message: 'Error fetching hero section' });
  }
});

router.get('/deals-banner', async (req, res) => {
  try {
    const dealsBanner = await prisma.dealsBanner.findFirst({
      where: { active: true },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(dealsBanner);
  } catch (error) {
    console.error('Error fetching deals banner:', error);
    res.status(500).json({ message: 'Error fetching deals banner' });
  }
});

// Admin routes - Content management
// All admin routes require authentication and admin role
router.use('/admin', authenticate, requireAdmin);

// Hero Section Admin CRUD
router.get('/admin/hero', async (req, res) => {
  try {
    const heroSections = await prisma.heroSection.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(heroSections);
  } catch (error) {
    console.error('Error fetching hero sections:', error);
    res.status(500).json({ message: 'Error fetching hero sections' });
  }
});

router.post('/admin/hero', async (req, res) => {
  try {
    const { 
      title, 
      subtitle, 
      description, 
      primaryBtnText, 
      primaryBtnLink, 
      secondaryBtnText, 
      secondaryBtnLink, 
      imageUrl,
      active 
    } = req.body;
    
    // If this new section is active, deactivate all others
    if (active) {
      await prisma.heroSection.updateMany({
        data: { active: false }
      });
    }
    
    const heroSection = await prisma.heroSection.create({
      data: {
        title,
        subtitle,
        description,
        primaryBtnText,
        primaryBtnLink,
        secondaryBtnText,
        secondaryBtnLink,
        imageUrl,
        active: active ?? true
      }
    });
    
    res.status(201).json(heroSection);
  } catch (error) {
    console.error('Error creating hero section:', error);
    res.status(500).json({ message: 'Error creating hero section' });
  }
});

router.put('/admin/hero/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      subtitle, 
      description, 
      primaryBtnText, 
      primaryBtnLink, 
      secondaryBtnText, 
      secondaryBtnLink, 
      imageUrl,
      active 
    } = req.body;
    
    // If this section is being activated, deactivate all others
    if (active) {
      await prisma.heroSection.updateMany({
        where: { id: { not: id } },
        data: { active: false }
      });
    }
    
    const heroSection = await prisma.heroSection.update({
      where: { id },
      data: {
        title,
        subtitle,
        description,
        primaryBtnText,
        primaryBtnLink,
        secondaryBtnText,
        secondaryBtnLink,
        imageUrl,
        active
      }
    });
    
    res.json(heroSection);
  } catch (error) {
    console.error('Error updating hero section:', error);
    res.status(500).json({ message: 'Error updating hero section' });
  }
});

router.delete('/admin/hero/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.heroSection.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting hero section:', error);
    res.status(500).json({ message: 'Error deleting hero section' });
  }
});

// Deals Banner Admin CRUD
router.get('/admin/deals-banner', async (req, res) => {
  try {
    const dealsBanners = await prisma.dealsBanner.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(dealsBanners);
  } catch (error) {
    console.error('Error fetching deals banners:', error);
    res.status(500).json({ message: 'Error fetching deals banners' });
  }
});

router.post('/admin/deals-banner', async (req, res) => {
  try {
    const { 
      title, 
      subtitle, 
      description, 
      buttonText, 
      buttonLink, 
      discount, 
      imageUrl,
      backgroundColor,
      active 
    } = req.body;
    
    // If this new banner is active, deactivate all others
    if (active) {
      await prisma.dealsBanner.updateMany({
        data: { active: false }
      });
    }
    
    const dealsBanner = await prisma.dealsBanner.create({
      data: {
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        discount,
        imageUrl,
        backgroundColor,
        active: active ?? true
      }
    });
    
    res.status(201).json(dealsBanner);
  } catch (error) {
    console.error('Error creating deals banner:', error);
    res.status(500).json({ message: 'Error creating deals banner' });
  }
});

router.put('/admin/deals-banner/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      subtitle, 
      description, 
      buttonText, 
      buttonLink, 
      discount, 
      imageUrl,
      backgroundColor,
      active 
    } = req.body;
    
    // If this banner is being activated, deactivate all others
    if (active) {
      await prisma.dealsBanner.updateMany({
        where: { id: { not: id } },
        data: { active: false }
      });
    }
    
    const dealsBanner = await prisma.dealsBanner.update({
      where: { id },
      data: {
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        discount,
        imageUrl,
        backgroundColor,
        active
      }
    });
    
    res.json(dealsBanner);
  } catch (error) {
    console.error('Error updating deals banner:', error);
    res.status(500).json({ message: 'Error updating deals banner' });
  }
});

router.delete('/admin/deals-banner/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.dealsBanner.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting deals banner:', error);
    res.status(500).json({ message: 'Error deleting deals banner' });
  }
});

export default router; 