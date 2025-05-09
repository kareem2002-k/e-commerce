import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Public routes
// Get all products
router.get('/', authenticate, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        reviews: true
      }
    });
    
    // Calculate review metrics for each product
    const productsWithMetrics = products.map(product => {
      const reviewCount = product.reviews.length;
      let rating = 0;
      
      if (reviewCount > 0) {
        const ratingSum = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        rating = ratingSum / reviewCount;
      }
      
      // Remove full reviews from response
      const { reviews, ...productWithoutReviews } = product;
      
      return {
        ...productWithoutReviews,
        reviewCount,
        rating
      };
    });
    
    res.json(productsWithMetrics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Search products with filters
router.get('/search', authenticate, async (req, res) => {
  try {
    const {
      q = '',
      category,
      minPrice,
      maxPrice,
      brands,
      sortBy = 'relevance',
    } = req.query;

    // Build the where clause
    const where: any = {};
    
    // Search term filter
    if (q) {
      where.OR = [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
      ];
    }
    
    // Category filter
    if (category && category !== 'All Categories') {
      where.category = {
        name: category as string
      };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }
    
    // Brands filter
    if (brands) {
      const brandsList = (brands as string).split(',');
      where.brand = {
        in: brandsList
      };
    }
    
    // Build the orderBy object
    let orderBy: any = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating_desc':
        orderBy = { rating: 'desc' };
        break;
      default:
        orderBy = { name: 'asc' }; // Default sorting
    }
    
    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        images: true,
        reviews: true
      }
    });
    
    // Calculate review metrics for each product
    const productsWithMetrics = products.map(product => {
      const reviewCount = product.reviews.length;
      let rating = 0;
      
      if (reviewCount > 0) {
        const ratingSum = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        rating = ratingSum / reviewCount;
      }
      
      // Remove full reviews from response
      const { reviews, ...productWithoutReviews } = product;
      
      return {
        ...productWithoutReviews,
        reviewCount,
        rating
      };
    });
    
    console.log('Search results:', productsWithMetrics);
    res.json(productsWithMetrics);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;


  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: true
      }
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Calculate review metrics
    const reviewCount = product.reviews.length;
    let rating = 0;
    
    if (reviewCount > 0) {
      const ratingSum = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      rating = ratingSum / reviewCount;
    }

    // Remove the full reviews array from the response to keep it light
    const { reviews, ...productWithoutReviews } = product;

    // Return product with review metrics
    res.json({
      ...productWithoutReviews,
      reviewCount,
      rating
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Protected admin routes
// Create new product
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      sku, 
      price, 
      stock, 
      lowStockThreshold, 
      categoryId, 
      images, 
      brand, 
      featured, 
      discount,
      features,
      freeShippingThreshold,
      warrantyPeriod,
      warrantyDescription,
      returnPeriod,
      returnDescription
    } = req.body;
    
    // Include all fields in the productData object
    const productData = {
      name,
      description,
      sku,
      price: parseFloat(price),
      stock: parseInt(stock),
      lowStockThreshold: parseInt(lowStockThreshold),
      categoryId,
      featured: featured || false,
      discount: discount ? parseFloat(discount) : null,
      // Add the new fields directly
      features: Array.isArray(features) ? features : [],
      freeShippingThreshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : 50,
      warrantyPeriod,
      warrantyDescription,
      returnPeriod,
      returnDescription,
      images: {
        create: images.map((image: { url: string; altText: string }) => ({
          url: image.url,
          altText: image.altText
        }))
      }
    };
    
    // Create the product with all fields
    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true,
        images: true
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name,
      description,
      sku,
      price,
      stock,
      lowStockThreshold,
      categoryId,
      images,
      featured,
      discount,
      features,
      freeShippingThreshold,
      warrantyPeriod,
      warrantyDescription,
      returnPeriod,
      returnDescription
    } = req.body;
    
    // First, delete all existing images for this product
    await prisma.image.deleteMany({
      where: { productId: id }
    });
    
    // Include all fields in the productData object
    const productData = {
      name,
      description,
      sku,
      price: parseFloat(price),
      stock: parseInt(stock),
      lowStockThreshold: parseInt(lowStockThreshold),
      categoryId,
      featured: featured || false,
      discount: discount ? parseFloat(discount) : null,
      // Add the new fields directly
      features: Array.isArray(features) ? features : [],
      freeShippingThreshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : undefined,
      warrantyPeriod,
      warrantyDescription,
      returnPeriod,
      returnDescription,
      // Create new images
      images: images ? {
        create: images.map((image: { url: string; altText: string }) => ({
          url: image.url,
          altText: image.altText
        }))
      } : undefined
    };
    
    // Update the product with all fields
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
        images: true
      }
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

export default router; 