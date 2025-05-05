"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchFilters } from "@/components/search/search-filters"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal, Search, X } from "lucide-react"
import SectionLoading from "@/components/voltedge/section-loading"
import { useProductSearch, SearchFilters as Filters } from "@/hooks/useProductSearch"

// Mock products data
const allProducts = [
  {
    id: "1",
    name: "VoltEdge Pro Laptop",
    category: "Laptops",
    price: 1299.99,
    originalPrice: 1499.99,
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=300",
    isNew: true,
    isSale: true,
    brand: "VoltEdge",
    tags: ["laptop", "gaming", "professional", "deals"],
  },
  {
    id: "2",
    name: "VoltEdge Ultra Smartphone",
    category: "Smartphones",
    price: 899.99,
    originalPrice: 999.99,
    rating: 4.7,
    image: "/placeholder.svg?height=300&width=300",
    isSale: true,
    brand: "VoltEdge",
    tags: ["smartphone", "5G", "camera", "deals"],
  },
  {
    id: "3",
    name: "VoltEdge Noise-Cancelling Headphones",
    category: "Audio",
    price: 249.99,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=300",
    isNew: true,
    brand: "VoltEdge",
    tags: ["audio", "wireless", "noise-cancelling"],
  },
  {
    id: "4",
    name: "VoltEdge Smart Watch Series 5",
    category: "Wearables",
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.6,
    image: "/placeholder.svg?height=300&width=300",
    isSale: true,
    brand: "VoltEdge",
    tags: ["wearable", "fitness", "smartwatch", "deals"],
  },
  {
    id: "5",
    name: "VoltEdge 4K Ultra HD Smart TV",
    category: "TVs",
    price: 799.99,
    originalPrice: 899.99,
    rating: 4.5,
    image: "/placeholder.svg?height=300&width=300",
    brand: "VoltEdge",
    tags: ["tv", "4k", "smart"],
  },
  {
    id: "6",
    name: "VoltEdge Wireless Gaming Controller",
    category: "Gaming",
    price: 69.99,
    rating: 4.4,
    image: "/placeholder.svg?height=300&width=300",
    brand: "VoltEdge",
    tags: ["gaming", "controller", "wireless"],
  },
  {
    id: "7",
    name: "VoltEdge Portable SSD 1TB",
    category: "Storage",
    price: 149.99,
    originalPrice: 179.99,
    rating: 4.7,
    image: "/placeholder.svg?height=300&width=300",
    isSale: true,
    brand: "VoltEdge",
    tags: ["storage", "ssd", "portable", "deals"],
  },
  {
    id: "8",
    name: "VoltEdge Wireless Earbuds",
    category: "Audio",
    price: 129.99,
    rating: 4.3,
    image: "/placeholder.svg?height=300&width=300",
    isNew: true,
    brand: "VoltEdge",
    tags: ["audio", "wireless", "earbuds"],
  },
  {
    id: "9",
    name: "VoltEdge Gaming Mouse",
    category: "Accessories",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=300",
    isSale: true,
    brand: "VoltEdge",
    tags: ["gaming", "mouse", "rgb", "deals"],
  },
  {
    id: "10",
    name: "VoltEdge Mechanical Keyboard",
    category: "Accessories",
    price: 129.99,
    rating: 4.6,
    image: "/placeholder.svg?height=300&width=300",
    brand: "VoltEdge",
    tags: ["gaming", "keyboard", "mechanical"],
  },
  {
    id: "11",
    name: "VoltEdge Bluetooth Speaker",
    category: "Audio",
    price: 89.99,
    originalPrice: 109.99,
    rating: 4.5,
    image: "/placeholder.svg?height=300&width=300",
    isSale: true,
    brand: "VoltEdge",
    tags: ["audio", "speaker", "bluetooth", "deals"],
  },
  {
    id: "12",
    name: "VoltEdge Ultrawide Monitor",
    category: "Monitors",
    price: 499.99,
    rating: 4.7,
    image: "/placeholder.svg?height=300&width=300",
    isNew: true,
    brand: "VoltEdge",
    tags: ["monitor", "ultrawide", "gaming"],
  },
  {
    id: "13",
    name: "TechPro Gaming Laptop",
    category: "Laptops",
    price: 1199.99,
    rating: 4.5,
    image: "/placeholder.svg?height=300&width=300",
    brand: "TechPro",
    tags: ["laptop", "gaming"],
  },
  {
    id: "14",
    name: "ElectraMax Smartphone Pro",
    category: "Smartphones",
    price: 849.99,
    originalPrice: 949.99,
    rating: 4.6,
    image: "/placeholder.svg?height=300&width=300",
    isSale: true,
    brand: "ElectraMax",
    tags: ["smartphone", "5G", "camera", "deals"],
  },
  {
    id: "15",
    name: "SonicWave Premium Headphones",
    category: "Audio",
    price: 199.99,
    rating: 4.4,
    image: "/placeholder.svg?height=300&width=300",
    brand: "SonicWave",
    tags: ["audio", "wireless", "noise-cancelling"],
  },
  {
    id: "16",
    name: "GigaByte Fitness Tracker",
    category: "Wearables",
    price: 129.99,
    rating: 4.2,
    image: "/placeholder.svg?height=300&width=300",
    brand: "GigaByte",
    tags: ["wearable", "fitness"],
  },
]

