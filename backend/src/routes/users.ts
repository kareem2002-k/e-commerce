import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  updateUserRole
} from '../controllers/users';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import { asyncHandler } from '../utils/routeWrapper';

const router = express.Router();

// User routes (authenticated)
router.get('/profile', authenticate, asyncHandler(getUserProfile));
router.put('/profile', authenticate, asyncHandler(updateUserProfile));
router.put('/password', authenticate, asyncHandler(changePassword));

// Admin routes
router.get('/', authenticate, isAdmin, asyncHandler(getAllUsers));
router.patch('/:id/role', authenticate, isAdmin, asyncHandler(updateUserRole));

export default router; 