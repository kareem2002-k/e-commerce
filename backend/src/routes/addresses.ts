import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = express.Router();

// All address routes require authentication
router.use(authenticate);

// Get all addresses for user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    
    const addresses = await prisma.address.findMany({
      where: { userId }
    });
    
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
});

// Get a specific address
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    const address = await prisma.address.findUnique({
      where: { id }
    });
    
    if (!address || address.userId !== userId) {
      res.status(404).json({ message: 'Address not found' });

      return 
    }
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching address' });
  }
});

// Create a new address
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const {
      fullName,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      phone
    } = req.body;
    
    const address = await prisma.address.create({
      data: {
        userId,
        fullName,
        line1,
        line2,
        city,
        state,
        postalCode,
        country,
        phone
      }
    });
    
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: 'Error creating address' });
  }
});

// Update an address
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      fullName,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      phone
    } = req.body;
    
    // Verify ownership
    const address = await prisma.address.findUnique({
      where: { id }
    });
    
    if (!address || address.userId !== userId) {
      res.status(404).json({ message: 'Address not found' });

      return 
    }
    
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        fullName,
        line1,
        line2,
        city,
        state,
        postalCode,
        country,
        phone
      }
    });
    
    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: 'Error updating address' });
  }
});

// Delete an address
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    // Verify ownership
    const address = await prisma.address.findUnique({
      where: { id }
    });
    
    if (!address || address.userId !== userId) {
      res.status(404).json({ message: 'Address not found' });

      return 
    }
    
    // Check if address is used in orders
    const ordersUsingAddress = await prisma.order.count({
      where: {
        OR: [
          { shippingAddressId: id },
          { billingAddressId: id }
        ]
      }
    });
    
    if (ordersUsingAddress > 0) {
      res.status(400).json({ message: 'This address is used in orders and cannot be deleted' });

      return 
    }
    
    await prisma.address.delete({
      where: { id }
    });
    
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address' });
  }
});

export default router; 