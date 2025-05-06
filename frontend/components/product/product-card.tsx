"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { Product as ApiProduct } from "@/types"

export interface ProductCardData {
  id: string
  name: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  image: string
  isNew?: boolean
  isSale?: boolean
  brand?: string
  tags?: string[]
}

interface ProductCardProps {
  product: ProductCardData | ApiProduct
  className?: string
}

/**
 * Reusable product card component.
 * Displays product information in a consistent format.
 *
 * @param product - The product data to display
 * @param className - Optional additional CSS classes
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const { openCart } = useCart()
  
  // Format API product to match our UI expectation
  const formattedProduct = formatProduct(product)
  
  const discount = formattedProduct.originalPrice
    ? Math.round(((formattedProduct.originalPrice - formattedProduct.price) / formattedProduct.originalPrice) * 100)
    : 0

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <div className="relative">
        <Link href={`/home/products/${formattedProduct.id}`}>
          <div className="aspect-square overflow-hidden">
            <Image
              src={formattedProduct.image || "/placeholder.svg"}
              alt={formattedProduct.name}
              width={300}
              height={300}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        </Link>
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
        </div>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {formattedProduct.isNew && <Badge className="bg-voltBlue-500 hover:bg-voltBlue-600">New</Badge>}
          {formattedProduct.isSale && <Badge variant="destructive">-{discount}%</Badge>}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-1 text-sm text-muted-foreground">{formattedProduct.category}</div>
        <Link href={`/home/products/${formattedProduct.id}`} className="hover:underline">
          <h3 className="font-medium line-clamp-2">{formattedProduct.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < formattedProduct.rating ? "fill-voltBlue-500 text-voltBlue-500" : "fill-muted text-muted",
                  )}
                />
              ))}
          </div>
          <span className="text-xs text-muted-foreground">({formattedProduct.rating.toFixed(1)})</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">${formattedProduct.price.toFixed(2)}</span>
          {formattedProduct.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${formattedProduct.originalPrice.toFixed(2)}</span>
          )}
        </div>
        <Button size="sm" className="rounded-full" onClick={openCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Helper function to format any product type to match our UI expectations
 */
function formatProduct(product: ProductCardData | ApiProduct): ProductCardData {
  // If it's already a ProductCardData, just return it
  if ('image' in product) {
    return product as ProductCardData;
  }
  
  // Otherwise, it's an API product, so transform it
  const apiProduct = product as ApiProduct;
  
  // For demo purposes, create some random properties
  // In a real app, this would be based on actual data
  const isNew = Math.random() > 0.7;
  const isSale = Math.random() > 0.5;
  const originalPrice = isSale ? product.price * 1.2 : undefined;
  const rating = 4 + Math.random();
  
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    category: apiProduct.category?.name || 'Unknown',
    price: apiProduct.price,
    originalPrice,
    rating,
    image: apiProduct.images && apiProduct.images.length > 0 
      ? apiProduct.images[0].url 
      : "/placeholder.svg?height=300&width=300",
    isNew,
    isSale,
    brand: apiProduct.brand,
    tags: [] // Add tags if available in your API
  };
}
