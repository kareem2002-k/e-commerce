import express from 'express';
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
} from '../controllers/addresses';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/routeWrapper';

const router = express.Router();

// All address routes require authentication
router.get('/', authenticate, asyncHandler(getUserAddresses));
router.get('/:id', authenticate, asyncHandler(getAddressById));
router.post('/', authenticate, asyncHandler(createAddress));
router.put('/:id', authenticate, asyncHandler(updateAddress));
router.delete('/:id', authenticate, asyncHandler(deleteAddress));

export default router; 