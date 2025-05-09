import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUrl } from '@/utils';

// Define types for hero section and deals banner
export interface HeroSection {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DealsBanner {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  discount?: string;
  imageUrl?: string;
  backgroundColor?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hook to fetch hero section
export const useHeroSection = () => {
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/content/hero`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch hero section');
        }
        
        const data = await res.json();
        setHeroSection(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching hero section:', err);
        setError('Failed to load hero section');
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSection();
  }, []);

  return { heroSection, loading, error };
};

// Hook to fetch deals banner
export const useDealsBanner = () => {
  const [dealsBanner, setDealsBanner] = useState<DealsBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealsBanner = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/content/deals-banner`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch deals banner');
        }
        
        const data = await res.json();
        setDealsBanner(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching deals banner:', err);
        setError('Failed to load deals banner');
      } finally {
        setLoading(false);
      }
    };

    fetchDealsBanner();
  }, []);

  return { dealsBanner, loading, error };
};

// Admin hooks for content management
export const useAdminContent = () => {
  const { token } = useAuth();
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [dealsBanners, setDealsBanners] = useState<DealsBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all hero sections for admin
  const fetchHeroSections = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/content/admin/hero`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch hero sections');
      }
      
      const data = await res.json();
      setHeroSections(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching hero sections:', err);
      setError('Failed to load hero sections');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all deals banners for admin
  const fetchDealsBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/content/admin/deals-banner`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch deals banners');
      }
      
      const data = await res.json();
      setDealsBanners(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching deals banners:', err);
      setError('Failed to load deals banners');
    } finally {
      setLoading(false);
    }
  };

  // Create or update hero section
  const saveHeroSection = async (heroData: Partial<HeroSection>) => {
    try {
      setLoading(true);
      const method = heroData.id ? 'PUT' : 'POST';
      const url = heroData.id 
        ? `/api/content/admin/hero/${heroData.id}`
        : `/api/content/admin/hero`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(heroData)
      });
      
      if (!res.ok) {
        throw new Error('Failed to save hero section');
      }
      
      const data = await res.json();
      await fetchHeroSections(); // Refresh list
      return data;
    } catch (err) {
      console.error('Error saving hero section:', err);
      setError('Failed to save hero section');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete hero section
  const deleteHeroSection = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/content/admin/hero/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete hero section');
      }
      
      await fetchHeroSections(); // Refresh list
    } catch (err) {
      console.error('Error deleting hero section:', err);
      setError('Failed to delete hero section');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create or update deals banner
  const saveDealsBanner = async (bannerData: Partial<DealsBanner>) => {
    try {
      setLoading(true);
      const method = bannerData.id ? 'PUT' : 'POST';
      const url = bannerData.id 
        ? `/api/content/admin/deals-banner/${bannerData.id}`
        : `/api/content/admin/deals-banner`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bannerData)
      });
      
      if (!res.ok) {
        throw new Error('Failed to save deals banner');
      }
      
      const data = await res.json();
      await fetchDealsBanners(); // Refresh list
      return data;
    } catch (err) {
      console.error('Error saving deals banner:', err);
      setError('Failed to save deals banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete deals banner
  const deleteDealsBanner = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/content/admin/deals-banner/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete deals banner');
      }
      
      await fetchDealsBanners(); // Refresh list
    } catch (err) {
      console.error('Error deleting deals banner:', err);
      setError('Failed to delete deals banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (token) {
      fetchHeroSections();
      fetchDealsBanners();
    }
  }, [token]);

  return {
    heroSections,
    dealsBanners,
    loading,
    error,
    fetchHeroSections,
    fetchDealsBanners,
    saveHeroSection,
    saveDealsBanner,
    deleteHeroSection,
    deleteDealsBanner
  };
}; 