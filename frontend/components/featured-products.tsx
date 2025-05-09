"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Product } from "@/types"
import SectionLoading from "@/components/voltedge/section-loading"

// No default products - we only want to show real data

interface FeaturedProductsProps {
  products?: Product[];
  loading?: boolean;
}

export function FeaturedProducts({ products, loading }: FeaturedProductsProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const productsPerPage = 4
  
  // Format real products to match our UI
  const displayProducts = !loading && products && products.length > 0
    ? products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category.name,
        price: product.price,
        // For demo purposes, set a fake original price for some products to display as "on sale"
        originalPrice: Math.random() > 0.5 ? product.price * 1.2 : undefined,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        image: product.images && product.images.length > 0 
          ? product.images[0].url 
          : "/placeholder.svg?height=300&width=300",
        isNew: Math.random() > 0.7, // Randomly mark some products as new for demo
        isSale: Math.random() > 0.5, // Randomly mark some products as on sale for demo
      }))
    : []
  
  // Show loading state
  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" disabled className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <SectionLoading message="Loading featured products..." />
      </div>
    )
  }
  
  // If no products available, don't render the section
  if (displayProducts.length === 0) {
    return null;
  }
  
  const totalPages = Math.ceil(displayProducts.length / productsPerPage)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1))
  }

  // Duplicate products to create continuous carousel effect if needed
  const visibleProducts = displayProducts.length <= productsPerPage 
    ? displayProducts
    : [...displayProducts, ...displayProducts].slice(
        currentIndex * productsPerPage,
        currentIndex * productsPerPage + productsPerPage,
      )

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrevious} 
            className="rounded-full"
            disabled={displayProducts.length <= productsPerPage}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext} 
            className="rounded-full"
            disabled={displayProducts.length <= productsPerPage}
          >
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
