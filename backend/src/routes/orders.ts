import express from 'express';
import {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getAllOrders
} from '../controllers/orders';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';

const router = express.Router();

// User routes (authenticated)
router.get('/me', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, createOrder);

// Admin routes
router.get('/', authenticate, isAdmin, getAllOrders);
router.patch('/:id/status', authenticate, isAdmin, updateOrderStatus);

export default router; 