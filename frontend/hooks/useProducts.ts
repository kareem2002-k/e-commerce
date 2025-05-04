import { useState, useEffect } from "react";
import { Product } from "@/types";

// Hook to fetch all products
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
}

// Hook to fetch a single product by ID
export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError(new Error('Product not found'));
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      setProduct(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      setLoading(false);
    }
  };

  return { product, loading, error, refetch: (id: string) => fetchProduct(id) };
}

// Hook to fetch product categories
export function useCategories(products?: Product[]) {
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extract categories from products if provided
  useEffect(() => {
    if (products) {
      extractCategories(products);
    } else {
      fetchCategories();
    }
  }, [products]);

  const extractCategories = (productData: Product[]) => {
    try {
      const uniqueCategories = Array.from(
        new Set(productData.map((product: Product) => 
          product.category ? JSON.stringify(product.category) : null
        ))
      )
      .filter(Boolean)
      .map(cat => JSON.parse(cat as string));
      
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (error) {
      console.error('Error extracting categories:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      setLoading(false);
    }
  };

  // If products aren't provided, fetch categories directly
  const fetchCategories = async () => {
    try {
      setLoading(true);
      // First try to fetch from a dedicated categories endpoint if available
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Fall back to extracting from products if categories endpoint fails
      }

      // Fallback: fetch products and extract categories
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products for categories');
      const data = await response.json();
      extractCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: fetchCategories };
}

// Combined hook for both products and categories
export function useProductsAndCategories() {
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories(products);

  return {
    products,
    categories,
    loading: productsLoading || categoriesLoading,
    error: productsError || categoriesError,
    refetch: refetchProducts
  };
} 