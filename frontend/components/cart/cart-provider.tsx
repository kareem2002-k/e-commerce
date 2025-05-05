"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface CartProviderProps {
  children: ReactNode
}

interface CartContextType {
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * Provider component for cart functionality.
 * Manages cart open/close state and provides methods to control the cart drawer.
 *
 * @param children - Child components that will have access to cart context
 */
export function CartProvider({ children }: CartProviderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const toggleCart = () => setIsCartOpen((prev) => !prev)

  return <CartContext.Provider value={{ isCartOpen, openCart, closeCart, toggleCart }}>{children}</CartContext.Provider>
}

/**
 * Hook to access cart context.
 * Provides access to cart state and methods.
 */
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
