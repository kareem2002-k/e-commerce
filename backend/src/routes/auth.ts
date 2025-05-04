import express from 'express';
import { register, login, getCurrentUser } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = express.Router();
// Register new user
router.post('/register', async (req, res) => {
  try {
    await register(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    await login(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user (protected route)
router.get('/me', authenticate, async (req, res) => {
  try {
    await getCurrentUser(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 