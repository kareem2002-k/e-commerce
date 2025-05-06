"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useLoading } from "@/components/voltedge/loading-provider"
import { Product } from "@/types"
import { useAuth } from "@/context/AuthContext"
export interface SearchFilters {
  searchTerm?: string
  category?: string
  brands?: string[]
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  tag?: string
}

export function useProductSearch(initialFilters: SearchFilters = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { startLoading, stopLoading } = useLoading()
  const { token } = useAuth()
  
  // Track if a request is already in progress to prevent duplicates
  const requestInProgress = useRef(false)
  // Track last request time for debouncing
  const lastRequestTime = useRef(0)

  // Fetch products with filters from API
  const fetchProducts = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (requestInProgress.current) {
      return
    }
    
    // Debounce requests - prevent too many requests in quick succession
    const now = Date.now()
    if (now - lastRequestTime.current < 500) {
      return
    }
    
    requestInProgress.current = true
    lastRequestTime.current = now
    
    setLoading(true)
    startLoading("Searching products...")

    try {
      // Build search params
      const searchParams = new URLSearchParams();
      
      if (filters.searchTerm) searchParams.append('q', filters.searchTerm);
      if (filters.category && filters.category !== "All Categories") searchParams.append('category', filters.category);
      if (filters.minPrice !== undefined) searchParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) searchParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) searchParams.append('sortBy', filters.sortBy);
      if (filters.brands && filters.brands.length > 0) searchParams.append('brands', filters.brands.join(','));
      
      // Make API request
      const response = await fetch(`/api/products/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Error searching products: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error("Error searching products:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      stopLoading();
      requestInProgress.current = false;
    }
  }, [filters, startLoading, stopLoading, token]);

  // Apply filters to products
  const applyFilters = useCallback(() => {
    if (!products.length) return;

    let results = [...products];

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description?.toLowerCase().includes(searchLower) ||
        product.category.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (filters.category && filters.category !== "All Categories") {
      results = results.filter(product => product.category.name === filters.category);
    }

    // Filter by brands
    if (filters.brands && filters.brands.length > 0) {
      results = results.filter(product => filters.brands?.includes(product.brand || ""));
    }

    // Filter by price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      results = results.filter(product => {
        const price = product.price;
        const minMatch = filters.minPrice === undefined || price >= filters.minPrice;
        const maxMatch = filters.maxPrice === undefined || price <= filters.maxPrice;
        return minMatch && maxMatch;
      });
    }

    // Sort products
    if (filters.sortBy) {
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case "price_asc":
            return a.price - b.price;
          case "price_desc":
            return b.price - a.price;
          case "newest":
            // Assuming newer products have higher IDs or comparing by date if available
            return b.id.localeCompare(a.id);
          case "rating_desc":
            // If rating is available
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(results);
  }, [filters, products]);

  // Use a ref to track if initial fetch has been done
  const initialFetchDone = useRef(false);
  
  // Initial fetch and fetch when filters change
  useEffect(() => {
    // Only fetch if we have a token
    if (!token) return;
    
    // Skip fetch if it's just the component mounting with empty filters
    if (!initialFetchDone.current) {
      const hasAnyFilter = 
        filters.searchTerm || 
        (filters.category && filters.category !== "All Categories") ||
        (filters.brands && filters.brands.length > 0) ||
        filters.minPrice || 
        filters.maxPrice || 
        filters.sortBy || 
        filters.tag;
      
      if (!hasAnyFilter) {
        setLoading(false);
        initialFetchDone.current = true;
        return;
      }
    }
    
    initialFetchDone.current = true;
    fetchProducts();
  }, [fetchProducts, filters, token]);

  // Apply filters when products or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters, filters, products]);

  // Update filters
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: filters.searchTerm, // Keep the search term
    });
  }, [filters.searchTerm]);

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchProducts
  };
} 