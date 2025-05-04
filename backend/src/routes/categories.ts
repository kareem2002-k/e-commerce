import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Public routes
// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// // Get category by ID with products
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const category = await prisma.category.findUnique({
//       where: { id },
//       include: {
//         parent: true,
//         children: true,
//         products: {
//           include: {
//             images: true
//           }
//         }
//       }
//     });
    
//     if (!category) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
    
//     res.json(category);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching category' });
//   }
// });

// Protected admin routes
// Create new category
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    
    const category = await prisma.category.create({
      data: {
        name,
        description,
        parentId
      },
      include: {
        parent: true
      }
    });
    
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentId } = req.body;
    
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        parentId
      },
      include: {
        parent: true
      }
    });
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.category.delete({
      where: { id }
    });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

export default router; 