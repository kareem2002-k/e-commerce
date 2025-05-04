import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/auth';

// Get current user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, email } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Check if password is valid
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const passwordValid = await comparePassword(currentPassword, user.password);

    if (!passwordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin only: Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if user is admin
    const requestingUser = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!requestingUser || requestingUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }

    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(search && {
        OR: [
          { email: { contains: String(search), mode: 'insensitive' } },
          { name: { contains: String(search), mode: 'insensitive' } }
        ]
      })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin only: Update user role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id } = req.params;
    const { role } = req.body;

    // Check if requesting user is admin
    const requestingUser = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!requestingUser || requestingUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }

    // Check if role is valid
    if (role !== 'ADMIN' && role !== 'CUSTOMER') {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user exists
    const userToUpdate = await prisma.user.findUnique({
      where: { id }
    });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent updating own role
    if (id === req.userId) {
      return res.status(400).json({ message: 'Cannot update your own role' });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 