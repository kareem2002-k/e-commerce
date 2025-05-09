import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { uploadImage } from '../utils/imageUpload';

const router = express.Router();

// Upload image route
router.post('/image', authenticate, requireAdmin, async (req, res) => {
  try {
    const { fileData, fileName } = req.body;
    
    if (!fileData || !fileName) {
      res.status(400).json({ message: 'Missing file data or file name' });
    }
    
    const imageUrl = await uploadImage(fileData, fileName);
    
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

export default router; 