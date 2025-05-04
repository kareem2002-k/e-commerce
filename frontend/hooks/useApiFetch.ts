import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isSuccess: boolean;
};

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
};

const defaultOptions: FetchOptions = {
  method: 'GET',
  showSuccessToast: false,
  showErrorToast: true,
};

export function useApiFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): [FetchState<T>, (newUrl?: string, newOptions?: FetchOptions) => Promise<T | null>] {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
  });

  const fetchData = useCallback(
    async (newUrl?: string, newOptions?: FetchOptions): Promise<T | null> => {
      const fetchUrl = newUrl || url;
      const fetchOptions = { ...defaultOptions, ...options, ...newOptions };
      const { 
        method, 
        body, 
        headers = {}, 
        showSuccessToast, 
        successMessage,
        showErrorToast,
        errorMessage 
      } = fetchOptions;

      // Set loading state
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        };

        if (body && method !== 'GET') {
          requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(fetchUrl, requestOptions);
        
        // Handle non-success responses
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: `HTTP error ${response.status}` };
          }
          
          const error = new Error(
            errorData.message || errorData.error || `HTTP error ${response.status}`
          );
          
          if (showErrorToast) {
            toast.error(errorMessage || error.message);
          }
          
          setState(prev => ({
            ...prev,
            loading: false,
            error,
            isSuccess: false,
          }));
          
          return null;
        }

        // Handle success responses
        const data = await response.json();
        
        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }
        
        setState({
          data,
          loading: false,
          error: null,
          isSuccess: true,
        });
        
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An unknown error occurred';
          
        if (showErrorToast) {
          toast.error(fetchOptions.errorMessage || errorMessage);
        }
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error(errorMessage),
          isSuccess: false,
        }));
        
        return null;
      }
    },
    [url, options]
  );

  // Auto-fetch on mount if it's a GET request
  useEffect(() => {
    if (options.method === 'GET' || !options.method) {
      fetchData();
    }
  }, []);

  return [state, fetchData];
}

// Helper hooks for common operations
export function useGet<T = any>(url: string, options: Omit<FetchOptions, 'method'> = {}) {
  return useApiFetch<T>(url, { ...options, method: 'GET' });
}

export function usePost<T = any>(url: string, options: Omit<FetchOptions, 'method'> = {}) {
  return useApiFetch<T>(url, { ...options, method: 'POST' });
}

export function usePut<T = any>(url: string, options: Omit<FetchOptions, 'method'> = {}) {
  return useApiFetch<T>(url, { ...options, method: 'PUT' });
}

export function useDelete<T = any>(url: string, options: Omit<FetchOptions, 'method'> = {}) {
  return useApiFetch<T>(url, { ...options, method: 'DELETE' });
} 