// Define available categories and brands
const categories = [
  "All Categories",
  "Laptops",
  "Smartphones",
  "Audio",
  "Wearables",
  "TVs",
  "Gaming",
  "Accessories",
  "Storage",
  "Monitors",
]

// Will be dynamic once we have real data
const brands = ["VoltEdge", "TechPro", "ElectraMax", "GigaByte", "SonicWave"]

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating: High to Low", value: "rating_desc" },
  { label: "Newest First", value: "newest" },
]

/**
 * Search page component.
 * Provides product search functionality with filters and sorting.
 */
export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const query = searchParams.get("q") || ""
  const categoryParam = searchParams.get("category") || "All Categories"
  const tagParam = searchParams.get("tag") || ""
  const minPriceParam = searchParams.get("minPrice")
  const maxPriceParam = searchParams.get("maxPrice")
  const sortByParam = searchParams.get("sort") || "relevance"
  const brandsParam = searchParams.get("brands")

  // Set up initial filters from URL params
  const initialFilters: Filters = {
    searchTerm: query,
    category: categoryParam,
    brands: brandsParam ? brandsParam.split(",") : [],
    minPrice: minPriceParam ? Number(minPriceParam) : 0,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : 2000,
    sortBy: sortByParam,
    tag: tagParam,
  }

  // Use our product search hook
  const { 
    products: filteredProducts, 
    loading, 
    error, 
    filters, 
    updateFilters, 
    clearFilters 
  } = useProductSearch(initialFilters)

  const [searchTerm, setSearchTerm] = useState(query)
  const [showFilters, setShowFilters] = useState(false)
  
  // Update URL when filters change
  const updateUrlWithFilters = (newFilters: Filters) => {
    // Build URL parameters
    const params = new URLSearchParams()

    if (newFilters.searchTerm) {
      params.set("q", newFilters.searchTerm)
    }

    if (newFilters.category && newFilters.category !== "All Categories") {
      params.set("category", newFilters.category)
    }

    if (newFilters.sortBy && newFilters.sortBy !== "relevance") {
      params.set("sort", newFilters.sortBy)
    }

    if (newFilters.minPrice && newFilters.minPrice > 0) {
      params.set("minPrice", newFilters.minPrice.toString())
    }

    if (newFilters.maxPrice && newFilters.maxPrice < 2000) {
      params.set("maxPrice", newFilters.maxPrice.toString())
    }

    if (newFilters.brands && newFilters.brands.length > 0) {
      params.set("brands", newFilters.brands.join(","))
    }

    if (tagParam) {
      params.set("tag", tagParam)
    }

    router.push(`/search?${params.toString()}`)
  }

  // Handle filter updates
  const handleUpdateFilters = (newFilters: {
    searchTerm?: string
    selectedCategory?: string
    selectedBrands?: string[]
    priceRange?: [number, number]
    sortBy?: string
  }) => {
    const updatedFilters: Filters = { ...filters }

    if (newFilters.searchTerm !== undefined) {
      updatedFilters.searchTerm = newFilters.searchTerm
    }

    if (newFilters.selectedCategory !== undefined) {
      updatedFilters.category = newFilters.selectedCategory
    }

    if (newFilters.selectedBrands !== undefined) {
      updatedFilters.brands = newFilters.selectedBrands
    }

    if (newFilters.priceRange !== undefined) {
      updatedFilters.minPrice = newFilters.priceRange[0]
      updatedFilters.maxPrice = newFilters.priceRange[1]
    }

    if (newFilters.sortBy !== undefined) {
      updatedFilters.sortBy = newFilters.sortBy
    }

    updateFilters(updatedFilters)
    updateUrlWithFilters(updatedFilters)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handleUpdateFilters({ searchTerm })
  }

  const handleClearFilters = () => {
    clearFilters()
    // Keep the search term but clear all other filters
    const params = new URLSearchParams()
    if (searchTerm) params.set("q", searchTerm)
    if (tagParam) params.set("tag", tagParam)
    router.push(`/search?${params.toString()}`)
  }

  // Page title based on search parameters
  const getPageTitle = () => {
    if (tagParam === "deals") return "Special Deals"
    if (filters.category !== "All Categories") return filters.category
    if (filters.searchTerm) return `Search Results for "${filters.searchTerm}"`
    return "Search Results"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
        <form onSubmit={handleSearch} className="flex w-full max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters - Desktop */}
        <div className="hidden lg:block w-64">
          <SearchFilters
            searchTerm={filters.searchTerm || ""}
            selectedCategory={filters.category || "All Categories"}
            selectedBrands={filters.brands || []}
            priceRange={[filters.minPrice || 0, filters.maxPrice || 2000]}
            sortBy={filters.sortBy || "relevance"}
            categories={categories}
            brands={brands}
            onUpdateFilters={handleUpdateFilters}
            clearFilters={handleClearFilters}
          />
        </div>

        {/* Filters - Mobile */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" className="mb-4">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <div className="py-6 pr-6">
              <SearchFilters
                searchTerm={filters.searchTerm || ""}
                selectedCategory={filters.category || "All Categories"}
                selectedBrands={filters.brands || []}
                priceRange={[filters.minPrice || 0, filters.maxPrice || 2000]}
                sortBy={filters.sortBy || "relevance"}
                categories={categories}
                brands={brands}
                onUpdateFilters={handleUpdateFilters}
                clearFilters={() => {
                  handleClearFilters()
                  setShowFilters(false)
                }}
              />
              <div className="mt-6">
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowFilters(false)
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              {loading ? "Searching..." : `${filteredProducts.length} ${filteredProducts.length === 1 ? "result" : "results"}`}
              {filters.searchTerm && <> for "{filters.searchTerm}"</>}
              {filters.category !== "All Categories" && <> in {filters.category}</>}
              {tagParam === "deals" && <> on sale</>}
            </p>
            <div className="flex items-center gap-2">
              {(filters.category !== "All Categories" ||
                (filters.brands && filters.brands.length > 0) ||
                (filters.minPrice && filters.minPrice > 0) ||
                (filters.maxPrice && filters.maxPrice < 2000)) && (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="hidden lg:flex">
                  <X className="mr-1 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
              <div className="hidden lg:block">
                <select
                  id="desktop-sort-by"
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={filters.sortBy || "relevance"}
                  onChange={(e) => handleUpdateFilters({ sortBy: e.target.value })}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <SectionLoading message="Searching products..." />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6 mb-4">
                <X className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Error loading products</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                We encountered an error while searching for products. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                We couldn't find any products matching your search and filters. Try adjusting your search terms or
                filters.
              </p>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
