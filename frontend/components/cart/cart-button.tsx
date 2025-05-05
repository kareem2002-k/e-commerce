"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"

interface CartButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

/**
 * Button component that opens the cart drawer when clicked.
 * Can be styled with different variants and sizes.
 *
 * @param variant - Button variant (default, outline, etc.)
 * @param size - Button size (default, sm, lg, icon)
 * @param className - Additional CSS classes
 */
export function CartButton({ variant = "ghost", size = "icon", className }: CartButtonProps) {
  const { toggleCart } = useCart()

  return (
    <Button variant={variant} size={size} onClick={toggleCart} className={className}>
      <ShoppingCart className="h-5 w-5" />
      <span className="sr-only">Open cart</span>
    </Button>
  )
}
