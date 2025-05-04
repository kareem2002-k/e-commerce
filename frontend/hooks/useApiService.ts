import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useApiFetch, useGet, usePost, useDelete, usePut } from './useApiFetch';
import { 
  Product, 
  Category, 
  ApiResponse, 
  ApiOptions, 
  ApiError,
  PaginationParams,
  FilterOptions 
} from '@/types';

// Cache system for API responses
const apiCache = new Map<string, {
  data: any;
  timestamp: number;
  expiresIn: number;
}>();

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Generic API service hook with enhanced functionality
export function useApiService<T = any, U = any>(
  endpoint: string,
  options: {
    initialFetch?: boolean;
    transformResponse?: (data: any) => T;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    cacheDuration?: number;
    useCache?: boolean;
  } = {}
) {
  const { token } = useAuth();
  const { 
    initialFetch = true, 
    transformResponse, 
    onSuccess, 
    onError, 
    cacheDuration = DEFAULT_CACHE_DURATION,
    useCache = true
  } = options;
  
  // Set up API headers with authorization
  const headers: Record<string, string> = useMemo(() => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);
  
  // Use the base fetch hook
  const [apiState, fetchData] = useApiFetch<T>(endpoint, {
    headers,
    showSuccessToast: false,
    showErrorToast: false
  });

  // Enhanced fetchData with caching
  const fetchWithCache = useCallback(
    async (url?: string, fetchOptions?: ApiOptions): Promise<T | null> => {
      const finalUrl = url || endpoint;
      const cacheKey = `${finalUrl}-${JSON.stringify(fetchOptions || {})}`;
      
      // Check cache if enabled and it's a GET request
      if (useCache && (!fetchOptions || fetchOptions.method === 'GET' || !fetchOptions.method)) {
        const cachedData = apiCache.get(cacheKey);
        
        if (cachedData && (Date.now() - cachedData.timestamp) < cachedData.expiresIn) {
          return transformResponse ? transformResponse(cachedData.data) : cachedData.data;
        }
      }
      
      // Fetch fresh data
      const result = await fetchData(url, fetchOptions);
      
      // Cache the result for GET requests
      if (result && useCache && (!fetchOptions || fetchOptions.method === 'GET' || !fetchOptions.method)) {
        apiCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          expiresIn: cacheDuration
        });
      }
      
      return result;
    },
    [endpoint, fetchData, transformResponse, useCache, cacheDuration]
  );
  
  // Initial fetch on mount if needed
  useEffect(() => {
    if (initialFetch) {
      fetchWithCache();
    }
  }, [initialFetch, fetchWithCache]);
  
  // Cache invalidation
  const invalidateCache = useCallback((specificEndpoint?: string) => {
    const endpointToInvalidate = specificEndpoint || endpoint;
    // Remove all entries that start with the endpoint
    for (const key of apiCache.keys()) {
      if (key.startsWith(endpointToInvalidate)) {
        apiCache.delete(key);
      }
    }
  }, [endpoint]);
  
  // Create data function
  const createData = useCallback(
    async (data: U, successMessage?: string, errorMessage?: string): Promise<ApiResponse<T>> => {
      try {
        const response = await fetchWithCache(undefined, {
          method: 'POST',
          body: data,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });
        
        if (response) {
          if (successMessage) {
            toast.success(successMessage);
          }
          
          if (onSuccess && transformResponse) {
            onSuccess(transformResponse(response));
          } else if (onSuccess) {
            onSuccess(response as T);
          }
          
          // Invalidate cache for this endpoint
          invalidateCache();
          
          return { 
            data: transformResponse ? transformResponse(response) : (response as T), 
            error: null,
            loading: false,
            isSuccess: true
          };
        }
        
        if (errorMessage) {
          toast.error(errorMessage);
        }
        
        if (onError) {
          onError(new Error(errorMessage || 'Failed to create data'));
        }
        
        return { 
          data: null, 
          error: errorMessage || 'Failed to create data',
          loading: false,
          isSuccess: false
        };
      } catch (error) {
        const message = errorMessage || (error instanceof Error ? error.message : 'An error occurred');
        toast.error(message);
        
        if (onError && error instanceof Error) {
          onError(error);
        }
        
        return { 
          data: null, 
          error: message,
          loading: false,
          isSuccess: false
        };
      }
    },
    [fetchWithCache, headers, onSuccess, onError, transformResponse, invalidateCache]
  );
  
  // Update data function
  const updateData = useCallback(
    async (id: string, data: U, successMessage?: string, errorMessage?: string): Promise<ApiResponse<T>> => {
      try {
        const response = await fetchWithCache(`${endpoint}/${id}`, {
          method: 'PUT',
          body: data,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });
        
        if (response) {
          if (successMessage) {
            toast.success(successMessage);
          }
          
          if (onSuccess && transformResponse) {
            onSuccess(transformResponse(response));
          } else if (onSuccess) {
            onSuccess(response as T);
          }
          
          // Invalidate cache for this endpoint and specific item
          invalidateCache();
          invalidateCache(`${endpoint}/${id}`);
          
          return { 
            data: transformResponse ? transformResponse(response) : (response as T), 
            error: null,
            loading: false,
            isSuccess: true
          };
        }
        
        if (errorMessage) {
          toast.error(errorMessage);
        }
        
        if (onError) {
          onError(new Error(errorMessage || 'Failed to update data'));
        }
        
        return { 
          data: null, 
          error: errorMessage || 'Failed to update data',
          loading: false,
          isSuccess: false
        };
      } catch (error) {
        const message = errorMessage || (error instanceof Error ? error.message : 'An error occurred');
        toast.error(message);
        
        if (onError && error instanceof Error) {
          onError(error);
        }
        
        return { 
          data: null, 
          error: message,
          loading: false,
          isSuccess: false
        };
      }
    },
    [endpoint, fetchWithCache, headers, onSuccess, onError, transformResponse, invalidateCache]
  );
  
  // Delete data function
  const deleteData = useCallback(
    async (id: string, successMessage?: string, errorMessage?: string): Promise<ApiResponse<boolean>> => {
      try {
        await fetchWithCache(`${endpoint}/${id}`, {
          method: 'DELETE',
          headers
        });
        
        if (successMessage) {
          toast.success(successMessage);
        }
        
        // Invalidate cache for this endpoint and specific item
        invalidateCache();
        invalidateCache(`${endpoint}/${id}`);
        
        return { 
          data: true, 
          error: null,
          loading: false,
          isSuccess: true
        };
      } catch (error) {
        const message = errorMessage || (error instanceof Error ? error.message : 'An error occurred');
        toast.error(message);
        
        return { 
          data: null, 
          error: message,
          loading: false,
          isSuccess: false
        };
      }
    },
    [endpoint, fetchWithCache, headers, invalidateCache]
  );
  
  // Get data with filters and pagination
  const getFilteredData = useCallback(
    async (filters?: FilterOptions, pagination?: PaginationParams): Promise<ApiResponse<T[]>> => {
      try {
        // Construct query parameters
        const queryParams = new URLSearchParams();
        
        if (filters) {
          if (filters.search) queryParams.append('search', filters.search);
          if (filters.category) queryParams.append('category', filters.category);
          if (filters.inStock !== undefined) queryParams.append('inStock', String(filters.inStock));
          if (filters.minPrice !== undefined) queryParams.append('minPrice', String(filters.minPrice));
          if (filters.maxPrice !== undefined) queryParams.append('maxPrice', String(filters.maxPrice));
          if (filters.rating !== undefined) queryParams.append('rating', String(filters.rating));
          
          if (filters.sort) {
            queryParams.append('sortField', filters.sort.field);
            queryParams.append('sortDirection', filters.sort.direction);
          }
        }
        
        if (pagination) {
          if (pagination.page !== undefined) queryParams.append('page', String(pagination.page));
          if (pagination.limit !== undefined) queryParams.append('limit', String(pagination.limit));
        }
        
        const queryString = queryParams.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        const response = await fetchWithCache(url);
        
        if (response) {
          return {
            data: transformResponse ? transformResponse(response) : response as T[],
            error: null,
            loading: false,
            isSuccess: true
          };
        }
        
        return {
          data: null,
          error: 'Failed to fetch data',
          loading: false,
          isSuccess: false
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        
        return {
          data: null,
          error: message,
          loading: false,
          isSuccess: false
        };
      }
    },
    [endpoint, fetchWithCache, transformResponse]
  );
  
  return {
    ...apiState,
    fetchData: fetchWithCache,
    createData,
    updateData,
    deleteData,
    getFilteredData,
    invalidateCache
  };
}

