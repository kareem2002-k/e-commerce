"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ShoppingCart, Trash2, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Cart drawer component that displays from the right side of the screen.
 * Shows cart items, subtotal, and checkout options.
 *
 * @param open - Whether the cart drawer is open
 * @param onOpenChange - Function to call when the open state changes
 */
export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  // Mock cart items - in a real app, this would come from a cart context or state management
  const [cartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "VoltEdge Pro Laptop",
      price: 1299.99,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "3",
      name: "VoltEdge Noise-Cancelling Headphones",
      price: 249.99,
      quantity: 2,
      image: "/placeholder.svg?height=80&width=80",
    },
  ])

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0" side="right">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart ({cartItems.reduce((total, item) => total + item.quantity, 0)})
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </SheetHeader>

        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-20 w-20 relative rounded-md overflow-hidden border flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <Link href={`/products/${item.id}`} className="font-medium hover:underline">
                        {item.name}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between font-medium">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground">Shipping and taxes calculated at checkout</div>
              <div className="flex flex-col gap-2">
                <Button className="w-full" size="lg">
                  Checkout
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={() => onOpenChange(false)}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Button onClick={() => onOpenChange(false)}>Continue Shopping</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
