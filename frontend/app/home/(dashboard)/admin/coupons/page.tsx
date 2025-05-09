"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Tag, Users } from 'lucide-react';
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


interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
  orders?: any[];
}

export default function AdminCouponsPage() {
  const { user, token  } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCouponDialog, setOpenCouponDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [selectedCouponDetails, setSelectedCouponDetails] = useState<Coupon | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    validFrom: '',
    validUntil: '',
    usageLimit: ''
  });
  
  // Get API URL with fallback
  const API_URL = getUrl();
  
  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!token || !user?.isAdmin) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/coupons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCoupons(response.data);
      } catch (error) {
        console.error('Error fetching coupons:', error);
        toast.error('Failed to load coupons');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoupons();
  }, [token, user?.isAdmin]);
  
  // Fetch coupon details
  const fetchCouponDetails = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedCouponDetails(response.data);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching coupon details:', error);
      toast.error('Failed to load coupon details');
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Open dialog for adding new coupon
  const handleAddNewCoupon = () => {
    // Set default dates (today and 30 days from now)
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      validFrom: today.toISOString().split('T')[0],
      validUntil: nextMonth.toISOString().split('T')[0],
      usageLimit: ''
    });
    setEditingCoupon(null);
    setOpenCouponDialog(true);
  };
  
  // Open dialog for editing coupon
  const handleEditCoupon = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit?.toString() || ''
    });
    setEditingCoupon(coupon);
    setOpenCouponDialog(true);
  };
  
  // Save coupon (create or update)
  const handleSaveCoupon = async () => {
    if (!token || !user?.isAdmin) {
      toast.error('You must be an admin');
      return;
    }
    
    // Validate form
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    
    if (!formData.discountValue.trim() || isNaN(Number(formData.discountValue))) {
      toast.error('Discount value must be a number');
      return;
    }
    
    try {
      if (editingCoupon) {
        // Update existing coupon
        const response = await axios.put(
          `${API_URL}/coupons/${editingCoupon.id}`,
          {
            ...formData,
            discountValue: parseFloat(formData.discountValue),
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setCoupons(prev => 
          prev.map(coupon => coupon.id === editingCoupon.id ? response.data : coupon)
        );
        
        toast.success('Coupon updated successfully');
      } else {
        // Create new coupon
        const response = await axios.post(
          `${API_URL}/coupons`,
          {
            ...formData,
            discountValue: parseFloat(formData.discountValue),
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setCoupons(prev => [...prev, response.data]);
        
        toast.success('Coupon added successfully');
      }
      
      setOpenCouponDialog(false);
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        toast.error('Coupon code already exists');
      } else {
        toast.error('Failed to save coupon');
      }
    }
  };
  
  // Delete coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!token || !user?.isAdmin) {
      toast.error('You must be an admin');
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCoupons(prev => prev.filter(coupon => coupon.id !== id));
      
      toast.success('Coupon deleted successfully');
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      
      if (error.response?.status === 400) {
        toast.error('This coupon has been used in orders and cannot be deleted');
      } else {
        toast.error('Failed to delete coupon');
      }
    }
  };
  
  // Check if a coupon is active
  const isCouponActive = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    if (now < validFrom || now > validUntil) {
      return false;
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return false;
    }
    
    return true;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
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
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <Button 
          onClick={handleAddNewCoupon}
          className="bg-gradient-to-r from-blue-600 to-fuchsia-600"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Coupon
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-purple-600" />
            All Coupons
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-10">
              <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No coupons found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleAddNewCoupon}
              >
                Create Your First Coupon
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map(coupon => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">{coupon.code}</TableCell>
                      <TableCell>{coupon.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}</TableCell>
                      <TableCell>
                        {coupon.discountType === 'PERCENTAGE' 
                          ? `${coupon.discountValue}%` 
                          : formatCurrency(coupon.discountValue)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>From: {formatDate(coupon.validFrom)}</div>
                          <div>To: {formatDate(coupon.validUntil)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </TableCell>
                      <TableCell>
                        {isCouponActive(coupon) ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => fetchCouponDetails(coupon.id)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCoupon(coupon)}
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
                                <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this coupon? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id)}>
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
      
      {/* Coupon Form Dialog */}
      <Dialog open={openCouponDialog} onOpenChange={setOpenCouponDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
            <DialogDescription>
              {editingCoupon 
                ? 'Update the coupon details below' 
                : 'Fill in the coupon details below'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="SUMMER2023"
                disabled={!!editingCoupon} // Disable editing code for existing coupons
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Summer sale discount"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select 
                  value={formData.discountType}
                  onValueChange={(value) => handleSelectChange('discountType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {formData.discountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount'}
                </Label>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder={formData.discountType === 'PERCENTAGE' ? "15" : "10.00"}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  name="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  name="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
              <Input
                id="usageLimit"
                name="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={handleInputChange}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">Leave empty for unlimited usage</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenCouponDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveCoupon}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Coupon Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Coupon Usage Details</DialogTitle>
            <DialogDescription>
              {selectedCouponDetails?.code} - Usage History
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedCouponDetails?.orders && selectedCouponDetails.orders.length > 0 ? (
              <div className="overflow-y-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCouponDetails.orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          {order.user.name}
                          <div className="text-xs text-muted-foreground">{order.user.email}</div>
                        </TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">This coupon has not been used yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 