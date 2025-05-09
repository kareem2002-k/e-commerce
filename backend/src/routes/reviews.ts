import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Utility function to update product review metrics
const updateProductReviewMetrics = async (productId: string) => {
  try {
    // Get all reviews for the product
    const reviews = await prisma.review.findMany({
      where: { productId }
    });
    
    const reviewCount = reviews.length;
    let rating = 0;
    
    if (reviewCount > 0) {
      const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
      rating = ratingSum / reviewCount;
    }
    
    console.log(`Updated metrics for product ${productId}: ${reviewCount} reviews, ${rating.toFixed(2)} rating`);
    
    return { reviewCount, rating };
  } catch (error) {
    console.error('Error updating product review metrics:', error);
    throw error;
  }
};

// Public route - Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Protected routes
// Get reviews by current user
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Add a review
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, rating, comment } = req.body;
    
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    // Check if user has purchased the product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          orderStatus: {
            in: ['DELIVERED', 'CONFIRMED', 'SHIPPED']
          }
        }
      }
    });
    
    if (!hasPurchased) {
      res.status(403).json({ message: 'You can only review products you have purchased' });
      return;
    }
    
    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: userId || ''
        }
      }
    });
    
    if (existingReview) {
      res.status(400).json({ message: 'You have already reviewed this product' });
      return;
    }
    
    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: userId || '',
        rating: parseInt(rating),
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        product: {
          include: {
            images: true
          }
        }
      }
    });
    
    // Update product review metrics
    await updateProductReviewMetrics(productId);
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review' });
  }
});

// Update a review
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Verify ownership
    const review = await prisma.review.findUnique({
      where: { id }
    });
    
    if (!review || review.userId !== userId) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    
    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: parseInt(rating),
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        product: {
          include: {
            images: true
          }
        }
      }
    });
    
    // Update product review metrics
    await updateProductReviewMetrics(updatedReview.productId);
    
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Delete a review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    // Verify ownership or admin
    const review = await prisma.review.findUnique({
      where: { id }
    });
    
    if (!review || (review.userId !== userId && user?.role !== 'ADMIN')) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    
    // Store product ID before deleting
    const productId = review.productId;
    
    // Delete review
    await prisma.review.delete({
      where: { id }
    });
    
    // Update product review metrics
    await updateProductReviewMetrics(productId);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// Admin route - Get all reviews
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          include: {
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

export default router; 