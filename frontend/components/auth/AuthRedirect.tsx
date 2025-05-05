"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '../voltedge/loading-screen';

interface AuthRedirectProps {
  children: React.ReactNode;
}

/**
 * Component that redirects authenticated users away from auth pages (login/register)
 * Used as a wrapper for login and register pages
 */
export const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [redirected, setRedirected] = useState(false);
  const [renderChildren, setRenderChildren] = useState(false);

  useEffect(() => {
    // Only perform this check once when component mounts or when auth state changes
    if (!loading) {
      if (user && !redirected) {
        // User is already authenticated, redirect to home page
        setRedirected(true);
        router.push('/home/products');
      } else if (!user) {
        // User is not authenticated, render the children
        setRenderChildren(true);
      }
    }
  }, [user, loading, router, redirected]);

  // If still loading or already redirected, show loading state
  if (loading || (user && redirected)) {
    return (
    <LoadingScreen />
    );
  }

  // Only render children if we've determined the user is not authenticated
  if (renderChildren) {
    return <>{children}</>;
  }

  // Default loading state
  return (
    <LoadingScreen />
  );
}; 