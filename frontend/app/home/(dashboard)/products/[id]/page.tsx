"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductReviews } from "@/components/product-reviews"
import { RelatedProducts } from "@/components/related-products"
import { ProductSpecifications } from "@/components/product-specifications"
import AddToCartButton from "@/components/cart/AddToCartButton"
import {
  ChevronRight,
  Heart,
  Share2,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProduct } from "@/hooks/useProducts"
import { Product } from "@/types"
import { useParams } from "next/navigation"

// Extend the Product type with additional properties used in this page
interface ExtendedProduct extends Product {
  colors?: { name: string; value: string }[];
  originalPrice?: number;
  isNew?: boolean;
  isSale?: boolean;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  specifications?: Record<string, string>;
  tags?: string[];
}

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState<{ name: string; value: string } | null>(null)
  const params = useParams<{ id: string }>();

  const { product: fetchedProduct, loading, error } = useProduct(params.id)



  // Cast product to extended type
  const product = fetchedProduct as ExtendedProduct | null

  useEffect(() => {
    if (product?.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0])
    }
  }, [product])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-voltBlue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold">Error loading product</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button asChild>
          <Link href="/products">Return to Products</Link>
        </Button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Button asChild>
          <Link href="/products">Return to Products</Link>
        </Button>
      </div>
    )
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href={`/products/${product.category.name.toLowerCase()}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-background">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]?.url || "/placeholder.svg"}
                  alt={product.images[selectedImage]?.altText || product.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <Image
                  src="/placeholder.svg"
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              )}
            </motion.div>
            <div className="absolute left-4 top-4 flex flex-col gap-1">
              {product.isNew && <Badge className="bg-voltBlue-500 hover:bg-voltBlue-600">New</Badge>}
              {product.isSale && <Badge variant="destructive">-{discount}%</Badge>}
            </div>
          </div>
          {product.images && product.images.length > 0 && (
            <div className="flex gap-4 overflow-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={cn(
                    "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border",
                    selectedImage === index ? "ring-2 ring-voltBlue-500" : "",
                  )}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.altText || `${product.name} - View ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(product.rating || 0)
                          ? "fill-voltBlue-500 text-voltBlue-500"
                          : "fill-muted text-muted",
                      )}
                    />
                  ))}
                <span className="ml-2 text-sm font-medium">{product.rating || 0}</span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm text-muted-foreground">{product.reviewCount || 0} reviews</span>
              {product.sku && (
                <>
                  <Separator orientation="vertical" className="h-5" />
                  <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
            {product.isSale && product.originalPrice && (
              <Badge variant="destructive">Save ${(product.originalPrice - product.price).toFixed(2)}</Badge>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="space-y-4">
            {product.colors && product.colors.length > 0 && selectedColor && (
              <div>
                <h3 className="font-medium mb-2">Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      className={cn(
                        "h-8 w-8 rounded-full border-2",
                        selectedColor.name === color.name ? "border-voltBlue-500" : "border-transparent",
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedColor(color)}
                      title={color.name}
                    >
                      <span className="sr-only">{color.name}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Selected: {selectedColor.name}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              <AddToCartButton 
                productId={product.id} 
                stock={product.stock} 
                product={product as Product}
                size="lg"
                className="flex-1 sm:flex-none"
              />
              
              <Button size="lg" variant="outline" className="flex-1 sm:flex-none">
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
              <Button size="icon" variant="outline">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Truck className="h-5 w-5 text-voltBlue-500" />
              <div>
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <ShieldCheck className="h-5 w-5 text-voltBlue-500" />
              <div>
                <p className="text-sm font-medium">2-Year Warranty</p>
                <p className="text-xs text-muted-foreground">Extended coverage</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <RotateCcw className="h-5 w-5 text-voltBlue-500" />
              <div>
                <p className="text-sm font-medium">30-Day Returns</p>
                <p className="text-xs text-muted-foreground">Hassle-free returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <Tabs defaultValue="features" className="mt-8">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="mt-4 space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-semibold mb-4">Key Features</h3>
            {product.features && product.features.length > 0 ? (
              <ul className="space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-voltBlue-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No features listed for this product.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="specifications" className="mt-4">
          <ProductSpecifications specifications={product.specifications || {}} />
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <ProductReviews productId={params.id} rating={product.rating || 0} reviewCount={product.reviewCount || 0} />
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <section className="mt-12">
        <RelatedProducts category={product.category.name} currentProductId={params.id} />
      </section>
    </div>
  )
}
