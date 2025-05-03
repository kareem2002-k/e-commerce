"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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

  useEffect(() => {
    if (!loading && user) {
      // User is already authenticated, redirect to home page
      router.push('/home');
    }
  }, [user, loading, router]);

  // If user is authenticated, show loading state while redirecting
  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // User is not authenticated, render children (auth forms)
  return <>{children}</>;
}; 