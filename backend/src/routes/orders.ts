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
import { asyncHandler } from '../utils/routeWrapper';

const router = express.Router();

// User routes (authenticated)
router.get('/me', authenticate, asyncHandler(getUserOrders));
router.get('/:id', authenticate, asyncHandler(getOrderById));
router.post('/', authenticate, asyncHandler(createOrder));

// Admin routes
router.get('/', authenticate, isAdmin, asyncHandler(getAllOrders));
router.patch('/:id/status', authenticate, isAdmin, asyncHandler(updateOrderStatus));

export default router; 