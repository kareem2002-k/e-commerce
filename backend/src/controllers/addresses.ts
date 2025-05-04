import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all addresses for the current user
export const getUserAddresses = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get address by ID
export const getAddressById = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id } = req.params;

    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Check if the address belongs to the user
    if (address.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view this address' });
    }

    res.json(address);
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new address
export const createAddress = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

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

    // Validate required fields
    if (!fullName || !line1 || !city || !state || !postalCode || !country) {
      return res.status(400).json({ 
        message: 'Missing required fields: fullName, line1, city, state, postalCode, and country are required' 
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.userId,
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
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

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

    // Check if address exists and belongs to the user
    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (existingAddress.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this address' });
    }

    // Update the address
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(line1 && { line1 }),
        ...(line2 !== undefined && { line2 }),
        ...(city && { city }),
        ...(state && { state }),
        ...(postalCode && { postalCode }),
        ...(country && { country }),
        ...(phone !== undefined && { phone })
      }
    });

    res.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id } = req.params;

    // Check if address exists and belongs to the user
    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (existingAddress.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this address' });
    }

    // Check if address is used in any orders
    const orderWithAddress = await prisma.order.findFirst({
      where: {
        OR: [
          { shippingAddressId: id },
          { billingAddressId: id }
        ]
      }
    });

    if (orderWithAddress) {
      return res.status(400).json({ 
        message: 'Cannot delete address that is used in orders' 
      });
    }

    // Delete the address
    await prisma.address.delete({
      where: { id }
    });

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 