"use client"

import { useState } from "react"
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
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock product data
const product = {
  id: "1",
  name: "VoltEdge Pro Laptop",
  description:
    "Experience unparalleled performance with the VoltEdge Pro Laptop. Featuring a stunning 15.6-inch 4K display, powerful processor, and all-day battery life, this laptop is perfect for professionals and creatives alike.",
  price: 1299.99,
  originalPrice: 1499.99,
  rating: 4.8,
  reviewCount: 124,
  stock: 15,
  sku: "VE-PL-001",
  category: "Laptops",
  tags: ["laptop", "gaming", "professional", "high-performance"],
  images: [
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600&text=Side+View",
    "/placeholder.svg?height=600&width=600&text=Back+View",
    "/placeholder.svg?height=600&width=600&text=Keyboard",
  ],
  colors: [
    { name: "Space Gray", value: "#343434" },
    { name: "Silver", value: "#E0E0E0" },
    { name: "Midnight Blue", value: "#1A365D" },
  ],
  specifications: {
    processor: "Intel Core i7-12700H",
    memory: "16GB DDR5",
    storage: "512GB NVMe SSD",
    display: "15.6-inch 4K (3840 x 2160) IPS",
    graphics: "NVIDIA GeForce RTX 3060 6GB",
    battery: "70Wh, up to 10 hours",
    ports: "2x USB-C, 2x USB-A, HDMI, 3.5mm audio",
    wireless: "Wi-Fi 6E, Bluetooth 5.2",
    dimensions: "14.1 x 9.7 x 0.7 inches",
    weight: "4.2 lbs (1.9 kg)",
    operatingSystem: "Windows 11 Pro",
    warranty: "1-year limited warranty",
  },
  features: [
    "Ultra-fast performance with latest-gen processor",
    "Stunning 4K display with 100% sRGB color accuracy",
    "All-day battery life for productivity on the go",
    "Advanced cooling system for sustained performance",
    "Backlit keyboard with customizable RGB lighting",
    "Premium aluminum unibody construction",
  ],
  isNew: true,
  isSale: true,
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [quantity, setQuantity] = useState(1)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

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
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href={`/products/${product.category.toLowerCase()}`} className="hover:text-foreground">
          {product.category}
        </Link>
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
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain p-4"
                priority
              />
            </motion.div>
            <div className="absolute left-4 top-4 flex flex-col gap-1">
              {product.isNew && <Badge className="bg-voltBlue-500 hover:bg-voltBlue-600">New</Badge>}
              {product.isSale && <Badge variant="destructive">-{discount}%</Badge>}
            </div>
          </div>
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
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} - View ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
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
                        i < Math.floor(product.rating)
                          ? "fill-voltBlue-500 text-voltBlue-500"
                          : "fill-muted text-muted",
                      )}
                    />
                  ))}
                <span className="ml-2 text-sm font-medium">{product.rating}</span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
            {product.isSale && (
              <Badge variant="destructive">Save ${(product.originalPrice - product.price).toFixed(2)}</Badge>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="space-y-4">
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

            <div>
              <h3 className="font-medium mb-2">Quantity</h3>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-r-none"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <div className="flex-1 border-y px-4 py-2 text-center">
                  <span className="text-sm font-medium">{quantity}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-l-none"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {product.stock > 0 ? (
                  <>
                    <span className="text-green-600 dark:text-green-400 font-medium">In Stock</span> - {product.stock}{" "}
                    units available
                  </>
                ) : (
                  <span className="text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" className="flex-1 sm:flex-none">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
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
          <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="mt-4 space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-semibold mb-4">Key Features</h3>
            <ul className="space-y-3">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Zap className="h-5 w-5 text-voltBlue-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="specifications" className="mt-4">
          <ProductSpecifications specifications={product.specifications} />
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <ProductReviews productId={params.id} rating={product.rating} reviewCount={product.reviewCount} />
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <section className="mt-12">
        <RelatedProducts category={product.category} currentProductId={params.id} />
      </section>
    </div>
  )
}
