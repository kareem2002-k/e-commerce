"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchFilters } from "@/components/search/search-filters"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal, Search, X } from "lucide-react"
import SectionLoading from "@/components/voltedge/section-loading"
import { useProductSearch, SearchFilters as Filters } from "@/hooks/useProductSearch"
import { useAuth } from "@/context/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"

// Default "All Categories" option
const DEFAULT_CATEGORY = "All Categories"

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating: High to Low", value: "rating_desc" },
  { label: "Newest First", value: "newest" },
]

// Product card skeleton for loading state
const ProductCardSkeleton = () => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  </div>
)

/**
 * Search page component.
 * Provides product search functionality with filters and sorting.
 */
export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { token } = useAuth()

  const query = searchParams.get("q") || ""
  const categoryParam = searchParams.get("category") || DEFAULT_CATEGORY
  const tagParam = searchParams.get("tag") || ""
  const minPriceParam = searchParams.get("minPrice")
  const maxPriceParam = searchParams.get("maxPrice")
  const sortByParam = searchParams.get("sort") || "relevance"

  // Set up initial filters from URL params
  const initialFilters: Filters = {
    searchTerm: query,
    category: categoryParam,
    minPrice: minPriceParam ? Number(minPriceParam) : 0,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : 2000,
    sortBy: sortByParam,
    tag: tagParam,
  }

  // Use our product search hook
  const { 
    products, 
    loading, 
    error, 
    filters, 
    updateFilters, 
    clearFilters 
  } = useProductSearch(initialFilters)

  const [searchTerm, setSearchTerm] = useState(query)
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<string[]>([DEFAULT_CATEGORY])
  const [loadingData, setLoadingData] = useState(true)
  const [filterError, setFilterError] = useState<string | null>(null)
  
  // Preserve previous products while loading new ones to prevent flashing
  const [displayedProducts, setDisplayedProducts] = useState(products)

  // Update displayedProducts whenever products change and loading is complete
  useEffect(() => {
    if (!loading && products) {
      setDisplayedProducts(products)
    }
  }, [products, loading])
  
  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingData(true)
        setFilterError(null)
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }
        
        const categoriesData = await categoriesResponse.json()
        
        if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
          console.warn('No categories returned from API')
          setCategories([DEFAULT_CATEGORY])
        } else {
          const categoryNames = [DEFAULT_CATEGORY, ...categoriesData.map((cat: any) => cat.name)]
          setCategories(categoryNames)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setFilterError('Failed to load categories')
        setCategories([DEFAULT_CATEGORY])
      } finally {
        setLoadingData(false)
      }
    }
    
    // Only fetch if we have a token
    if (token) {
      fetchCategories()
    } else {
      setLoadingData(false)
    }
  }, [token])
  
  // Update URL when filters change - but use debouncing to prevent multiple updates
  const updateUrlWithFilters = useCallback((newFilters: Filters) => {
    // Build URL parameters
    const params = new URLSearchParams()

    if (newFilters.searchTerm) {
      params.set("q", newFilters.searchTerm)
    }

    if (newFilters.category && newFilters.category !== DEFAULT_CATEGORY) {
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

    if (tagParam) {
      params.set("tag", tagParam)
    }

    // Use replaceState to update URL without triggering navigation
    const url = `/home/search?${params.toString()}`
    window.history.replaceState({}, '', url)
  }, [tagParam])

  // Update filters when URL params change
  useEffect(() => {
    updateUrlWithFilters(filters)
  }, [filters, updateUrlWithFilters])

  // Handle filter updates
  const handleUpdateFilters = (newFilters: {
    searchTerm?: string
    selectedCategory?: string
    priceRange?: [number, number]
    sortBy?: string
  }) => {
    const updatedFilters: Filters = { ...filters }

    if (newFilters.searchTerm !== undefined) {
      updatedFilters.searchTerm = newFilters.searchTerm
      setSearchTerm(newFilters.searchTerm) // Update local search term state
    }

    if (newFilters.selectedCategory !== undefined) {
      updatedFilters.category = newFilters.selectedCategory
    }

    if (newFilters.priceRange !== undefined) {
      updatedFilters.minPrice = newFilters.priceRange[0]
      updatedFilters.maxPrice = newFilters.priceRange[1]
    }

    if (newFilters.sortBy !== undefined) {
      updatedFilters.sortBy = newFilters.sortBy
    }

    updateFilters(updatedFilters)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handleUpdateFilters({ searchTerm })
  }

  const handleClearFilters = () => {
    clearFilters()
    // Keep the search term but clear all other filters
    setSearchTerm("")
    const params = new URLSearchParams()
    if (tagParam) params.set("tag", tagParam)
    window.history.replaceState({}, '', `/home/search?${params.toString()}`)
  }

  // Page title based on search parameters
  const getPageTitle = () => {
    if (tagParam === "deals") return "Special Deals"
    if (filters.category !== DEFAULT_CATEGORY) return filters.category
    if (filters.searchTerm) return `Search Results for "${filters.searchTerm}"`
    return "Search Results"
  }



  if (filterError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6 mb-4">
          <X className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Error loading filters</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          {filterError}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // Determine how many skeleton cards to show during loading
  const skeletonCount = products.length > 0 ? products.length : displayedProducts.length || 6

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
            selectedCategory={filters.category || DEFAULT_CATEGORY}
            priceRange={[filters.minPrice || 0, filters.maxPrice || 2000]}
            sortBy={filters.sortBy || "relevance"}
            categories={categories}
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
                selectedCategory={filters.category || DEFAULT_CATEGORY}
                priceRange={[filters.minPrice || 0, filters.maxPrice || 2000]}
                sortBy={filters.sortBy || "relevance"}
                categories={categories}
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
              {loading ? "Searching..." : `${products.length} ${products.length === 1 ? "result" : "results"}`}
              {filters.searchTerm && <> for "{filters.searchTerm}"</>}
              {filters.category !== DEFAULT_CATEGORY && <> in {filters.category}</>}
              {tagParam === "deals" && <> on sale</>}
            </p>
            <div className="flex items-center gap-2">
              {(filters.category !== DEFAULT_CATEGORY ||
                (filters.minPrice && filters.minPrice > 0) ||
                (filters.maxPrice && filters.maxPrice < 2000) ||
                filters.searchTerm) && (
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

          {/* Products grid - maintain same layout for both loading and loaded states */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 min-h-[400px] transition-opacity duration-300"
               style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? (
              // Show skeletons while loading, maintain same count as previous results
              Array(skeletonCount).fill(0).map((_, i) => (
                <ProductCardSkeleton key={`skeleton-${i}`} />
              ))
            ) : error ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6 mb-4">
                  <X className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Error loading products</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  We encountered an error while searching for products. Please try again later.
                </p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : products.length > 0 ? (
              // Show actual products
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              // No products found
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
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
    </div>
  )
}
