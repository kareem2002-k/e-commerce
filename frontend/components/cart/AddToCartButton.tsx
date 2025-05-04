"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  className?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function AddToCartButton({
  productId,
  stock,
  className = "",
  variant = 'default',
  size = 'default'
}: AddToCartButtonProps) {
  const { addToCart, loading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  const handleAddToCart = async () => {
    if (loading) return;
    
    await addToCart(productId, quantity);
    
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
        disabled={loading || stock === 0 || added}
      >
        {added ? (
          <Check className="h-4 w-4" />
        ) : loading ? (
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
          disabled={quantity <= 1 || loading}
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
          disabled={quantity >= stock || loading}
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
          disabled={loading || stock === 0 || added}
        >
          {stock === 0 ? (
            "Out of Stock"
          ) : added ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Added to Cart
            </>
          ) : loading ? (
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