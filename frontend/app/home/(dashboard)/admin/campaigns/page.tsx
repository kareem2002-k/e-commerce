"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MegaphoneIcon, BarChart3, Image as ImageIcon, Eye, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getUrl } from '@/utils';
import { Campaign } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from '@/components/ImageUploader';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
}

export default function AdminCampaignsPage() {
  const { user, token } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [openCampaignDialog, setOpenCampaignDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignAnalytics, setCampaignAnalytics] = useState<Campaign | null>(null);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    couponId: '',
    isActive: false,
    startDate: '',
    endDate: '',
    position: 'homepage_banner',
    imageUrl: ''
  });
  
  // Get API URL with fallback
  const API_URL = getUrl();
  
  // Fetch campaigns and coupons
  useEffect(() => {
    if (!token || !user?.isAdmin) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch campaigns
        const campaignsResponse = await axios.get(`${API_URL}/campaigns`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch coupons
        const couponsResponse = await axios.get(`${API_URL}/coupons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCampaigns(campaignsResponse.data);
        setCoupons(couponsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, user?.isAdmin]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch toggle
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };
  
  // Open dialog for adding new campaign
  const handleAddNewCampaign = () => {
    // Set default dates (today and 30 days from now)
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    
    setFormData({
      name: '',
      description: '',
      couponId: '',
      isActive: false,
      startDate: today.toISOString().split('T')[0],
      endDate: nextMonth.toISOString().split('T')[0],
      position: 'homepage_banner',
      imageUrl: ''
    });
    setEditingCampaign(null);
    setOpenCampaignDialog(true);
  };
  
  // Open dialog for editing campaign
  const handleEditCampaign = (campaign: Campaign) => {
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      couponId: campaign.couponId,
      isActive: campaign.isActive,
      startDate: new Date(campaign.startDate).toISOString().split('T')[0],
      endDate: new Date(campaign.endDate).toISOString().split('T')[0],
      position: campaign.position || 'homepage_banner',
      imageUrl: campaign.imageUrl || ''
    });
    setEditingCampaign(campaign);
    setOpenCampaignDialog(true);
  };
  
  // View campaign analytics
  const handleViewAnalytics = (campaign: Campaign) => {
    setCampaignAnalytics(campaign);
    setShowAnalyticsDialog(true);
  };
  
  // Handle images uploaded with ImageUploader
  const handleImagesUploaded = (images: { url: string; altText: string }[]) => {
    if (images.length > 0) {
      setFormData(prev => ({ ...prev, imageUrl: images[0].url }));
    }
  };
  
  // Save campaign (create or update)
  const handleSaveCampaign = async () => {
    if (!token || !user?.isAdmin) {
      toast.error('You must be an admin');
      return;
    }
    
    // Validate form
    if (!formData.name.trim()) {
      toast.error('Campaign name is required');
      return;
    }
    
    if (!formData.couponId) {
      toast.error('Please select a coupon');
      return;
    }
    
    try {
      // No need to upload image separately, as it's already uploaded by the ImageUploader
      // The URL is in formData.imageUrl
      
      if (editingCampaign) {
        // Update existing campaign
        const response = await axios.put(
          `${API_URL}/campaigns/${editingCampaign.id}`,
          {
            ...formData,
            imageUrl: formData.imageUrl
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setCampaigns(prev => 
          prev.map(camp => camp.id === editingCampaign.id ? response.data : camp)
        );
        
        toast.success('Campaign updated successfully');
      } else {
        // Create new campaign
        const response = await axios.post(
          `${API_URL}/campaigns`,
          {
            ...formData,
            imageUrl: formData.imageUrl
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setCampaigns(prev => [...prev, response.data]);
        
        toast.success('Campaign added successfully');
      }
      
      setOpenCampaignDialog(false);
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    }
  };
  
  // Delete campaign
  const handleDeleteCampaign = async (id: string) => {
    if (!token || !user?.isAdmin) {
      toast.error('You must be an admin');
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
      
      toast.success('Campaign deleted successfully');
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };
  
  // Toggle campaign active status
  const handleToggleActive = async (campaign: Campaign) => {
    try {
      const response = await axios.put(
        `${API_URL}/campaigns/${campaign.id}`,
        {
          ...campaign,
          isActive: !campaign.isActive,
          startDate: campaign.startDate,
          endDate: campaign.endDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCampaigns(prev => 
        prev.map(camp => camp.id === campaign.id ? response.data : camp)
      );
      
      toast.success(`Campaign ${response.data.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling campaign status:', error);
      toast.error('Failed to update campaign status');
    }
  };
  
  // Check if a campaign is active and valid date range
  const isCampaignActive = (campaign: Campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    return campaign.isActive && now >= startDate && now <= endDate;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate conversion rate
  const calculateConversionRate = (campaign: Campaign) => {
    if (campaign.clickCount === 0) return '0%';
    return `${Math.round((campaign.conversionCount / campaign.clickCount) * 100)}%`;
  };
  
  // Filter campaigns based on active tab
  const filteredCampaigns = campaigns.filter(campaign => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return isCampaignActive(campaign);
    if (activeTab === 'inactive') return !isCampaignActive(campaign);
    return true;
  });
  
  if (!user || !user?.isAdmin) {
    return (
      <div className="container py-10 text-center">
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Campaign Management</h1>
        <Button 
          onClick={handleAddNewCampaign}
          className="bg-gradient-to-r from-blue-600 to-fuchsia-600"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Campaign
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active Campaigns</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Campaigns</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MegaphoneIcon className="h-5 w-5 text-purple-600" />
            Marketing Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-10">
              <MegaphoneIcon className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No campaigns found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleAddNewCampaign}
              >
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Analytics</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map(campaign => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        {campaign.imageUrl ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden">
                            <img 
                              src={campaign.imageUrl} 
                              alt={campaign.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          {campaign.name}
                          {campaign.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {campaign.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.coupon ? (
                          <div>
                            <Badge variant="outline" className="font-mono">
                              {campaign.coupon.code}
                            </Badge>
                            <div className="text-xs mt-1">
                              {campaign.coupon.discountType === 'PERCENTAGE' 
                                ? `${campaign.coupon.discountValue}% off` 
                                : formatCurrency(campaign.coupon.discountValue)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>From: {formatDate(campaign.startDate)}</div>
                          <div>To: {formatDate(campaign.endDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{campaign.clickCount}</span> 
                            <span className="text-muted-foreground text-xs">clicks</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{campaign.conversionCount}</span> 
                            <span className="text-muted-foreground text-xs">conversions</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Rate: {calculateConversionRate(campaign)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Switch
                            checked={campaign.isActive}
                            onCheckedChange={() => handleToggleActive(campaign)}
                            className="mr-2"
                          />
                          {isCampaignActive(campaign) ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewAnalytics(campaign)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCampaign(campaign)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this campaign? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCampaign(campaign.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Campaign Form Dialog */}
      <Dialog open={openCampaignDialog} onOpenChange={setOpenCampaignDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}</DialogTitle>
            <DialogDescription>
              {editingCampaign 
                ? 'Update the campaign details below' 
                : 'Fill in the campaign details below'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Summer Sale Campaign"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Special summer promotion with exclusive discounts"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="couponId">Select Coupon</Label>
              <Select 
                value={formData.couponId}
                onValueChange={(value) => handleSelectChange('couponId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a coupon" />
                </SelectTrigger>
                <SelectContent>
                  {coupons.map(coupon => (
                    <SelectItem key={coupon.id} value={coupon.id}>
                      {coupon.code} - {coupon.discountType === 'PERCENTAGE' 
                        ? `${coupon.discountValue}%` 
                        : formatCurrency(coupon.discountValue)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Campaign Image</Label>
              <ImageUploader
                onImagesUploaded={handleImagesUploaded}
                maxImages={1}
                existingImages={formData.imageUrl ? [{ url: formData.imageUrl, altText: formData.name }] : []}
                label="Upload Campaign Image"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Banner Position</Label>
              <Select 
                value={formData.position}
                onValueChange={(value) => handleSelectChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homepage_banner">Homepage Banner</SelectItem>
                  <SelectItem value="homepage_sidebar">Homepage Sidebar</SelectItem>
                  <SelectItem value="products_top">Products Page Top</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="isActive" 
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isActive">Set as active campaign</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenCampaignDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveCampaign}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Campaign Analytics</DialogTitle>
            <DialogDescription>
              {campaignAnalytics?.name} - Performance Metrics
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignAnalytics?.clickCount || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignAnalytics?.conversionCount || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaignAnalytics ? calculateConversionRate(campaignAnalytics) : '0%'}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Campaign Details</h3>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-muted-foreground">Start Date:</div>
                    <div className="text-sm">{campaignAnalytics ? formatDate(campaignAnalytics.startDate) : ''}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-muted-foreground">End Date:</div>
                    <div className="text-sm">{campaignAnalytics ? formatDate(campaignAnalytics.endDate) : ''}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-muted-foreground">Status:</div>
                    <div className="text-sm">
                      {campaignAnalytics && isCampaignActive(campaignAnalytics) 
                        ? <span className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-1" /> Active</span>
                        : <span className="flex items-center"><XCircle className="h-4 w-4 text-red-500 mr-1" /> Inactive</span>
                      }
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-muted-foreground">Coupon:</div>
                    <div className="text-sm">
                      {campaignAnalytics?.coupon 
                        ? <Badge variant="outline" className="font-mono">{campaignAnalytics.coupon.code}</Badge>
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              {campaignAnalytics?.imageUrl && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Campaign Image</h3>
                  <div className="rounded-md overflow-hidden h-[150px]">
                    <img 
                      src={campaignAnalytics.imageUrl} 
                      alt={campaignAnalytics.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 