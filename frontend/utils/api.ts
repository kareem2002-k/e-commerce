import { toast } from 'sonner';
import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Standard fetch with error handling
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `HTTP error ${response.status}` };
      }

      return {
        error: errorData.message || errorData.error || `HTTP error ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { error: errorMessage, status: 500 };
  }
}

// GET request
export async function get<T>(endpoint: string, token?: string | null): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetchApi<T>(endpoint, { headers });
}

// POST request
export async function post<T, D = any>(
  endpoint: string,
  data: D,
  token?: string | null
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetchApi<T>(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
}

// PUT request
export async function put<T, D = any>(
  endpoint: string,
  data: D,
  token?: string | null
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetchApi<T>(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
}

// DELETE request
export async function del<T>(endpoint: string, token?: string | null): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetchApi<T>(endpoint, {
    method: 'DELETE',
    headers,
  });
}

// Specific API functions for common operations

// Get all products
export async function getProducts() {
  return get('/api/products');
}

// Get product by ID
export async function getProductById(id: string) {
  return get(`/api/products/${id}`);
}

// Create product
export async function createProduct(data: any, token: string | null) {
  return post('/api/products', data, token);
}

// Update product
export async function updateProduct(id: string, data: any, token: string | null) {
  return put(`/api/products/${id}`, data, token);
}

// Delete product
export async function deleteProduct(id: string, token: string | null) {
  return del(`/api/products/${id}`, token);
}

// Get all categories
export async function getCategories() {
  return get('/api/categories');
}

// Get category by ID
export async function getCategoryById(id: string) {
  return get(`/api/categories/${id}`);
}

// Create category
export async function createCategory(data: any, token: string | null) {
  return post('/api/categories', data, token);
}

// Update category
export async function updateCategory(id: string, data: any, token: string | null) {
  return put(`/api/categories/${id}`, data, token);
}

// Delete category
export async function deleteCategory(id: string, token: string | null) {
  return del(`/api/categories/${id}`, token);
}

// API Functions with toast notifications
export const apiWithToast = {
  get: async <T>(endpoint: string, token?: string | null, options?: { 
    successMessage?: string;
    errorMessage?: string;
  }): Promise<ApiResponse<T>> => {
    const result = await get<T>(endpoint, token);
    
    if (result.error) {
      toast.error(options?.errorMessage || result.error);
    } else if (options?.successMessage) {
      toast.success(options.successMessage);
    }
    
    return result;
  },
  
  post: async <T, D = any>(endpoint: string, data: D, token?: string | null, options?: {
    successMessage?: string;
    errorMessage?: string;
  }): Promise<ApiResponse<T>> => {
    const result = await post<T, D>(endpoint, data, token);
    
    if (result.error) {
      toast.error(options?.errorMessage || result.error);
    } else if (options?.successMessage) {
      toast.success(options.successMessage);
    }
    
    return result;
  },
  
  put: async <T, D = any>(endpoint: string, data: D, token?: string | null, options?: {
    successMessage?: string;
    errorMessage?: string;
  }): Promise<ApiResponse<T>> => {
    const result = await put<T, D>(endpoint, data, token);
    
    if (result.error) {
      toast.error(options?.errorMessage || result.error);
    } else if (options?.successMessage) {
      toast.success(options.successMessage);
    }
    
    return result;
  },
  
  delete: async <T>(endpoint: string, token?: string | null, options?: {
    successMessage?: string;
    errorMessage?: string;
  }): Promise<ApiResponse<T>> => {
    const result = await del<T>(endpoint, token);
    
    if (result.error) {
      toast.error(options?.errorMessage || result.error);
    } else if (options?.successMessage) {
      toast.success(options.successMessage);
    }
    
    return result;
  }
}; 