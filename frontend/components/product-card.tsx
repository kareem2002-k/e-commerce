import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart, ShoppingCart, Star } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    name: string
    category: string
    price: number
    originalPrice?: number
    rating: number
    image: string
    isNew?: boolean
    isSale?: boolean
  }
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <div className="relative">
        <Link href={`/home/products/${product.id}`}>
          <div className="aspect-square overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
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
          {product.isNew && <Badge className="bg-voltBlue-500 hover:bg-voltBlue-600">New</Badge>}
          {product.isSale && <Badge variant="destructive">-{discount}%</Badge>}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-1 text-sm text-muted-foreground">{product.category}</div>
        <Link href={`/home/products/${product.id}`} className="hover:underline">
          <h3 className="font-medium line-clamp-2">{product.name}</h3>
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
                    i < product.rating ? "fill-voltBlue-500 text-voltBlue-500" : "fill-muted text-muted",
                  )}
                />
              ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.rating.toFixed(1)})</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        <Button size="sm" className="rounded-full">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  )
}
