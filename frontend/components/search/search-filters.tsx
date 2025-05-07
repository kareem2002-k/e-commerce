"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

interface SearchFiltersProps {
  searchTerm: string
  selectedCategory: string
  priceRange: [number, number]
  sortBy: string
  categories: string[]
  onUpdateFilters: (filters: {
    searchTerm?: string
    selectedCategory?: string
    priceRange?: [number, number]
    sortBy?: string
  }) => void
  clearFilters: () => void
}

/**
 * Reusable search filters component.
 * Provides UI for filtering products by category, price, and sort order.
 *
 * @param props - Component properties including current filter values and update handlers
 */
export function SearchFilters({
  searchTerm,
  selectedCategory,
  priceRange,
  sortBy,
  categories,
  onUpdateFilters,
  clearFilters,
}: SearchFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange)

  // Update local price range when props change
  useEffect(() => {
    setLocalPriceRange(priceRange)
  }, [priceRange])

  const handlePriceChange = (value: [number, number]) => {
    setLocalPriceRange(value)
    // Debounce price range updates
    const timeoutId = setTimeout(() => onUpdateFilters({ priceRange: value }), 500)
    return () => clearTimeout(timeoutId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center">
              <RadioGroup
                value={selectedCategory}
                onValueChange={(value) => onUpdateFilters({ selectedCategory: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={category} id={`category-${category}`} />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider
            defaultValue={[0, 2000]}
            max={2000}
            step={10}
            value={localPriceRange}
            onValueChange={(value) => handlePriceChange(value as [number, number])}
          />
          <div className="flex items-center justify-between">
            <span>${localPriceRange[0]}</span>
            <span>${localPriceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sort By */}
      <div>
        <h3 className="font-medium mb-3">Sort By</h3>
        <RadioGroup value={sortBy} onValueChange={(value) => onUpdateFilters({ sortBy: value })}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="relevance" id="sort-relevance" />
              <Label htmlFor="sort-relevance">Relevance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price_asc" id="sort-price_asc" />
              <Label htmlFor="sort-price_asc">Price: Low to High</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price_desc" id="sort-price_desc" />
              <Label htmlFor="sort-price_desc">Price: High to Low</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rating_desc" id="sort-rating_desc" />
              <Label htmlFor="sort-rating_desc">Rating: High to Low</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="sort-newest" />
              <Label htmlFor="sort-newest">Newest First</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
