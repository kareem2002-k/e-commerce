import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/routeWrapper';

const router = express.Router();

// All cart routes require authentication
router.get('/', authenticate, asyncHandler(getCart));
router.post('/items', authenticate, asyncHandler(addToCart));
router.put('/items/:cartItemId', authenticate, asyncHandler(updateCartItem));
router.delete('/items/:cartItemId', authenticate, asyncHandler(removeFromCart));
router.delete('/', authenticate, asyncHandler(clearCart));

export default router; 