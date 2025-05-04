import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get user's cart
export const getCart = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Find or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: {
        cartItems: {
          include: {
            product: {
              include: {
                images: { take: 1 }
              }
            }
          }
        }
      }
    });

    // If no cart exists, create a new one
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.userId },
        include: {
          cartItems: {
            include: {
              product: {
                include: {
                  images: { take: 1 }
                }
              }
            }
          }
        }
      });
    }

    // Calculate total
    const total = cart.cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.json({
      cart,
      total
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // Find or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.userId }
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update existing cart item
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: {
          product: {
            include: {
              images: { take: 1 }
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        },
        include: {
          product: {
            include: {
              images: { take: 1 }
            }
          }
        }
      });
    }

    // Update cart's updatedAt timestamp
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() }
    });

    res.status(200).json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!cartItemId) {
      return res.status(400).json({ message: 'Cart item ID is required' });
    }

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Find the cart item and make sure it belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.cart.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this cart' });
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // Update the cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: {
          include: {
            images: { take: 1 }
          }
        }
      }
    });

    // Update cart's updatedAt timestamp
    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() }
    });

    res.json(updatedCartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { cartItemId } = req.params;

    if (!cartItemId) {
      return res.status(400).json({ message: 'Cart item ID is required' });
    }

    // Find the cart item and make sure it belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.cart.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this cart' });
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    // Update cart's updatedAt timestamp
    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // Update cart's updatedAt timestamp
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() }
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 