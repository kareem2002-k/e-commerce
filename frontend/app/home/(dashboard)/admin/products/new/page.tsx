"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Save, Trash2, Upload, X, 
  Plus, Image as ImageIcon, AlertCircle, Zap,
  Percent, DollarSign, Tag, Truck
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
import { Switch } from "@/components/ui/switch";
import { getUrl } from "@/utils"; 
import { ImageUploader } from "@/components/ImageUploader";



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
  
  // Product dimensions and weight
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
    unit: "cm" // Default unit (cm or inches)
  });
  
  const [weight, setWeight] = useState({
    value: "",
    unit: "kg" // Default unit (kg or lbs)
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
        const API_URL = getUrl();

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
  
  // Handle dimension change
  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear errors when field is updated
    if (errors.dimensions) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.dimensions;
        return newErrors;
      });
    }
    
    setDimensions(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle dimension unit change
  const handleDimensionUnitChange = (value: string) => {
    setDimensions(prev => ({ ...prev, unit: value }));
  };
  
  // Handle weight change
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear errors when field is updated
    if (errors.weight) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.weight;
        return newErrors;
      });
    }
    
    setWeight(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle weight unit change
  const handleWeightUnitChange = (value: string) => {
    setWeight(prev => ({ ...prev, unit: value }));
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
    
    if (product.discount && (isNaN(Number(product.discount)) || Number(product.discount) < 0 || Number(product.discount) > 100)) {
      newErrors.discount = "Discount must be a percentage between 0 and 100";
    }
    
    if (features.length === 0) {
      newErrors.features = "At least one feature is required";
    }
    
    // Validate weight - it's required for proper shipping calculation
    if (!weight.value) {
      newErrors.weight = "Product weight is required for shipping calculation";
    } else if (isNaN(Number(weight.value)) || Number(weight.value) <= 0) {
      newErrors.weight = "Weight must be a positive number";
    }
    
    // Validate dimensions
    if (dimensions.length && dimensions.width && dimensions.height) {
      if (isNaN(Number(dimensions.length)) || Number(dimensions.length) <= 0) {
        newErrors.dimensions = "Length must be a positive number";
      } else if (isNaN(Number(dimensions.width)) || Number(dimensions.width) <= 0) {
        newErrors.dimensions = "Width must be a positive number";
      } else if (isNaN(Number(dimensions.height)) || Number(dimensions.height) <= 0) {
        newErrors.dimensions = "Height must be a positive number";
      }
    }
    
    if (shippingInfo.freeShippingThreshold && (isNaN(Number(shippingInfo.freeShippingThreshold)) || Number(shippingInfo.freeShippingThreshold) < 0)) {
      newErrors.freeShippingThreshold = "Free shipping threshold must be a non-negative number";
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
      
      if (
        (errors.features && activeTab !== "features") ||
        ((errors.weight || errors.dimensions) && activeTab !== "shipping")
      ) {
        setActiveTab(errors.features ? "features" : "shipping");
        toast.error(`Please check the ${errors.features ? "Features" : "Shipping Details"} tab for errors`);
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
      // Check for user authentication
      if (!user?.email || !token) {
        toast.error("Authentication required");
        return;
      }

      // No need to upload images here - they're already uploaded to Supabase using the ImageUploader
      // Just use the image URLs and alt text directly
      const productImages = images.map(image => ({
            url: image.url,
            altText: image.altText
      }));
      
      // Format product data
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
        weight: parseFloat(weight.value),
        weightUnit: weight.unit,
        dimensions: `${dimensions.length} x ${dimensions.width} x ${dimensions.height} ${dimensions.unit}`,
        freeShippingThreshold: parseFloat(shippingInfo.freeShippingThreshold),
        warrantyPeriod: warrantyInfo.warrantyPeriod,
        warrantyDescription: warrantyInfo.warrantyDescription,
        returnPeriod: returnInfo.returnPeriod,
        returnDescription: returnInfo.returnDescription
      };
      
      console.log('Creating product with data:', productData);
      
      // Get API URL with fallback
      const API_URL = getUrl();
      
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
      
      const createdProduct = await response.json();
      console.log('Server response:', createdProduct);
      
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
      <div className="min-h-screen">
        
        {/* Lightning effect background */}
        <div className="absolute top-0 left-0 right-0 h-[300px]  -z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[300px] -z-10 pointer-events-none" />
        
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
                      value="shipping" 
                      className={`justify-start ${errors.weight || errors.dimensions ? 'text-red-500' : ''}`}
                    >
                      Shipping Details
                      {(errors.weight || errors.dimensions) && (
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
                      {activeTab === "features" && "Highlight the most important features of your product to increase customer interest."}
                      {activeTab === "marketing" && "Customize shipping, warranty, and return policies to appeal to your customers."}
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
                                altText: img.altText
                              }))}
                              label=""
                                  />
                            
                            {errors.images && (
                              <p className="mt-2 text-sm text-red-500">{errors.images}</p>
                            )}
                            
                            <p className="mt-2 text-sm text-muted-foreground">
                              Upload high-quality product images. The first image will be used as the main product image.
                            </p>
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
                      
                      <TabsContent value="shipping" className="mt-0">
                        <div className="space-y-6">
                          <div className="border p-4 rounded-lg">
                            <h3 className="text-base font-medium mb-3 flex items-center">
                              <span className="mr-2">Product Weight</span>
                              <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">Required</Badge>
                            </h3>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground mb-2">
                                Accurate weight is crucial for shipping calculations, especially for international shipping to Egypt.
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <Label htmlFor="weight-value" className={errors.weight ? "text-red-500" : ""}>
                                    Weight *
                                  </Label>
                                  <Input
                                    id="weight-value"
                                    name="value"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={weight.value}
                                    onChange={handleWeightChange}
                                    className={errors.weight ? "border-red-500" : ""}
                                    placeholder="e.g. 1.5"
                                  />
                                </div>
                                <div className="w-24">
                                  <Label htmlFor="weight-unit">Unit</Label>
                                  <Select
                                    value={weight.unit}
                                    onValueChange={(value) => handleWeightUnitChange(value)}
                                  >
                                    <SelectTrigger id="weight-unit">
                                      <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="kg">kg</SelectItem>
                                      <SelectItem value="lbs">lbs</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              {errors.weight && (
                                <p className="mt-1 text-sm text-red-500">{errors.weight}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="border p-4 rounded-lg">
                            <h3 className="text-base font-medium mb-3">Product Dimensions</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Accurate dimensions help calculate volumetric weight for international shipping, especially to Egypt.
                            </p>
                            <div className="grid grid-cols-3 gap-4 mb-2">
                              <div>
                                <Label htmlFor="length" className={errors.dimensions ? "text-red-500" : ""}>
                                  Length
                                </Label>
                                <Input
                                  id="length"
                                  name="length"
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={dimensions.length}
                                  onChange={handleDimensionChange}
                                  className={errors.dimensions ? "border-red-500" : ""}
                                  placeholder="L"
                                />
                              </div>
                              <div>
                                <Label htmlFor="width" className={errors.dimensions ? "text-red-500" : ""}>
                                  Width
                                </Label>
                                <Input
                                  id="width"
                                  name="width"
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={dimensions.width}
                                  onChange={handleDimensionChange}
                                  className={errors.dimensions ? "border-red-500" : ""}
                                  placeholder="W"
                                />
                              </div>
                              <div>
                                <Label htmlFor="height" className={errors.dimensions ? "text-red-500" : ""}>
                                  Height
                                </Label>
                                <Input
                                  id="height"
                                  name="height"
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={dimensions.height}
                                  onChange={handleDimensionChange}
                                  className={errors.dimensions ? "border-red-500" : ""}
                                  placeholder="H"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <div className="w-24">
                                <Label htmlFor="dimension-unit">Unit</Label>
                                <Select
                                  value={dimensions.unit}
                                  onValueChange={(value) => handleDimensionUnitChange(value)}
                                >
                                  <SelectTrigger id="dimension-unit">
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cm">cm</SelectItem>
                                    <SelectItem value="in">inches</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            {errors.dimensions && (
                              <p className="mt-2 text-sm text-red-500">{errors.dimensions}</p>
                            )}
                          </div>
                          
                          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <AlertTitle>Shipping Info</AlertTitle>
                            <AlertDescription className="text-sm">
                              <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Accurate weight and dimensions ensure correct shipping costs</li>
                                <li>International shipping to Egypt requires precise measurements</li>
                                <li>Higher shipping costs apply for Egypt (VAT 14%)</li>
                              </ul>
                            </AlertDescription>
                          </Alert>
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
        </main>
      </div>
    </ProtectedRoute>
  );
} 