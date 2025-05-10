"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Product } from "@/types"
import { useAuth } from "@/context/AuthContext"

export interface SearchFilters {
  searchTerm?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  tag?: string
}

export function useProductSearch(initialFilters: SearchFilters = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [loading, setLoading] = useState(false) // Start with not loading
  const [error, setError] = useState<Error | null>(null)
  const { token } = useAuth()
  
  // Track if a request is already in progress
  const requestInProgress = useRef<boolean>(false)
  // Track debounce timeout
  const debounceTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  // Track current request for cancellation
  const currentRequest = useRef<AbortController | null>(null)
  // Track last search params to prevent duplicate requests
  const lastSearchParams = useRef<string>("")

  // Fetch products with filters from API
  const fetchProducts = useCallback(async () => {
    // Cancel any existing request
    if (currentRequest.current) {
      currentRequest.current.abort()
    }

    // Create new AbortController for this request
    currentRequest.current = new AbortController()

    // Prevent multiple simultaneous requests
    if (requestInProgress.current) {
      return
    }
    
    // Build search params
    const searchParams = new URLSearchParams();
    
    if (filters.searchTerm) searchParams.append('searchTerm', filters.searchTerm);
    if (filters.category && filters.category !== "All Categories") searchParams.append('category', filters.category);
    if (filters.minPrice !== undefined) searchParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) searchParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.sortBy) searchParams.append('sortBy', filters.sortBy);
    
    const searchParamsString = searchParams.toString()
    
    // Skip if this is the same search as last time
    if (searchParamsString === lastSearchParams.current) {
      return
    }
    
    lastSearchParams.current = searchParamsString
    
    requestInProgress.current = true
    setLoading(true)

    try {
      // Make API request with abort signal
      const response = await fetch(`/api/products/search?${searchParamsString}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: currentRequest.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`Error searching products: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Search response is not an array:', data);
        setProducts([]);
      }
      setError(null);
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error("Error searching products:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      // Use setTimeout to provide a slight delay before removing the loading state
      // This helps prevent flickering for very fast responses
      setTimeout(() => {
        setLoading(false);
        requestInProgress.current = false;
        currentRequest.current = null;
      }, 300);
    }
  }, [filters, token]);

  // Update filters with debouncing
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Update filters state
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    
    // Don't trigger search immediately - let the useEffect handle it
  }, []);

  // Use a ref to track if initial fetch has been done
  const initialFetchDone = useRef(false);
  
  // Only fetch when filters change, with debounce
  useEffect(() => {
    // Only fetch if we have a token
    if (!token) return;
    
    // Skip fetch if it's just the component mounting with empty filters
    if (!initialFetchDone.current) {
      const hasAnyFilter = 
        filters.searchTerm || 
        (filters.category && filters.category !== "All Categories") ||
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

    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debouncing
    debounceTimeout.current = setTimeout(() => {
      fetchProducts();
    }, 800); // Increased debounce to 800ms for better user experience

    // Cleanup timeout and abort any pending request on unmount or filter change
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (currentRequest.current) {
        currentRequest.current.abort();
      }
    };
  }, [fetchProducts, filters, token]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: filters.searchTerm, // Keep the search term
    });
  }, [filters.searchTerm]);

  return {
    products,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchProducts
  };
} 