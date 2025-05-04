"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { MapPin, Plus, Edit, Trash2, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  
  // Get API URL with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAddresses(response.data);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddresses();
  }, [token]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Open dialog for adding new address
  const handleAddNewAddress = () => {
    setFormData({
      fullName: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
    });
    setEditingAddress(null);
    setOpenAddressDialog(true);
  };
  
  // Open dialog for editing address
  const handleEditAddress = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
    });
    setEditingAddress(address);
    setOpenAddressDialog(true);
  };
  
  // Save address (create or update)
  const handleSaveAddress = async () => {
    if (!token) {
      toast.error('You must be logged in');
      return;
    }
    
    try {
      if (editingAddress) {
        // Update existing address
        const response = await axios.put(
          `${API_URL}/addresses/${editingAddress.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setAddresses(prev => 
          prev.map(addr => addr.id === editingAddress.id ? response.data : addr)
        );
        
        toast.success('Address updated successfully');
      } else {
        // Create new address
        const response = await axios.post(
          `${API_URL}/addresses`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setAddresses(prev => [...prev, response.data]);
        
        toast.success('Address added successfully');
      }
      
      setOpenAddressDialog(false);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    }
  };
  
  // Delete address
  const handleDeleteAddress = async (id: string) => {
    if (!token) {
      toast.error('You must be logged in');
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      
      toast.success('Address deleted successfully');
    } catch (error: any) {
      console.error('Error deleting address:', error);
      if (error.response?.status === 400) {
        toast.error('This address is used in orders and cannot be deleted');
      } else {
        toast.error('Failed to delete address');
      }
    }
  };
  
  if (!user) {
    return (
      <div className="container py-10 text-center">
        <p>Please log in to view your profile</p>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl py-10">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={user.name} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Addresses</h2>
            <Button onClick={handleAddNewAddress} className="bg-gradient-to-r from-blue-600 to-fuchsia-600">
              <Plus className="h-4 w-4 mr-2" /> Add New Address
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : addresses.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't added any addresses yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleAddNewAddress}
                >
                  Add Your First Address
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map(address => (
                <Card key={address.id}>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <h3 className="font-medium">{address.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{address.phone}</p>
                    </div>
                    <div className="text-sm mb-4">
                      <p>{address.line1}</p>
                      {address.line2 && <p>{address.line2}</p>}
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>{address.country}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 border-t pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAddress(address)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Address</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this address? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAddress(address.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Address Form Dialog */}
      <Dialog open={openAddressDialog} onOpenChange={setOpenAddressDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            <DialogDescription>
              Fill in the address details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="line1">Address Line 1</Label>
              <Input
                id="line1"
                name="line1"
                value={formData.line1}
                onChange={handleInputChange}
                placeholder="123 Main St"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="line2">Address Line 2 (Optional)</Label>
              <Input
                id="line2"
                name="line2"
                value={formData.line2}
                onChange={handleInputChange}
                placeholder="Apt 4B"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="United States"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenAddressDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveAddress}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 