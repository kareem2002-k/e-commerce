import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useUser = () => {
  const { user, token, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!user && !!token);
  }, [user, token]);

  return {
    user,
    token,
    isLoading: loading,
    isAuthenticated
  };
}; 