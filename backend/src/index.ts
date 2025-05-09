import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import addressRoutes from './routes/addresses';
import couponRoutes from './routes/coupons';
import reviewRoutes from './routes/reviews';
import uploadRoutes from './routes/uploads';
import contentRoutes from './routes/content';
import usersRouter from './routes/users';
import cors from 'cors';
import { setupDefaultContent } from './setupContent';

// Load environment variables
dotenv.config();

// use cors

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Welcome route
app.get('/', (_req, res) => {
  res.send('Hello,  basel!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', usersRouter);   


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Setup default content
  setupDefaultContent().catch(err => {
    console.error('Error during content setup:', err);
  });
});
