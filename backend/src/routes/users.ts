import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('dssaaddsa')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Format users for response, including isAdmin property
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.role === 'ADMIN',
      createdAt: user.createdAt,
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get a specific user
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Format user for response, including isAdmin property
    const formattedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.role === 'ADMIN',
      createdAt: user.createdAt,
    };
    
    res.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Promote user to admin
router.put('/:id/promote', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
       res.status(404).json({ message: 'User not found' });
       return;
    }
    
    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    
    // Format user for response
    const formattedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      isAdmin: updatedUser.role === 'ADMIN',
      createdAt: updatedUser.createdAt,
    };
    
    res.json(formattedUser);
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ message: 'Error promoting user to admin' });
  }
});

// Delete user
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Don't allow deletion of the current admin user
    if (existingUser.id === req.userId) {
       res.status(400).json({ 
        message: 'Cannot delete your own account while logged in' 
      });
      return;
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id },
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router; 