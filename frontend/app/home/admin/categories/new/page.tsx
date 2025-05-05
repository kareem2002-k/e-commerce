"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Save, FolderPlus, Zap, AlertCircle, Tag } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGet, usePost } from "@/hooks/useApiFetch";
import DataLoader from "@/components/ui/data-loader";
import { Category } from "@/types";



export default function AddCategoryPage() {
  const router = useRouter();
  const { user ,token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [category, setCategory] = useState({
    name: "",
    description: "",
    parentId: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch categories using custom hook
  const [categoriesState, fetchCategories] = useGet<Category[]>('/api/categories', {
    showErrorToast: false
  });
  
  // Create category API endpoint
  const [createState, createCategory] = usePost<Category>('/api/categories', {
    showSuccessToast: true,
    successMessage: "Category created successfully",
    showErrorToast: true,
    errorMessage: "Failed to create category"
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
  
  // Set categories when data is loaded
  useEffect(() => {
    if (categoriesState.isSuccess && categoriesState.data) {
      setCategories(categoriesState.data);
    }
  }, [categoriesState.data, categoriesState.isSuccess]);
  
  // Update loading state
  useEffect(() => {
    setLoading(categoriesState.loading || createState.loading);
  }, [categoriesState.loading, createState.loading]);
  
  // Handle navigation after successful category creation
  useEffect(() => {
    if (createState.isSuccess) {
      router.push('/admin/products');
    }
  }, [createState.isSuccess, router]);
  
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
    
    setCategory(prev => ({ ...prev, [name]: value }));
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
    
    // Convert "none" value to empty string for parentId
    const finalValue = name === "parentId" && value === "none" ? "" : value;
    
    setCategory(prev => ({ ...prev, [name]: finalValue }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!category.name.trim()) newErrors.name = "Category name is required";
    
    // Check for circular references
    if (category.parentId) {
      let currentParent = categories.find(c => c.id === category.parentId);
      const parentIds = new Set<string>([category.parentId]);
      
      while (currentParent?.parentId) {
        if (parentIds.has(currentParent.parentId)) {
          newErrors.parentId = "Circular parent reference detected";
          break;
        }
        parentIds.add(currentParent.parentId);
        currentParent = categories.find(c => c.id === currentParent?.parentId);
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const categoryData = {
      ...category,
      description: category.description.trim() || null,
      parentId: category.parentId || null
    };
    
    // Get the auth token
    if (user?.email) {
      // Use the custom hook to create the category with auth header
      console.log(user.email)
      createCategory(undefined, { 
        body: categoryData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } else {
      toast.error("Authentication required");
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
                  onClick={() => router.push('/admin/products')}
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
                <h1 className="text-3xl font-bold">Add New Category</h1>
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
                    Save Category
                  </>
                )}
              </Button>
            </motion.div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
                      Category Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={category.name}
                      onChange={handleChange}
                      className={errors.name ? "border-red-500" : ""}
                      placeholder="e.g. Wireless Chargers"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="description">
                      Description <span className="text-gray-400">(optional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={category.description}
                      onChange={handleChange}
                      className="min-h-24"
                      placeholder="Describe this category..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="parentId" className={errors.parentId ? "text-red-500" : ""}>
                      Parent Category <span className="text-gray-400">(optional)</span>
                    </Label>
                    <Select 
                      value={category.parentId} 
                      onValueChange={(value) => handleSelectChange("parentId", value)}
                    >
                      <SelectTrigger 
                        id="parentId"
                        className={errors.parentId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="No parent (top-level category)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No parent (top-level category)</SelectItem>
                        <DataLoader
                          isLoading={categoriesState.loading}
                          error={null} // Not showing the error
                          data={categories}
                          isEmpty={(data) => data.length === 0}
                          emptyComponent={
                            <SelectItem value="loading" disabled>
                              No categories found
                            </SelectItem>
                          }
                        >
                          {(data) => (
                            <>
                              {data.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </DataLoader>
                      </SelectContent>
                    </Select>
                    {errors.parentId && (
                      <p className="mt-1 text-sm text-red-500">{errors.parentId}</p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select a parent category to create a hierarchical structure
                    </p>
                  </div>
                  
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900">
                    <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300">Category Organization</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                      Well-organized categories help customers find products more easily. Consider using a consistent naming convention.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex items-center justify-end pt-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/products')}
                        className="mr-2"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        type="submit"
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
                          <>Create Category</>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="mt-8 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <Zap className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-lg mb-2">Category Structure Tips</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                      <li>Keep your category structure simple and intuitive for customers</li>
                      <li>Use descriptive names that clearly indicate what products are included</li>
                      <li>Limit nesting to 2-3 levels for better navigation</li>
                      <li>Group similar products together for easier browsing</li>
                      <li>Consider how customers search for your products</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 