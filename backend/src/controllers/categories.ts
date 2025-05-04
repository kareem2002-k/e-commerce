import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all categories
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              take: 1
            }
          },
          take: 10
        }
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new category (admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parentId } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category with this name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }
    
    // Verify parent category exists if provided
    if (parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId }
      });
      
      if (!parentExists) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        description,
        parentId
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (admin only)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, parentId } = req.body;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check name uniqueness if changed
    if (name && name !== existingCategory.name) {
      const categoryWithName = await prisma.category.findUnique({
        where: { name }
      });
      
      if (categoryWithName) {
        return res.status(400).json({ message: 'A category with this name already exists' });
      }
    }
    
    // Verify parent category exists if provided
    if (parentId && parentId !== existingCategory.parentId) {
      // Prevent circular reference (category can't be its own parent)
      if (parentId === id) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }
      
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId }
      });
      
      if (!parentExists) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }
    
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId })
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category (admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        products: { take: 1, select: { id: true } },
        children: { take: 1, select: { id: true } }
      }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has products
    if (existingCategory.products.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with associated products. Remove or reassign products first.' 
      });
    }
    
    // Check if category has child categories
    if (existingCategory.children.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with child categories. Remove or reassign child categories first.' 
      });
    }
    
    await prisma.category.delete({
      where: { id }
    });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 