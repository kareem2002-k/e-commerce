"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

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
  const [isPriceChanging, setIsPriceChanging] = useState(false)
  const [minPriceInput, setMinPriceInput] = useState(priceRange[0].toString())
  const [maxPriceInput, setMaxPriceInput] = useState(priceRange[1].toString())
  
  // Maximum price limit for the slider
  const MAX_PRICE = 10000

  // Update local price range when props change (but only if user isn't currently adjusting it)
  useEffect(() => {
    if (!isPriceChanging) {
      setLocalPriceRange(priceRange)
      setMinPriceInput(priceRange[0].toString())
      setMaxPriceInput(priceRange[1].toString())
    }
  }, [priceRange, isPriceChanging])

  // Debounced price range handler for slider
  const handlePriceChange = useCallback((value: number[]) => {
    const priceValue = value as [number, number]
    setLocalPriceRange(priceValue)
    setMinPriceInput(priceValue[0].toString())
    setMaxPriceInput(priceValue[1].toString())
  }, [])
  
  // Handle price slider start/end
  const handlePriceChangeStart = () => {
    setIsPriceChanging(true)
  }
  
  const handlePriceChangeEnd = () => {
    setIsPriceChanging(false)
    onUpdateFilters({ priceRange: localPriceRange })
  }

  // Handle manual price input changes
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMinPriceInput(value)
    
    // Only update if the value is a valid number
    if (/^\d*$/.test(value)) {
      const numValue = value === '' ? 0 : parseInt(value, 10)
      // Ensure min price doesn't exceed max price
      if (numValue <= localPriceRange[1]) {
        setLocalPriceRange([numValue, localPriceRange[1]])
      }
    }
  }
  
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMaxPriceInput(value)
    
    // Only update if the value is a valid number
    if (/^\d*$/.test(value)) {
      const numValue = value === '' ? 0 : parseInt(value, 10)
      // Ensure max price is at least min price
      if (numValue >= localPriceRange[0]) {
        setLocalPriceRange([localPriceRange[0], numValue])
      }
    }
  }
  
  // Apply custom price range when input fields lose focus or Enter is pressed
  const applyPriceRange = () => {
    const min = parseInt(minPriceInput, 10) || 0
    const max = parseInt(maxPriceInput, 10) || MAX_PRICE
    
    // Create a valid price range (ensuring min ≤ max)
    const validRange: [number, number] = [
      Math.min(min, max),
      Math.max(min, max)
    ]
    
    setLocalPriceRange(validRange)
    setMinPriceInput(validRange[0].toString())
    setMaxPriceInput(validRange[1].toString())
    onUpdateFilters({ priceRange: validRange })
  }
  
  // Handle Enter key on price inputs
  const handlePriceInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      applyPriceRange()
    }
  }
  
  // Memoize category change handler
  const handleCategoryChange = useCallback((value: string) => {
    onUpdateFilters({ selectedCategory: value })
  }, [onUpdateFilters])
  
  // Memoize sort change handler
  const handleSortChange = useCallback((value: string) => {
    onUpdateFilters({ sortBy: value })
  }, [onUpdateFilters])

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
          <RadioGroup
            value={selectedCategory}
            onValueChange={handleCategoryChange}
          >
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={`category-${category}`} />
                <Label htmlFor={`category-${category}`}>{category}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider
            defaultValue={[0, MAX_PRICE]}
            max={MAX_PRICE}
            step={10}
            value={localPriceRange}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceChangeEnd}
            onPointerDown={handlePriceChangeStart}
            className="mb-6"
          />
          
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="min-price" className="text-xs mb-1 block">Min Price</Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="min-price"
                  value={minPriceInput}
                  onChange={handleMinPriceChange}
                  onBlur={applyPriceRange}
                  onKeyDown={handlePriceInputKeyDown}
                  className="pl-6"
                  placeholder="Min"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <span className="text-muted-foreground">to</span>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="max-price" className="text-xs mb-1 block">Max Price</Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="max-price"
                  value={maxPriceInput}
                  onChange={handleMaxPriceChange}
                  onBlur={applyPriceRange}
                  onKeyDown={handlePriceInputKeyDown}
                  className="pl-6"
                  placeholder="Max"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs mb-1 block">&nbsp;</Label>
              <Button 
                size="sm" 
                onClick={applyPriceRange}
                className="h-9"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sort By */}
      <div>
        <h3 className="font-medium mb-3">Sort By</h3>
        <RadioGroup value={sortBy} onValueChange={handleSortChange}>
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
