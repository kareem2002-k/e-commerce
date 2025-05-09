"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ProductCard, type Product } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Sample featured products data
const featuredProducts: Product[] = [
  {
    id: "1",
    name: "VoltEdge Pro Laptop",
    category: "Laptops",
    price: 1299.99,
    originalPrice: 1499.99,
    rating: 4.8,
    reviewCount: 24,
    image: "/placeholder.svg?height=300&width=300",
    isNew: true,
    isSale: true,
  },
  {
    id: "2",
    name: "VoltEdge Ultra Smartphone",
    category: "Smartphones",
    price: 899.99,
    originalPrice: 999.99,
    rating: 4.7,
    reviewCount: 18,
    image: "/placeholder.svg?height=300&width=300",
    isSale: true,
  },
  {
    id: "3",
    name: "VoltEdge Noise-Cancelling Headphones",
    category: "Audio",
    price: 249.99,
    rating: 4.9,
    reviewCount: 36,
    image: "/placeholder.svg?height=300&width=300",
    isNew: true,
  },
  {
    id: "4",
    name: "VoltEdge Smart Watch Series 5",
    category: "Wearables",
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.6,
    reviewCount: 12,
    image: "/placeholder.svg?height=300&width=300",
    isSale: true,
  },
  {
    id: "5",
    name: "VoltEdge 4K Ultra HD Smart TV",
    category: "TVs",
    price: 799.99,
    originalPrice: 899.99,
    rating: 4.5,
    reviewCount: 42,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "6",
    name: "VoltEdge Wireless Gaming Controller",
    category: "Gaming",
    price: 69.99,
    rating: 4.4,
    reviewCount: 56,
    image: "/placeholder.svg?height=300&width=300",
  },
]

/**
 * Featured products carousel component.
 * Displays a rotating selection of featured products.
 */
export function FeaturedProducts() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const productsPerPage = 4
  const totalPages = Math.ceil(featuredProducts.length / productsPerPage)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1))
  }

  // Calculate visible products based on screen size and current index
  const getVisibleProducts = () => {
    const products = [...featuredProducts, ...featuredProducts]
    return products.slice(currentIndex * productsPerPage, currentIndex * productsPerPage + productsPerPage)
  }

  const visibleProducts = getVisibleProducts()

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevious} className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleProducts.map((product, index) => (
          <motion.div
            key={`${product.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
