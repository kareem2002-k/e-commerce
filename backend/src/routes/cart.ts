import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All cart routes require authentication
router.get('/', authenticate, getCart);
router.post('/items', authenticate, addToCart);
router.put('/items/:cartItemId', authenticate, updateCartItem);
router.delete('/items/:cartItemId', authenticate, removeFromCart);
router.delete('/', authenticate, clearCart);

export default router; 