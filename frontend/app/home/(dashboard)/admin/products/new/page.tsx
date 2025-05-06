"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Save, Trash2, Upload, X, 
  Plus, Image as ImageIcon, AlertCircle, Zap
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
import { Category, ProductImage } from "@/types";
  



export default function AddProductPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
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
    categoryId: ""
  });
  
  const [images, setImages] = useState<ProductImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Admin protection
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error("Unauthorized access", {
        description: "You do not have permission to view this page."
      });
      router.push('/home/products');
    }
  }, [user, router]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!token) {
          console.error('No authentication token available for categories');
          return;
        }

        setLoading(true);
        // Get API URL with fallback
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        const response = await fetch(`${API_URL}/categories`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Categories fetched successfully:', data.length);
        setCategories(data);
      } catch (error: any) {
        console.error('Error fetching categories:', error.message);
        toast.error("Failed to load categories: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.isAdmin && token) {
      fetchCategories();
    }
  }, [user, token]);
  
  // Handle input change
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
  
  // Validate form
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
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
      
      return;
    }
    
    setLoading(true);
    
    try {
      // Check for user authentication
      if (!user?.email || !token) {
        toast.error("Authentication required");
        return;
      }

      // First, upload images if needed
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          if (image.isNew && image.file) {
            // In a real application, you would upload the file to your server or cloud storage
            // For demo purposes, we'll simulate an upload
            // const uploadedUrl = await uploadImage(image.file);
            const uploadedUrl = image.url; // Simulate successful upload
            
            return {
              url: uploadedUrl,
              altText: image.altText
            };
          }
          
          return {
            url: image.url,
            altText: image.altText
          };
        })
      );
      
      // Then create the product with the image URLs
      const productData = {
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        lowStockThreshold: parseInt(product.lowStockThreshold),
        images: uploadedImages
      };
      
      // Get API URL with fallback
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      console.log('Creating product with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Failed to create product: ${response.status}`);
      }
      
      toast.success("Product created successfully");
      router.push('/home/admin/products');
    } catch (error: any) {
      console.error('Error creating product:', error.message);
      toast.error("Failed to create product: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <TopBar />
        
        {/* Lightning effect background */}
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-blue-500/10 via-blue-400/5 to-transparent -z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,123,255,0.2),rgba(255,255,255,0))] -z-10 pointer-events-none" />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/home/admin/products')}
                  className="mr-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </motion.div>
              
              <div className="flex items-center">
                <svg className="h-8 w-8 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 className="text-3xl font-bold">Add New Product</h1>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Product
                  </>
                )}
              </Button>
            </motion.div>
          </div>
          
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
                  </TabsList>
                </Tabs>
                
                {/* Help card */}
                <Card className="mt-6 border-blue-100 dark:border-blue-900/30">
                  <CardContent className="p-4">
                    <div className="flex items-start mb-2">
                      <Zap className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <h3 className="font-medium">Quick Tips</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "basic" && "Provide a clear name and detailed description to help customers find your product."}
                      {activeTab === "inventory" && "Set an appropriate low stock threshold to receive alerts when inventory is running low."}
                      {activeTab === "images" && "High-quality images from multiple angles help increase conversion rates."}
                    </p>
                  </CardContent>
                </Card>
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
                              <SelectTrigger 
                                id="category"
                                className={errors.categoryId ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.length > 0 ? (
                                  categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="loading" disabled>
                                    No categories found
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            {errors.categoryId && (
                              <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
                            )}
                            <div className="mt-2 flex items-center">
                              <span className="text-sm text-muted-foreground mr-2">
                                Can't find the right category?
                              </span>
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-blue-500"
                                onClick={() => router.push('/home/admin/categories/new')}
                              >
                                Add a new category
                              </Button>
                            </div>
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
                              Low Stock Threshold *
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
                              You'll be alerted when stock falls below this number
                            </p>
                          </div>
                          
                          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900">
                            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertTitle className="text-blue-800 dark:text-blue-300">Inventory Management</AlertTitle>
                            <AlertDescription className="text-blue-700 dark:text-blue-400">
                              Set up your inventory tracking to avoid overselling. VoltEdge will automatically update stock levels when orders are placed.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="images" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <Label className={errors.images ? "text-red-500" : ""}>
                              Product Images *
                            </Label>
                            
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Image list */}
                              {images.map((image, index) => (
                                <div 
                                  key={index} 
                                  className="relative border rounded-md overflow-hidden group h-[150px]"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={image.url} 
                                    alt={image.altText}
                                    className="w-full h-full object-cover"
                                  />
                                  
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="p-2">
                                      <Input
                                        value={image.altText}
                                        onChange={(e) => updateImageAltText(index, e.target.value)}
                                        placeholder="Alt text (for accessibility)"
                                        className="mb-2 bg-black/50 text-white border-gray-600"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => removeImage(index)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {index === 0 && (
                                    <Badge className="absolute top-2 left-2 bg-blue-500">
                                      Main Image
                                    </Badge>
                                  )}
                                </div>
                              ))}
                              
                              {/* Upload button */}
                              <div 
                                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md h-[150px] flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                                onClick={() => document.getElementById('image-upload')?.click()}
                              >
                                <div className="text-center p-4">
                                  <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    Click to upload
                                  </p>
                                  <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {errors.images && (
                              <p className="mt-2 text-sm text-red-500">{errors.images}</p>
                            )}
                            
                            <p className="mt-2 text-sm text-muted-foreground">
                              Upload high-quality product images. The first image will be used as the main product image.
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
} 