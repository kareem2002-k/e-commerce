import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviews';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/routeWrapper';

const router = express.Router();

// Public routes
router.get('/product/:productId', asyncHandler(getProductReviews));

// Authenticated routes
router.post('/product/:productId', authenticate, asyncHandler(createReview));
router.put('/:reviewId', authenticate, asyncHandler(updateReview));
router.delete('/:reviewId', authenticate, asyncHandler(deleteReview));

export default router; 