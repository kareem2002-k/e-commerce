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

  const [searchTerm, setSearchTerm] = useState(query)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(false)

  // Update URL when filters change
  const updateFilters = (filters: {
    searchTerm?: string
    selectedCategory?: string
    selectedBrands?: string[]
    priceRange?: [number, number]
    sortBy?: string
  }) => {
    // Update local state
    if (filters.searchTerm !== undefined) setSearchTerm(filters.searchTerm)
    if (filters.selectedCategory !== undefined) setSelectedCategory(filters.selectedCategory)
    if (filters.selectedBrands !== undefined) setSelectedBrands(filters.selectedBrands)
    if (filters.priceRange !== undefined) setPriceRange(filters.priceRange)
    if (filters.sortBy !== undefined) setSortBy(filters.sortBy)

    // Build URL parameters
    const params = new URLSearchParams(searchParams.toString())

    if (filters.searchTerm !== undefined) {
      if (filters.searchTerm) params.set("q", filters.searchTerm)
      else params.delete("q")
    }

    if (filters.selectedCategory !== undefined) {
      if (filters.selectedCategory !== "All Categories") params.set("category", filters.selectedCategory)
      else params.delete("category")
    }

    if (filters.sortBy !== undefined) {
      if (filters.sortBy !== "relevance") params.set("sort", filters.sortBy)
      else params.delete("sort")
    }

    if (filters.priceRange !== undefined) {
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) {
        params.set("minPrice", filters.priceRange[0].toString())
        params.set("maxPrice", filters.priceRange[1].toString())
      } else {
        params.delete("minPrice")
        params.delete("maxPrice")
      }
    }

    if (filters.selectedBrands !== undefined) {
      if (filters.selectedBrands.length > 0) {
        params.set("brands", filters.selectedBrands.join(","))
      } else {
        params.delete("brands")
      }
    }

    if (tagParam) params.set("tag", tagParam)

    router.push(`/search?${params.toString()}`)
  }

  // Apply URL parameters on initial load
  useEffect(() => {
    // Only update state if the values are different to avoid unnecessary re-renders
    if (query !== searchTerm) {
      setSearchTerm(query)
    }

    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam)
    }

    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const newPriceRange: [number, number] = [
      minPrice ? Number.parseInt(minPrice) : 0,
      maxPrice ? Number.parseInt(maxPrice) : 2000,
    ]

    if (newPriceRange[0] !== priceRange[0] || newPriceRange[1] !== priceRange[1]) {
      setPriceRange(newPriceRange)
    }

    const brandsParam = searchParams.get("brands")
    const newBrands = brandsParam ? brandsParam.split(",") : []

    if (JSON.stringify(newBrands) !== JSON.stringify(selectedBrands)) {
      setSelectedBrands(newBrands)
    }

    const sortParam = searchParams.get("sort") || "relevance"

    if (sortParam !== sortBy) {
      setSortBy(sortParam)
    }
  }, [searchParams])

  // Filter products based on search and filters
  const filteredProducts = allProducts.filter((product) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))

    // Category filter
    const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory

    // Brand filter
    const matchesBrand = selectedBrands.length === 0 || (product.brand && selectedBrands.includes(product.brand))

    // Price range filter
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

    // Tag filter
    const matchesTag = !tagParam || (product.tags && product.tags.includes(tagParam.toLowerCase()))

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesTag
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.price - b.price
      case "price_desc":
        return b.price - a.price
      case "rating_desc":
        return b.rating - a.rating
      case "newest":
        return a.isNew ? -1 : b.isNew ? 1 : 0
      default:
        // Relevance - prioritize exact matches to search term
        if (searchTerm) {
          const aNameMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase())
          const bNameMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase())
          if (aNameMatch && !bNameMatch) return -1
          if (!aNameMatch && bNameMatch) return 1
        }
        return 0
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ searchTerm })
  }

  const clearFilters = () => {
    setSelectedCategory("All Categories")
    setSelectedBrands([])
    setPriceRange([0, 2000])
    setSortBy("relevance")

    // Keep the search term but clear all other filters
    const params = new URLSearchParams()
    if (searchTerm) params.set("q", searchTerm)
    if (tagParam) params.set("tag", tagParam)
    router.push(`/search?${params.toString()}`)
  }

  // Page title based on search parameters
  const getPageTitle = () => {
    if (tagParam === "deals") return "Special Deals"
    if (selectedCategory !== "All Categories") return selectedCategory
    if (searchTerm) return `Search Results for "${searchTerm}"`
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
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedBrands={selectedBrands}
            priceRange={priceRange}
            sortBy={sortBy}
            categories={categories}
            brands={brands}
            onUpdateFilters={updateFilters}
            clearFilters={clearFilters}
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
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                selectedBrands={selectedBrands}
                priceRange={priceRange}
                sortBy={sortBy}
                categories={categories}
                brands={brands}
                onUpdateFilters={(filters) => {
                  updateFilters(filters)
                  // Don't close the sheet immediately to allow multiple filter changes
                }}
                clearFilters={() => {
                  clearFilters()
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
              {sortedProducts.length} {sortedProducts.length === 1 ? "result" : "results"}
              {searchTerm && <> for "{searchTerm}"</>}
              {selectedCategory !== "All Categories" && <> in {selectedCategory}</>}
              {tagParam === "deals" && <> on sale</>}
            </p>
            <div className="flex items-center gap-2">
              {(selectedCategory !== "All Categories" ||
                selectedBrands.length > 0 ||
                priceRange[0] > 0 ||
                priceRange[1] < 2000) && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="hidden lg:flex">
                  <X className="mr-1 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
              <div className="hidden lg:block">
                <select
                  id="desktop-sort-by"
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
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

          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
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
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
