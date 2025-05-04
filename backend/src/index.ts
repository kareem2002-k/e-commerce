import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cors from 'cors';
// Load environment variables
dotenv.config();

// use cors

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Welcome route
app.get('/', (_req, res) => {
  res.send('Hello,  basel!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
