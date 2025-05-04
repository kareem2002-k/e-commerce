import { useState, useEffect } from 'react';
import { Cart, CartItem, Product } from '@/types';
import { toast } from 'sonner';

const CART_STORAGE_KEY = 'voltedge_cart';

const initialCart: Cart = {
  items: [],
  total: 0
};

export function useCart() {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, loading]);

  // Calculate cart total
  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  // Add item to cart
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      // Check if the product is already in the cart
      const existingItemIndex = prevCart.items.findIndex(item => item.productId === product.id);
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        };
      } else {
        // Add new item if it doesn't exist
        newItems = [
          ...prevCart.items,
          {
            productId: product.id,
            product,
            quantity
          }
        ];
      }
      
      // Calculate the new total
      const newTotal = calculateTotal(newItems);
      
      toast.success(`Added ${product.name} to cart`, {
        description: `Quantity: ${quantity}`,
        action: {
          label: "View Cart",
          onClick: () => window.location.href = '/cart'
        }
      });
      
      return {
        items: newItems,
        total: newTotal
      };
    });
  };

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const newItems = prevCart.items.map(item => 
        item.productId === productId 
          ? { ...item, quantity } 
          : item
      );
      
      return {
        items: newItems,
        total: calculateTotal(newItems)
      };
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const itemToRemove = prevCart.items.find(item => item.productId === productId);
      const newItems = prevCart.items.filter(item => item.productId !== productId);
      
      if (itemToRemove) {
        toast.info(`Removed ${itemToRemove.product.name} from cart`);
      }
      
      return {
        items: newItems,
        total: calculateTotal(newItems)
      };
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart(initialCart);
    toast.info('Cart cleared');
  };

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };
} 