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

const router = express.Router();

// User routes (authenticated)
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.put('/password', authenticate, changePassword);

// Admin routes
router.get('/', authenticate, isAdmin, getAllUsers);
router.patch('/:id/role', authenticate, isAdmin, updateUserRole);

export default router; 