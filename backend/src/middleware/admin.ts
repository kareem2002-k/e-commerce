import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Find the user and check if they have admin role
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied. Admin privileges required' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 