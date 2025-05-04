import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get reviews for a product
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.review.count({
        where: { productId }
      })
    ]);

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      avgRating,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a product review
export const createReview = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: req.userId
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: req.userId,
          orderStatus: {
            in: ['DELIVERED', 'SHIPPED']
          }
        }
      }
    });

    if (!hasPurchased) {
      return res.status(400).json({ message: 'You can only review products you have purchased' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.userId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a review
export const updateReview = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (existingReview.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { reviewId } = req.params;

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the owner or an admin
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (existingReview.userId !== req.userId && user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 