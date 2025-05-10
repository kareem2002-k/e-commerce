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
  const [formTab, setFormTab] = useState('basics');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    couponId: '',
    isActive: false,
    startDate: '',
    endDate: '',
    position: 'homepage_banner',
    imageUrl: '',
    targetAudience: '',
    goals: '',
    notes: ''
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
      imageUrl: '',
      targetAudience: '',
      goals: '',
      notes: ''
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
      imageUrl: campaign.imageUrl || '',
      targetAudience: campaign.targetAudience || '',
      goals: campaign.goals || '',
      notes: campaign.notes || ''
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
  
  // Calculate estimated revenue (assuming we know the coupon value and avg order)
  const calculateEstimatedRevenue = (campaign: Campaign) => {
    // This is an estimate based on conversions and average order value
    const avgOrderValue = 75; // You would ideally get this from your orders data
    return formatCurrency(campaign.conversionCount * avgOrderValue);
  };
  
  // Calculate ROI - Return on Investment (assuming we know campaign cost)
  const calculateROI = (campaign: Campaign) => {
    // This assumes you're tracking campaign costs somewhere
    const campaignCost = 100; // Placeholder - you would get this from your campaign data
    const revenue = campaign.conversionCount * 75; // Estimated revenue
    
    if (campaignCost <= 0) return 'N/A';
    const roi = ((revenue - campaignCost) / campaignCost) * 100;
    return `${roi.toFixed(1)}%`;
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
      
      {/* Campaign Form Dialog with Tabs */}
      <Dialog open={openCampaignDialog} onOpenChange={setOpenCampaignDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}</DialogTitle>
            <DialogDescription>
              {editingCampaign 
                ? 'Update the campaign details below' 
                : 'Fill in the campaign details below'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basics" value={formTab} onValueChange={setFormTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basics">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media & Display</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basics">
              <div className="grid gap-4 py-2">
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

                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="isActive" 
                    checked={formData.isActive}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="isActive">Set as active campaign</Label>
                </div>
                
                <div className="pt-2">
                  <Button onClick={() => setFormTab('media')} className="w-full">
                    Next: Media & Display
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="media">
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="image">Campaign Image</Label>
                  <ImageUploader
                    onImagesUploaded={handleImagesUploaded}
                    maxImages={1}
                    existingImages={formData.imageUrl ? [{ url: formData.imageUrl, altText: formData.name }] : []}
                    label="Upload Campaign Image"
                  />
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
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" onClick={() => setFormTab('basics')}>
                    Back
                  </Button>
                  <Button onClick={() => setFormTab('advanced')}>
                    Next: Advanced
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced">
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="Describe the target audience for this campaign"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goals">Campaign Goals</Label>
                  <Textarea
                    id="goals"
                    name="goals"
                    value={formData.goals}
                    onChange={handleInputChange}
                    placeholder="What are the objectives of this campaign?"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional campaign notes"
                    rows={2}
                  />
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" onClick={() => setFormTab('media')} className="w-full">
                    Back
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpenCampaignDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveCampaign}>
              Save Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Enhanced Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Analytics</DialogTitle>
            <DialogDescription>
              {campaignAnalytics?.name} - Performance Metrics
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="py-2">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Est. Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {campaignAnalytics ? calculateEstimatedRevenue(campaignAnalytics) : '$0.00'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Campaign Progress */}
                {campaignAnalytics && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-sm">Campaign Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="relative pt-6">
                          {/* Progress bar */}
                          <div className="absolute top-0 left-0 w-full h-2 bg-muted rounded-full">
                            <div 
                              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                              style={{ 
                                width: `${Math.min(100, Math.max(0, 
                                  ((new Date().getTime() - new Date(campaignAnalytics.startDate).getTime()) / 
                                  (new Date(campaignAnalytics.endDate).getTime() - new Date(campaignAnalytics.startDate).getTime())) * 100
                                ))}%` 
                              }}
                            ></div>
                          </div>
                          {/* Timeline dates */}
                          <div className="flex justify-between text-xs mt-3">
                            <div>
                              <div className="font-semibold">Start</div>
                              <div>{formatDate(campaignAnalytics.startDate)}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">Today</div>
                              <div>{formatDate(new Date().toISOString())}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">End</div>
                              <div>{formatDate(campaignAnalytics.endDate)}</div>
                            </div>
                          </div>
                        </div>
                        {/* Campaign stats */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-muted/30 p-3 rounded-md">
                            <div className="text-sm text-muted-foreground mb-1">Duration</div>
                            <div className="font-semibold">
                              {Math.ceil((new Date(campaignAnalytics.endDate).getTime() - new Date(campaignAnalytics.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </div>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-md">
                            <div className="text-sm text-muted-foreground mb-1">Status</div>
                            <div className="font-semibold flex items-center">
                              {isCampaignActive(campaignAnalytics) 
                                ? <><CheckCircle2 className="h-4 w-4 text-green-500 mr-1" /> Active</>
                                : <><XCircle className="h-4 w-4 text-red-500 mr-1" /> Inactive</> 
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Coupon Performance */}
                {campaignAnalytics?.coupon && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Coupon Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="block text-sm text-muted-foreground">Coupon Code</span>
                            <span className="font-mono font-bold">{campaignAnalytics.coupon.code}</span>
                          </div>
                          <Badge>
                            {campaignAnalytics.coupon.discountType === 'PERCENTAGE' 
                              ? `${campaignAnalytics.coupon.discountValue}% OFF` 
                              : `${formatCurrency(campaignAnalytics.coupon.discountValue)} OFF`
                            }
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                          <div>
                            <span className="text-sm text-muted-foreground">Used</span>
                            <div className="font-semibold">
                              {campaignAnalytics.coupon.usedCount} times
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Limit</span>
                            <div className="font-semibold">
                              {campaignAnalytics.coupon.usageLimit 
                                ? `${campaignAnalytics.coupon.usageLimit} max` 
                                : 'Unlimited'
                              }
                            </div>
                          </div>
                        </div>
                        
                        {campaignAnalytics.coupon.usageLimit && (
                          <div className="pt-2">
                            <div className="text-sm text-muted-foreground mb-1">Usage</div>
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-green-500 h-full"
                                style={{ 
                                  width: `${Math.min(100, (campaignAnalytics.coupon.usedCount / campaignAnalytics.coupon.usageLimit) * 100)}%` 
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>{campaignAnalytics.coupon.usedCount} used</span>
                              <span>{campaignAnalytics.coupon.usageLimit - campaignAnalytics.coupon.usedCount} remaining</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="performance">
              <div className="py-2">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Click to Conversion Visualization */}
                      <div>
                        <h3 className="text-sm font-medium mb-3">Click to Conversion Funnel</h3>
                        <div className="relative h-16">
                          {/* Total clicks bar */}
                          <div className="absolute top-0 left-0 h-8 bg-blue-100 dark:bg-blue-950/40 w-full rounded-md"></div>
                          <div className="absolute top-0 left-0 h-8 flex items-center px-3 font-medium">
                            {campaignAnalytics?.clickCount || 0} Clicks
                          </div>
                          
                          {/* Conversion bar (smaller width based on percentage) */}
                          <div className="absolute bottom-0 left-0 h-8 bg-green-100 dark:bg-green-950/40 rounded-md"
                            style={{ 
                              width: campaignAnalytics?.clickCount 
                                ? `${Math.min(100, (campaignAnalytics.conversionCount / campaignAnalytics.clickCount) * 100)}%` 
                                : '0%'
                            }}
                          ></div>
                          <div className="absolute bottom-0 left-0 h-8 flex items-center px-3 font-medium">
                            {campaignAnalytics?.conversionCount || 0} Conversions
                          </div>
                        </div>
                      </div>
                      
                      {/* Key performance indicators */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Clicks to Conversion</span>
                            <span className="font-medium">
                              {campaignAnalytics && campaignAnalytics.conversionCount > 0 
                                ? (campaignAnalytics.clickCount / campaignAnalytics.conversionCount).toFixed(1) 
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Est. Cost per Click</span>
                            <span className="font-medium">$0.50</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Est. Cost per Conversion</span>
                            <span className="font-medium">
                              {campaignAnalytics && campaignAnalytics.conversionCount > 0 
                                ? formatCurrency(100 / campaignAnalytics.conversionCount) 
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Est. ROI</span>
                            <span className="font-medium">
                              {campaignAnalytics ? calculateROI(campaignAnalytics) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Daily average performance */}
                      {campaignAnalytics && (
                        <div>
                          <h3 className="text-sm font-medium mb-3">Daily Average</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-muted/30 p-3 rounded-md text-center">
                              <div className="text-xs text-muted-foreground mb-1">Clicks/Day</div>
                              <div className="font-semibold">
                                {calculateDailyAverage(campaignAnalytics.clickCount, campaignAnalytics.startDate, campaignAnalytics.endDate)}
                              </div>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-md text-center">
                              <div className="text-xs text-muted-foreground mb-1">Conversions/Day</div>
                              <div className="font-semibold">
                                {calculateDailyAverage(campaignAnalytics.conversionCount, campaignAnalytics.startDate, campaignAnalytics.endDate)}
                              </div>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-md text-center">
                              <div className="text-xs text-muted-foreground mb-1">Revenue/Day</div>
                              <div className="font-semibold">
                                {formatCurrency(calculateDailyAverage(Number(campaignAnalytics.conversionCount) * 75, campaignAnalytics.startDate, campaignAnalytics.endDate))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="py-2">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Campaign Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-md space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">Campaign Name:</div>
                        <div className="text-sm font-medium">{campaignAnalytics?.name}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">Description:</div>
                        <div className="text-sm">{campaignAnalytics?.description || 'No description'}</div>
                      </div>
                      
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
                        <div className="text-sm text-muted-foreground">Days Active:</div>
                        <div className="text-sm">
                          {campaignAnalytics && Math.max(0, Math.floor((
                            Math.min(new Date().getTime(), new Date(campaignAnalytics.endDate).getTime()) - 
                            Math.max(new Date(campaignAnalytics.startDate).getTime(), new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
                          ) / (1000 * 60 * 60 * 24)))} days
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">Position:</div>
                        <div className="text-sm capitalize">{campaignAnalytics?.position?.replace('_', ' ') || 'Not specified'}</div>
                      </div>
                      
                      {campaignAnalytics?.targetAudience && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-muted-foreground">Target Audience:</div>
                          <div className="text-sm">{campaignAnalytics.targetAudience}</div>
                        </div>
                      )}
                      
                      {campaignAnalytics?.goals && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-muted-foreground">Goals:</div>
                          <div className="text-sm">{campaignAnalytics.goals}</div>
                        </div>
                      )}
                      
                      {campaignAnalytics?.notes && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-muted-foreground">Notes:</div>
                          <div className="text-sm">{campaignAnalytics.notes}</div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">Created:</div>
                        <div className="text-sm">{campaignAnalytics ? formatDate(campaignAnalytics.createdAt) : ''}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">Coupon:</div>
                        <div className="text-sm">
                          {campaignAnalytics?.coupon 
                            ? (
                              <div>
                                <Badge variant="outline" className="font-mono">{campaignAnalytics.coupon.code}</Badge>
                                <div className="mt-1">
                                  {campaignAnalytics.coupon.discountType === 'PERCENTAGE' 
                                    ? `${campaignAnalytics.coupon.discountValue}% off` 
                                    : formatCurrency(campaignAnalytics.coupon.discountValue)}
                                </div>
                              </div>
                            )
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {campaignAnalytics?.imageUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Campaign Banner</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md overflow-hidden">
                        <img 
                          src={campaignAnalytics.imageUrl} 
                          alt={campaignAnalytics.name} 
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to calculate daily average metrics
const calculateDailyAverage = (total: number, startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  // If campaign hasn't started yet, return 0
  if (start > today) return 0;
  
  // Calculate days elapsed so far (or total days if campaign is over)
  const daysElapsed = Math.max(1, Math.ceil(
    (Math.min(today.getTime(), end.getTime()) - start.getTime()) / (1000 * 60 * 60 * 24)
  ));
  
  return (total / daysElapsed).toFixed(1);
} 