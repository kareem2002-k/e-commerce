import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Public routes
// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true
      }
    });

    console.log(product);


    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Protected admin routes
// Create new product
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, sku, price, stock, lowStockThreshold, categoryId, images } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        price: parseFloat(price),
        stock: parseInt(stock),
        lowStockThreshold: parseInt(lowStockThreshold),
        categoryId,
        images: {
          create: images.map((image: { url: string; altText: string }) => ({
            url: image.url,
            altText: image.altText
          }))
        }
      },
      include: {
        category: true,
        images: true
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sku, price, stock, lowStockThreshold, categoryId } = req.body;
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        sku,
        price: parseFloat(price),
        stock: parseInt(stock),
        lowStockThreshold: parseInt(lowStockThreshold),
        categoryId
      },
      include: {
        category: true,
        images: true
      }
    });
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

export default router; 