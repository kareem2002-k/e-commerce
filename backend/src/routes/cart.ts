import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId
        },
        include: {
          cartItems: true
        }
      });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// Add item to cart
router.post('/items', async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;
    
    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId
        }
      });
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId
      }
    });

    if (existingCartItem) {
      // Update quantity if item exists
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity
        },
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      });
      
      // Update cart timestamp
      await prisma.cart.update({
        where: { id: cart.id },
        data: { updatedAt: new Date() }
      });
      
      return res.json(updatedCartItem);
    }
    
    // Create new cart item
    const newCartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity
      },
      include: {
        product: {
          include: {
            images: true
          }
        }
      }
    });
    
    // Update cart timestamp
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() }
    });
    
    res.status(201).json(newCartItem);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart' });
  }
});

// Update cart item quantity
router.put('/items/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { quantity } = req.body;
    
    // Verify cart ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true }
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Delete item if quantity is 0
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id }
      });
      
      // Update cart timestamp
      await prisma.cart.update({
        where: { id: cartItem.cartId },
        data: { updatedAt: new Date() }
      });
      
      return res.json({ message: 'Item removed from cart' });
    }
    
    // Update quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          include: {
            images: true
          }
        }
      }
    });
    
    // Update cart timestamp
    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() }
    });
    
    res.json(updatedCartItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item' });
  }
});

// Remove item from cart
router.delete('/items/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    // Verify cart ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true }
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Delete cart item
    await prisma.cartItem.delete({
      where: { id }
    });
    
    // Update cart timestamp
    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() }
    });
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart' });
  }
});

// Clear cart
router.delete('/', async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
    
    // Update cart timestamp
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() }
    });
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

export default router; 