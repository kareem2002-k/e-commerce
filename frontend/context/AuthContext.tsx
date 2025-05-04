"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '@/types';

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure isAdmin is a boolean
        setUser({
          ...parsedUser,
          isAdmin: !!parsedUser.isAdmin
        });
        
        // Configure axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      // Save to state
      setToken(token);
      setUser(user);
      
      // Save to localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Configure axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      const { token, user } = response.data;
      
      // Save to state
      setToken(token);
      setUser(user);
      
      // Save to localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Configure axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 