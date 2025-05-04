import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categories';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import { asyncHandler } from '../utils/routeWrapper';

const router = express.Router();

// Public routes
router.get('/', asyncHandler(getAllCategories));
router.get('/:id', asyncHandler(getCategoryById));

// Admin only routes
router.post('/', authenticate, isAdmin, asyncHandler(createCategory));
router.put('/:id', authenticate, isAdmin, asyncHandler(updateCategory));
router.delete('/:id', authenticate, isAdmin, asyncHandler(deleteCategory));

export default router; 