// Product-specific API hooks
export function useProducts(useCache = true) {
  return useApiService<Product[]>('/api/products', { useCache });
}

export function useProduct(id?: string, useCache = true) {
  return useApiService<Product>(`/api/products${id ? `/${id}` : ''}`, {
    initialFetch: !!id,
    useCache
  });
}

export function useProductAdmin() {
  return useApiService<Product, any>('/api/products', { useCache: false });
}

// Category-specific API hooks
export function useCategories(useCache = true) {
  return useApiService<Category[]>('/api/categories', { useCache });
}

export function useCategory(id?: string, useCache = true) {
  return useApiService<Category>(`/api/categories${id ? `/${id}` : ''}`, {
    initialFetch: !!id,
    useCache
  });
}

export function useCategoryAdmin() {
  return useApiService<Category, any>('/api/categories', { useCache: false });
}

// Data persistence hooks with optimistic updates
export function useProductsState() {
  const [products, setProducts] = useState<Product[]>([]);
  const { data, loading, error, isSuccess, invalidateCache } = useProducts();
  
  useEffect(() => {
    if (isSuccess && data) {
      setProducts(data);
    }
  }, [data, isSuccess]);
  
  // Optimistic update helpers
  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, []);
  
  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  }, []);
  
  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);
  
  // Refresh function
  const refreshProducts = useCallback(() => {
    invalidateCache();
  }, [invalidateCache]);
  
  return {
    products,
    setProducts,
    loading,
    error,
    isSuccess,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts
  };
}

export function useCategoriesState() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { data, loading, error, isSuccess, invalidateCache } = useCategories();
  
  useEffect(() => {
    if (isSuccess && data) {
      setCategories(data);
    }
  }, [data, isSuccess]);
  
  // Optimistic update helpers
  const addCategory = useCallback((category: Category) => {
    setCategories(prev => [...prev, category]);
  }, []);
  
  const updateCategory = useCallback((updatedCategory: Category) => {
    setCategories(prev => 
      prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
    );
  }, []);
  
  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  }, []);
  
  // Refresh function
  const refreshCategories = useCallback(() => {
    invalidateCache();
  }, [invalidateCache]);
  
  return {
    categories,
    setCategories,
    loading,
    error,
    isSuccess,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories
  };
} 