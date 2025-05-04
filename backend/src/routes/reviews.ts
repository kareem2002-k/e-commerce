import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviews';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Authenticated routes
router.post('/product/:productId', authenticate, createReview);
router.put('/:reviewId', authenticate, updateReview);
router.delete('/:reviewId', authenticate, deleteReview);

export default router; 