"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Save, Trash2, Upload, X, 
  Plus, Image as ImageIcon, AlertCircle, Zap,
  Star, Percent, DollarSign, Tag, Truck, ShieldCheck, RotateCcw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TopBar from "@/components/layout/TopBar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Category, ProductImage, Product } from "@/types";
import { Switch } from "@/components/ui/switch";
import { getUrl } from "@/utils";
import { ImageUploader } from "@/components/ImageUploader";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Form state
  const [product, setProduct] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    stock: "",
    lowStockThreshold: "5",
    categoryId: "",
    featured: false,
    discount: ""
  });
  
  const [images, setImages] = useState<ProductImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  
  // Shipping, warranty and return info
  const [shippingInfo, setShippingInfo] = useState({
    freeShippingThreshold: "50",
  });
  
  const [warrantyInfo, setWarrantyInfo] = useState({
    warrantyPeriod: "2-Year Warranty",
    warrantyDescription: "Extended coverage"
  });
  
  const [returnInfo, setReturnInfo] = useState({
    returnPeriod: "30-Day Returns",
    returnDescription: "Hassle-free returns"
  });
  
  // Admin protection
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error("Unauthorized access", {
        description: "You do not have permission to view this page."
      });
      router.push('/home/products');
    }
  }, [user, router]);

  // Fetch product data
  useEffect(() => {
    if (token && productId) {
      fetchProductData();
      fetchCategories();
    }
  }, [token, productId]);

  const fetchProductData = async () => {
    try {
      setFetchingProduct(true);
      // Get API URL with fallback
      const API_URL = getUrl();
      
      const response = await fetch(`${API_URL}/products/${productId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching product: ${response.status}`);
      }
      
      const data = await response.json() as Product;
      
      console.log("Fetched product data:", data); // Log the fetched data to see what's coming from API
      
      // Populate form with existing product data
      setProduct({
        name: data.name,
        description: data.description,
        sku: data.sku,
        price: data.price.toString(),
        stock: data.stock.toString(),
        lowStockThreshold: data.lowStockThreshold.toString(),
        categoryId: data.categoryId,
        featured: data.featured || false,
        discount: data.discount ? data.discount.toString() : ""
      });
      
      // Set images
      if (data.images) {
        setImages(data.images.map(img => ({
          ...img,
          isNew: false
        })));
      }
      
      // Set features if they exist
      if (data.features && Array.isArray(data.features)) {
        console.log("Setting features:", data.features);
        setFeatures(data.features);
      } else {
        console.log("No features found in product data");
        setFeatures([]); // Initialize with empty array if no features found
      }
      
      // Set shipping info if it exists
      if (data.freeShippingThreshold !== undefined && data.freeShippingThreshold !== null) {
        console.log("Setting freeShippingThreshold:", data.freeShippingThreshold);
        setShippingInfo({
          freeShippingThreshold: data.freeShippingThreshold.toString()
        });
      }
      
      // Set warranty info if it exists
      if (data.warrantyPeriod || data.warrantyDescription) {
        console.log("Setting warranty info:", data.warrantyPeriod, data.warrantyDescription);
        setWarrantyInfo({
          warrantyPeriod: data.warrantyPeriod || "2-Year Warranty",
          warrantyDescription: data.warrantyDescription || "Extended coverage"
        });
      }
      
      // Set return info if it exists
      if (data.returnPeriod || data.returnDescription) {
        console.log("Setting return info:", data.returnPeriod, data.returnDescription);
        setReturnInfo({
          returnPeriod: data.returnPeriod || "30-Day Returns",
          returnDescription: data.returnDescription || "Hassle-free returns"
        });
      }
      
    } catch (error: any) {
      console.error('Error fetching product:', error.message);
      toast.error('Failed to load product: ' + error.message);
      router.push('/home/admin/products');
    } finally {
      setFetchingProduct(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      // Get API URL with fallback
      const API_URL = getUrl();
      
      const response = await fetch(`${API_URL}/categories`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.status}`);
      }
      
      const data = await response.json() as Category[];
      setCategories(data);
      
    } catch (error: any) {
      console.error('Error fetching categories:', error.message);
      toast.error('Failed to load categories: ' + error.message);
    }
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear errors when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setProduct(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    // Clear errors when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setProduct(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    
    setImages(prev => [
      ...prev, 
      { 
        url: imageUrl, 
        altText: file.name.split('.')[0] || 'Product image', 
        file,
        isNew: true 
      }
    ]);
    
    e.target.value = '';
  };
  
  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => {
      const updatedImages = [...prev];
      
      // If URL is an object URL created by us, revoke it to prevent memory leaks
      if (updatedImages[index].isNew) {
        URL.revokeObjectURL(updatedImages[index].url);
      }
      
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };
  
  // Update image alt text
  const updateImageAltText = (index: number, altText: string) => {
    setImages(prev => {
      const updatedImages = [...prev];
      updatedImages[index] = { ...updatedImages[index], altText };
      return updatedImages;
    });
  };
  
  // Handle switch change
  const handleSwitchChange = (name: string, checked: boolean) => {
    setProduct(prev => ({ ...prev, [name]: checked }));
  };
  
  // Add features handling
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Handle shipping, warranty, return info changes
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleWarrantyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWarrantyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleReturnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReturnInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // Validate form - update to include features validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!product.name.trim()) newErrors.name = "Product name is required";
    if (!product.description.trim()) newErrors.description = "Description is required";
    if (!product.sku.trim()) newErrors.sku = "SKU is required";
    
    if (!product.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(product.price)) || Number(product.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }
    
    if (!product.stock) {
      newErrors.stock = "Stock quantity is required";
    } else if (isNaN(Number(product.stock)) || Number(product.stock) < 0) {
      newErrors.stock = "Stock must be a non-negative number";
    }
    
    if (!product.lowStockThreshold) {
      newErrors.lowStockThreshold = "Low stock threshold is required";
    } else if (isNaN(Number(product.lowStockThreshold)) || Number(product.lowStockThreshold) < 0) {
      newErrors.lowStockThreshold = "Low stock threshold must be a non-negative number";
    }
    
    if (!product.categoryId) newErrors.categoryId = "Category is required";
    
    if (images.length === 0) {
      newErrors.images = "At least one image is required";
    }
    
    if (product.discount && (isNaN(Number(product.discount)) || Number(product.discount) < 0 || Number(product.discount) > 100)) {
      newErrors.discount = "Discount must be a percentage between 0 and 100";
    }
    
    // New validation for features
    if (features.length === 0) {
      newErrors.features = "At least one feature is required";
    }
    
    // New validation for shipping threshold
    if (shippingInfo.freeShippingThreshold && (isNaN(Number(shippingInfo.freeShippingThreshold)) || Number(shippingInfo.freeShippingThreshold) < 0)) {
      newErrors.freeShippingThreshold = "Free shipping threshold must be a non-negative number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Update handleSubmit to include new fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // If there are errors in tabs other than the active one, switch to that tab
      if (
        (errors.name || errors.description || errors.sku || errors.categoryId) && 
        activeTab !== "basic"
      ) {
        setActiveTab("basic");
        toast.error("Please check the Basic Info tab for errors");
        return;
      }
      
      if (
        (errors.price || errors.stock || errors.lowStockThreshold) && 
        activeTab !== "inventory"
      ) {
        setActiveTab("inventory");
        toast.error("Please check the Inventory tab for errors");
        return;
      }
      
      if (errors.images && activeTab !== "images") {
        setActiveTab("images");
        toast.error("Please add at least one image");
        return;
      }
      
      if (errors.features && activeTab !== "features") {
        setActiveTab("features");
        toast.error("Please add at least one feature");
        return;
      }
      
      if (
        (errors.discount || errors.freeShippingThreshold) && 
        activeTab !== "marketing"
      ) {
        setActiveTab("marketing");
        toast.error("Please check the Marketing tab for errors");
        return;
      }
      
      return;
    }
    
    setLoading(true);
    
    try {
      if (!user?.isAdmin || !token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      // No need to upload images here - they're already uploaded to Supabase using the ImageUploader
      // Just use the image URLs and alt text directly
      const productImages = images.map(image => ({
        url: image.url,
        altText: image.altText || ""
      }));
      
      // Prepare the product data - now including features and policies
      const productData = {
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        lowStockThreshold: parseInt(product.lowStockThreshold),
        categoryId: product.categoryId,
        featured: product.featured,
        discount: product.discount ? parseFloat(product.discount) : null,
        images: productImages,
        features,
        freeShippingThreshold: parseFloat(shippingInfo.freeShippingThreshold),
        warrantyPeriod: warrantyInfo.warrantyPeriod,
        warrantyDescription: warrantyInfo.warrantyDescription,
        returnPeriod: returnInfo.returnPeriod,
        returnDescription: returnInfo.returnDescription
      };
      
      console.log("Sending product data to server:", productData);
      
      // Get API URL with fallback
      const API_URL = getUrl();
      
      // Update the product
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error(`Error updating product: ${response.status}`);
      }
      
      const updatedProduct = await response.json();
      console.log("Server response:", updatedProduct);
      
      toast.success("Product updated successfully");
      
      // Redirect back to products page
      router.push('/home/admin/products');
      
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error("Failed to update product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/home/admin/products')}
              className="mb-4"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
            
            <div className="flex items-center">
              <svg className="h-8 w-8 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <h1 className="text-3xl font-bold">Edit Product</h1>
                <p className="text-muted-foreground">
                  Update product information
                </p>
              </div>
            </div>
          </div>
          
          {fetchingProduct ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <Tabs 
                    value={activeTab} 
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="flex flex-col h-full bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <TabsTrigger 
                        value="basic" 
                        className={`justify-start ${errors.name || errors.description || errors.sku || errors.categoryId ? 'text-red-500' : ''}`}
                      >
                        Basic Info
                        {(errors.name || errors.description || errors.sku || errors.categoryId) && (
                          <span className="ml-auto">
                            <AlertCircle className="h-4 w-4" />
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="inventory" 
                        className={`justify-start ${errors.price || errors.stock || errors.lowStockThreshold ? 'text-red-500' : ''}`}
                      >
                        Inventory & Pricing
                        {(errors.price || errors.stock || errors.lowStockThreshold) && (
                          <span className="ml-auto">
                            <AlertCircle className="h-4 w-4" />
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="images" 
                        className={`justify-start ${errors.images ? 'text-red-500' : ''}`}
                      >
                        Images
                        {errors.images && (
                          <span className="ml-auto">
                            <AlertCircle className="h-4 w-4" />
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="features" 
                        className={`justify-start ${errors.features ? 'text-red-500' : ''}`}
                      >
                        Features
                        {errors.features && (
                          <span className="ml-auto">
                            <AlertCircle className="h-4 w-4" />
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="marketing" 
                        className={`justify-start ${errors.discount ? 'text-red-500' : ''}`}
                      >
                        Marketing
                        {errors.discount && (
                          <span className="ml-auto">
                            <AlertCircle className="h-4 w-4" />
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  {/* Submit button */}
                  <div className="mt-6 space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Product
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      onClick={() => router.push('/home/admin/products')}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
                
                {/* Main content */}
                <div className="lg:col-span-3">
                  <Card className="bg-white dark:bg-gray-800 shadow-sm">
                    <CardContent className="p-6">
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsContent value="basic" className="space-y-6 mt-0">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
                                Product Name *
                              </Label>
                              <Input
                                id="name"
                                name="name"
                                value={product.name}
                                onChange={handleChange}
                                className={errors.name ? "border-red-500" : ""}
                                placeholder="e.g. VoltEdge Pro Wireless Charger"
                              />
                              {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>
                                Description *
                              </Label>
                              <Textarea
                                id="description"
                                name="description"
                                value={product.description}
                                onChange={handleChange}
                                className={`min-h-32 ${errors.description ? "border-red-500" : ""}`}
                                placeholder="Describe your product in detail..."
                              />
                              {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="sku" className={errors.sku ? "text-red-500" : ""}>
                                SKU (Stock Keeping Unit) *
                              </Label>
                              <Input
                                id="sku"
                                name="sku"
                                value={product.sku}
                                onChange={handleChange}
                                className={errors.sku ? "border-red-500" : ""}
                                placeholder="e.g. VE-WC-001"
                              />
                              {errors.sku && (
                                <p className="mt-1 text-sm text-red-500">{errors.sku}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="category" className={errors.categoryId ? "text-red-500" : ""}>
                                Category *
                              </Label>
                              <Select
                                value={product.categoryId}
                                onValueChange={(value) => handleSelectChange("categoryId", value)}
                              >
                                <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.categoryId && (
                                <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="inventory" className="space-y-6 mt-0">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="price" className={errors.price ? "text-red-500" : ""}>
                                Price ($) *
                              </Label>
                              <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={product.price}
                                onChange={handleChange}
                                className={errors.price ? "border-red-500" : ""}
                                placeholder="e.g. 49.99"
                              />
                              {errors.price && (
                                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="stock" className={errors.stock ? "text-red-500" : ""}>
                                Stock Quantity *
                              </Label>
                              <Input
                                id="stock"
                                name="stock"
                                type="number"
                                min="0"
                                value={product.stock}
                                onChange={handleChange}
                                className={errors.stock ? "border-red-500" : ""}
                                placeholder="e.g. 100"
                              />
                              {errors.stock && (
                                <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="lowStockThreshold" className={errors.lowStockThreshold ? "text-red-500" : ""}>
                                Low Stock Alert Threshold *
                              </Label>
                              <Input
                                id="lowStockThreshold"
                                name="lowStockThreshold"
                                type="number"
                                min="0"
                                value={product.lowStockThreshold}
                                onChange={handleChange}
                                className={errors.lowStockThreshold ? "border-red-500" : ""}
                                placeholder="e.g. 10"
                              />
                              {errors.lowStockThreshold && (
                                <p className="mt-1 text-sm text-red-500">{errors.lowStockThreshold}</p>
                              )}
                              <p className="mt-1 text-sm text-muted-foreground">
                                You'll receive alerts when stock falls below this threshold
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="images" className="mt-0">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="images" className={errors.images ? "text-red-500" : ""}>
                                Product Images *
                              </Label>
                              <p className="text-sm text-muted-foreground mb-4">
                                Add high-quality images of your product. The first image will be used as the cover image.
                              </p>
                              
                              <ImageUploader
                                onImagesUploaded={(uploadedImages) => {
                                  setImages(uploadedImages.map(img => ({
                                    url: img.url,
                                    altText: img.altText,
                                    isNew: false
                                  })));
                                }}
                                maxImages={5}
                                existingImages={images.map(img => ({
                                  url: img.url,
                                  altText: img.altText || ""
                                }))}
                                label=""
                              />
                              
                              {errors.images && (
                                <Alert variant="destructive" className="mt-4">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Error</AlertTitle>
                                  <AlertDescription>
                                    {errors.images}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="features" className="mt-0">
                          <div className="space-y-4">
                            <div>
                              <Label className={errors.features ? "text-red-500" : ""}>
                                Product Features *
                              </Label>
                              <p className="text-sm text-muted-foreground mb-2">
                                Add the key features of your product. These will be displayed prominently on the product page.
                              </p>
                              
                              {features.length > 0 && (
                                <div className="space-y-2 mb-4">
                                  {features.map((feature, index) => (
                                    <div 
                                      key={index} 
                                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                                    >
                                      <div className="flex items-center">
                                        <Zap className="h-4 w-4 text-blue-500 mr-2" />
                                        <span>{feature}</span>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleRemoveFeature(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Input
                                  value={newFeature}
                                  onChange={(e) => setNewFeature(e.target.value)}
                                  placeholder="e.g. Fast charging capability"
                                  className="flex-1"
                                />
                                <Button 
                                  type="button" 
                                  onClick={handleAddFeature}
                                  disabled={!newFeature.trim()}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                              
                              {errors.features && (
                                <p className="mt-2 text-sm text-red-500">{errors.features}</p>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="marketing" className="space-y-6 mt-0">
                          <div className="space-y-4">
                            <div className="border p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base">Featured Product</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Featured products are displayed prominently on the homepage
                                  </p>
                                </div>
                                <Switch
                                  checked={product.featured}
                                  onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                                />
                              </div>
                            </div>
                            
                            <div className="border p-4 rounded-lg">
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="discount" className={errors.discount ? "text-red-500" : ""}>
                                    <div className="flex items-center gap-1">
                                      <Percent className="h-4 w-4" />
                                      <span>Discount Percentage</span>
                                    </div>
                                  </Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Input
                                      id="discount"
                                      name="discount"
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={product.discount}
                                      onChange={handleChange}
                                      className={`${errors.discount ? "border-red-500" : ""}`}
                                      placeholder="e.g. 15"
                                    />
                                    <span className="text-sm font-medium">%</span>
                                  </div>
                                  {errors.discount && (
                                    <p className="mt-1 text-sm text-red-500">{errors.discount}</p>
                                  )}
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Leave empty for no discount
                                  </p>
                                </div>
                                
                                {product.discount && !isNaN(Number(product.discount)) && product.price && !isNaN(Number(product.price)) && (
                                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                    <p className="text-sm font-medium">Price after discount:</p>
                                    <div className="flex items-center mt-1">
                                      <DollarSign className="h-4 w-4 text-green-600" />
                                      <span className="text-lg font-bold text-green-600">
                                        {(parseFloat(product.price) * (1 - (parseFloat(product.discount) / 100))).toFixed(2)}
                                      </span>
                                      <span className="ml-2 text-sm line-through text-gray-500">
                                        ${product.price}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Shipping Policy */}
                            <div className="border p-4 rounded-lg">
                              <h3 className="text-base font-medium mb-3">Shipping Policy</h3>
                              <div className="space-y-3">
                                <div>
                                  <Label 
                                    htmlFor="freeShippingThreshold" 
                                    className={errors.freeShippingThreshold ? "text-red-500" : ""}
                                  >
                                    Free Shipping Threshold ($)
                                  </Label>
                                  <Input
                                    id="freeShippingThreshold"
                                    name="freeShippingThreshold"
                                    type="number"
                                    min="0"
                                    value={shippingInfo.freeShippingThreshold}
                                    onChange={handleShippingChange}
                                    className={errors.freeShippingThreshold ? "border-red-500" : ""}
                                    placeholder="e.g. 50"
                                  />
                                  {errors.freeShippingThreshold && (
                                    <p className="mt-1 text-sm text-red-500">{errors.freeShippingThreshold}</p>
                                  )}
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Set to 0 for free shipping on all orders
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Warranty Policy */}
                            <div className="border p-4 rounded-lg">
                              <h3 className="text-base font-medium mb-3">Warranty Policy</h3>
                              <div className="space-y-3">
                                <div>
                                  <Label htmlFor="warrantyPeriod">
                                    Warranty Period
                                  </Label>
                                  <Input
                                    id="warrantyPeriod"
                                    name="warrantyPeriod"
                                    value={warrantyInfo.warrantyPeriod}
                                    onChange={handleWarrantyChange}
                                    placeholder="e.g. 2-Year Warranty"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="warrantyDescription">
                                    Warranty Description
                                  </Label>
                                  <Input
                                    id="warrantyDescription"
                                    name="warrantyDescription"
                                    value={warrantyInfo.warrantyDescription}
                                    onChange={handleWarrantyChange}
                                    placeholder="e.g. Extended coverage"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Return Policy */}
                            <div className="border p-4 rounded-lg">
                              <h3 className="text-base font-medium mb-3">Return Policy</h3>
                              <div className="space-y-3">
                                <div>
                                  <Label htmlFor="returnPeriod">
                                    Return Period
                                  </Label>
                                  <Input
                                    id="returnPeriod"
                                    name="returnPeriod"
                                    value={returnInfo.returnPeriod}
                                    onChange={handleReturnChange}
                                    placeholder="e.g. 30-Day Returns"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="returnDescription">
                                    Return Description
                                  </Label>
                                  <Input
                                    id="returnDescription"
                                    name="returnDescription"
                                    value={returnInfo.returnDescription}
                                    onChange={handleReturnChange}
                                    placeholder="e.g. Hassle-free returns"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                              <Tag className="h-4 w-4 text-blue-600" />
                              <AlertTitle>Marketing Tips</AlertTitle>
                              <AlertDescription className="text-sm">
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                  <li>Featured products get 3.5x more visibility</li>
                                  <li>Products with 10-20% discounts typically see the best conversion rates</li>
                                  <li>Clear return and warranty policies increase customer trust</li>
                                </ul>
                              </AlertDescription>
                            </Alert>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 