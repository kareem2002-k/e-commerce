"use client"

import { useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Mock related products
const relatedProducts = [
  {
    id: "2",
    name: "VoltEdge Ultra Laptop",
    category: "Laptops",
    price: 1499.99,
    originalPrice: 1699.99,
    rating: 4.7,
    image: "/placeholder.svg?height=300&width=300",
    isSale: true,
  },
  {
    id: "3",
    name: "VoltEdge Lite Laptop",
    category: "Laptops",
    price: 899.99,
    rating: 4.5,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "4",
    name: "VoltEdge Gaming Laptop",
    category: "Laptops",
    price: 1799.99,
    originalPrice: 1999.99,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=300",
    isNew: true,
    isSale: true,
  },
  {
    id: "5",
    name: "VoltEdge Business Laptop",
    category: "Laptops",
    price: 1199.99,
    rating: 4.6,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "6",
    name: "VoltEdge Student Laptop",
    category: "Laptops",
    price: 799.99,
    originalPrice: 899.99,
    rating: 4.4,
    image: "/placeholder.svg?height=300&width=300",
    isSale: true,
  },
]

interface RelatedProductsProps {
  category: string
  currentProductId: string
}

export function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const productsPerPage = 4

  // Filter out the current product
  const filteredProducts = relatedProducts.filter((product) => product.id !== currentProductId)

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1))
  }

  const visibleProducts = [...filteredProducts, ...filteredProducts].slice(
    currentIndex * productsPerPage,
    currentIndex * productsPerPage + productsPerPage,
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Related Products</h2>
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
          <ProductCard key={`${product.id}-${index}`} product={product} />
        ))}
      </div>
    </div>
  )
}
