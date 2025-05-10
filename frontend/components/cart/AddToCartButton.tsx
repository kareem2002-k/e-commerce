"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getUrl } from '@/utils';
interface AddToCartButtonProps {
  productId: string;
  stock: number;
  className?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  product?: Product; // Add optional product prop to pass product details directly
}

export default function AddToCartButton({
  productId,
  stock,
  className = "",
  variant = 'default',
  size = 'default',
  product: initialProduct,
}: AddToCartButtonProps) {
  const { addToCart, addingToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const { token } = useAuth();

  // Fetch product details if not provided as prop
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      return;
    }
    
    const fetchProduct = async () => {
      try { 
        const API_URL = getUrl();
        const response = await fetch(`${API_URL}/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.error('Failed to fetch product details, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };
    
    fetchProduct();
  }, [productId, token, initialProduct]);
  
  const handleAddToCart = async () => {
    if (addingToCart) return;
    
    // Either use the product from state or attempt one last fetch
    if (!product) {
      try {
        const API_URL = getUrl();
        // One last attempt to fetch product details if not available
        const response = await fetch(`${API_URL}/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          await addToCart(productId, quantity, data);
        } else {
          // Fallback with minimal details
          const fallbackProduct = {
            id: productId,
            name: 'Product',
            price: 0,
            description: '',
            images: []
          };
          await addToCart(productId, quantity, fallbackProduct);
        }
      } catch (err) {
        console.error('Failed to add product to cart:', err);
        // Fallback with minimal details
        const fallbackProduct = {
          id: productId,
          name: 'Product',
          price: 0,
          description: '',
          images: []
        };
        await addToCart(productId, quantity, fallbackProduct);
      }
    } else {
      // Use existing product data
      await addToCart(productId, quantity, product);
    }
    
    // Show success animation
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };
  
  const increaseQuantity = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // For icon-only button
  if (size === 'icon') {
    return (
      <Button
        variant={variant}
        size="icon"
        className={className}
        onClick={handleAddToCart}
        disabled={addingToCart || stock === 0 || added}
      >
        {added ? (
          <Check className="h-4 w-4" />
        ) : addingToCart ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </Button>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      {/* Quantity controls */}
      <div className="flex items-center border rounded-md h-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-full rounded-r-none"
          onClick={decreaseQuantity}
          disabled={quantity <= 1 || addingToCart}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="w-10 text-center">
          <span className="text-sm font-medium">{quantity}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-full rounded-l-none"
          onClick={increaseQuantity}
          disabled={quantity >= stock || addingToCart}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Add to cart button */}
      <motion.div
        animate={added ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant={variant}
          size={size}
          className={`relative ${className}`}
          onClick={handleAddToCart}
          disabled={addingToCart || stock === 0 || added}
        >
          {stock === 0 ? (
            "Out of Stock"
          ) : added ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Added to Cart
            </>
          ) : addingToCart ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
} 