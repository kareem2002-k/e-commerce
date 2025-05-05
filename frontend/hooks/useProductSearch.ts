"use client"

import { useState, useEffect, useCallback } from "react"
import { useLoading } from "@/components/voltedge/loading-provider"
import { Product } from "@/types"

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

  // Fetch products with filters from API
  const fetchProducts = useCallback(async () => {
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
      const response = await fetch(`/api/products/search?${searchParams}`);
      
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
    }
  }, [filters, startLoading, stopLoading]);

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

  // Initial fetch and fetch when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, filters]);

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