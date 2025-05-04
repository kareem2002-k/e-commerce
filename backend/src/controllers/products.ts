import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all products with optional filtering
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      categoryId, 
      search, 
      minPrice, 
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where = {
      ...(categoryId && { categoryId: String(categoryId) }),
      ...(search && { 
        name: { 
          contains: String(search),
          mode: 'insensitive'
        } 
      }),
      ...(minPrice || maxPrice ? {
        price: {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) })
        }
      } : {})
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new product (admin only)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, sku, price, stock, lowStockThreshold, categoryId, images } = req.body;
    
    // Validate required fields
    if (!name || !sku || price === undefined) {
      res.status(400).json({ message: 'Missing required fields: name, sku, and price are required' });
      return;
    }
    
    // Check if product with this SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    });
    
    if (existingProduct) {
      res.status(400).json({ message: 'A product with this SKU already exists' });
      return;
    }
    
    // Create product in a transaction to handle images
    const product = await prisma.$transaction(async (tx) => {
      // Create the product
      const newProduct = await tx.product.create({
        data: {
          name,
          description,
          sku,
          price: Number(price),
          stock: stock ? Number(stock) : 0,
          lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 5,
          categoryId
        }
      });
      
      // Add images if provided
      if (images && images.length > 0) {
        await tx.image.createMany({
          data: images.map((image: { url: string; altText?: string }) => ({
            url: image.url,
            altText: image.altText || null,
            productId: newProduct.id
          }))
        });
      }
      
      // Return product with images
      return tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          category: true,
          images: true
        }
      });
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (admin only)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, sku, price, stock, lowStockThreshold, categoryId, images } = req.body;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    // Check SKU uniqueness if changed
    if (sku && sku !== existingProduct.sku) {
      const productWithSku = await prisma.product.findUnique({
        where: { sku }
      });
      
      if (productWithSku) {
        res.status(400).json({ message: 'A product with this SKU already exists' });
        return;
      }
    }
    
    // Update product in a transaction to handle images
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update product data
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(sku && { sku }),
          ...(price !== undefined && { price: Number(price) }),
          ...(stock !== undefined && { stock: Number(stock) }),
          ...(lowStockThreshold !== undefined && { lowStockThreshold: Number(lowStockThreshold) }),
          ...(categoryId !== undefined && { categoryId })
        }
      });
      
      // Handle images if provided
      if (images) {
        // Clear existing images first
        await tx.image.deleteMany({
          where: { productId: id }
        });
        
        // Add new images
        if (images.length > 0) {
          await tx.image.createMany({
            data: images.map((image: { url: string; altText?: string }) => ({
              url: image.url,
              altText: image.altText || null,
              productId: id
            }))
          });
        }
      }
      
      // Return updated product with images
      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: true
        }
      });
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    // Delete product (cascade will delete images)
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 