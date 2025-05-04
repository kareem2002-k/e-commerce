import express from 'express';
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
} from '../controllers/addresses';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All address routes require authentication
router.get('/', authenticate, getUserAddresses);
router.get('/:id', authenticate, getAddressById);
router.post('/', authenticate, createAddress);
router.put('/:id', authenticate, updateAddress);
router.delete('/:id', authenticate, deleteAddress);

export default router; 