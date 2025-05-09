'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Tag, MegaphoneIcon } from 'lucide-react';
import { getUrl } from '@/utils';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface CampaignBannerProps {
  className?: string;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  position?: string;
  coupon: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    description?: string;
  };
}

export function CampaignBanner({ className }: CampaignBannerProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const router = useRouter();
  const API_URL = getUrl();
  
  // Fetch active campaign
  useEffect(() => {
    const fetchActiveCampaign = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/campaigns/active`);
        
        if (response.data) {
          setCampaign(response.data);
        }
      } catch (error) {
        console.error('Error fetching active campaign:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveCampaign();
  }, []);
  
  // Close banner
  const handleClose = () => {
    setShowBanner(false);
  };
  
  // Copy coupon code to clipboard
  const handleCopyCode = () => {
    if (campaign?.coupon?.code) {
      navigator.clipboard.writeText(campaign.coupon.code)
        .then(() => {
          toast.success('Coupon code copied to clipboard!');
        })
        .catch((error) => {
          console.error('Error copying to clipboard:', error);
          toast.error('Failed to copy code');
        });
    }
  };
  
  // Track click
  const handleBannerClick = async () => {
    if (!campaign) return;
    
    try {
      // Track click
      await axios.post(`${API_URL}/campaigns/track/${campaign.id}/click`);
      
      // Redirect to products page
      router.push('/home/products');
    } catch (error) {
      console.error('Error tracking campaign click:', error);
      // Still redirect even if tracking fails
      router.push('/home/products');
    }
  };
  
  // Show nothing if no active campaign or hidden
  if (loading || !campaign || !showBanner) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`mb-8 ${className}`}
      >
        <Card 
          className="relative overflow-hidden cursor-pointer"
          onClick={handleBannerClick}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 hover:bg-white/20 text-white"
            onClick={(e) => {
              e.stopPropagation(); // Prevent banner click
              handleClose();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Campaign content */}
          <div className="flex flex-col md:flex-row h-full">
            {/* Image section */}
            {campaign.imageUrl && (
              <div className="md:w-1/3 h-40 md:h-auto relative overflow-hidden">
                <img
                  src={campaign.imageUrl}
                  alt={campaign.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Content section */}
            <div 
              className={`
                ${campaign.imageUrl ? 'md:w-2/3' : 'w-full'} 
                p-6 
                ${!campaign.imageUrl ? 'bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white' : ''}
              `}
            >
              <div className="flex items-center mb-2">
                <MegaphoneIcon className="h-5 w-5 mr-2 text-white" />
                <Badge 
                  variant={campaign.imageUrl ? 'default' : 'outline'} 
                  className={campaign.imageUrl ? 'bg-blue-600' : 'border-white text-white'}
                >
                  Special Offer
                </Badge>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold mb-2">{campaign.name}</h3>
              
              {campaign.description && (
                <p className="mb-4 text-sm md:text-base opacity-90">{campaign.description}</p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-2">
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/20 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tag className="h-4 w-4" />
                  <code className="font-mono font-bold">{campaign.coupon.code}</code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 hover:bg-white/20 text-white"
                    onClick={handleCopyCode}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="font-semibold">
                  {campaign.coupon.discountType === 'PERCENTAGE' 
                    ? `${campaign.coupon.discountValue}% OFF` 
                    : `${formatCurrency(campaign.coupon.discountValue)} OFF`}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
} 