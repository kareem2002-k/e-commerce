"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Edit, Trash2, Search, 
  ChevronLeft, ChevronRight, FolderPlus, Zap,
  XCircle, RefreshCw, Tag, FolderTree
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TopBar from "@/components/layout/TopBar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Category = {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  productsCount?: number;
};

export default function CategoriesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Admin protection
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error("Unauthorized access", {
        description: "You do not have permission to view this page."
      });
      router.push('/home');
    }
  }, [user, router]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        
        // Process to create hierarchy and count products
        const categoriesMap = new Map<string, Category>();
        
        // Initialize categories with productsCount and empty children array
        const processedCategories = data.map((cat: Category) => ({
          ...cat,
          children: [],
          productsCount: 0
        }));
        
        // Create a map for quick lookup
        processedCategories.forEach((cat: Category) => {
          categoriesMap.set(cat.id, cat);
        });
        
        // Build the tree structure
        const rootCategories: Category[] = [];
        processedCategories.forEach((cat: Category) => {
          if (cat.parentId) {
            const parent = categoriesMap.get(cat.parentId);
            if (parent && parent.children) {
              parent.children.push(cat);
            }
          } else {
            rootCategories.push(cat);
          }
        });
        
        // Fetch product counts
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const products = await productsResponse.json();
          
          // Count products in each category
          products.forEach((product: any) => {
            if (product.categoryId) {
              const category = categoriesMap.get(product.categoryId);
              if (category) {
                category.productsCount = (category.productsCount || 0) + 1;
              }
            }
          });
        }
        
        setCategories(rootCategories);
        setFlatCategories(processedCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
        toast.error("Failed to load categories");
      }
    };
    
    if (user?.isAdmin) {
      fetchCategories();
    }
  }, [user]);
  
  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };
  
  // Edit category
  const handleEditCategory = (categoryId: string) => {
    router.push(`/admin/categories/edit/${categoryId}`);
  };
  
  // Delete category
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete category');
      
      toast.success("Category deleted successfully");
      
      // Update the category lists
      setFlatCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      
      // Update the tree structure
      const updateCategoryTree = (cats: Category[]): Category[] => {
        return cats.filter(cat => cat.id !== categoryToDelete!.id)
          .map(cat => ({
            ...cat,
            children: cat.children ? updateCategoryTree(cat.children) : []
          }));
      };
      
      setCategories(updateCategoryTree(categories));
      
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Failed to delete category");
    }
  };
  
  // Filter categories
  const filteredCategories = flatCategories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Reset search
  const resetSearch = () => {
    setSearchTerm("");
  };
  
  // Search container animation
  const searchContainerVariants = {
    focused: { 
      scale: 1.02,
      boxShadow: "0 0 15px rgba(0, 123, 255, 0.3)",
      borderColor: "rgba(0, 123, 255, 1)"
    },
    normal: { 
      scale: 1,
      boxShadow: "0 0 0px rgba(0, 123, 255, 0)",
      borderColor: "rgba(148, 163, 184, 0.2)"
    }
  };
  
  // Render category tree recursively
  const renderCategoryTree = (categoryList: Category[], depth = 0) => {
    return categoryList.map(category => (
      <React.Fragment key={category.id}>
        <motion.tr
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="group"
        >
          <TableCell className="relative">
            <div 
              className="flex items-center" 
              style={{ paddingLeft: `${depth * 20}px` }}
            >
              {category.children && category.children.length > 0 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-2"
                  onClick={() => toggleCategory(category.id)}
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-8" />
              )}
              <span className="font-medium">{category.name}</span>
            </div>
          </TableCell>
          <TableCell className="max-w-md truncate">
            {category.description || <span className="text-muted-foreground italic">No description</span>}
          </TableCell>
          <TableCell>
            {category.parent?.name || <span className="text-muted-foreground">-</span>}
          </TableCell>
          <TableCell className="text-center">
            <Badge 
              variant={category.productsCount ? "default" : "outline"}
              className={category.productsCount ? "bg-blue-500" : "text-muted-foreground"}
            >
              {category.productsCount || 0}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditCategory(category.id)}
                className="opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(category)}
                className="opacity-70 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                disabled={Boolean(category.children && category.children.length) || (category.productsCount || 0) > 0}
                title={
                  (category.children && category.children.length) 
                    ? "Cannot delete category with subcategories" 
                    : (category.productsCount || 0) > 0
                    ? "Cannot delete category with products"
                    : "Delete category"
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </motion.tr>
        
        {/* Render children if expanded */}
        {expandedCategories.has(category.id) && category.children && category.children.length > 0 && (
          renderCategoryTree(category.children, depth + 1)
        )}
      </React.Fragment>
    ));
  };
  
  // Render flat category list (for search results)
  const renderCategoryList = (categoryList: Category[]) => {
    return categoryList.map(category => (
      <motion.tr
        key={category.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="group"
      >
        <TableCell>
          <span className="font-medium">{category.name}</span>
        </TableCell>
        <TableCell className="max-w-md truncate">
          {category.description || <span className="text-muted-foreground italic">No description</span>}
        </TableCell>
        <TableCell>
          {category.parent?.name || <span className="text-muted-foreground">-</span>}
        </TableCell>
        <TableCell className="text-center">
          <Badge 
            variant={category.productsCount ? "default" : "outline"}
            className={category.productsCount ? "bg-blue-500" : "text-muted-foreground"}
          >
            {category.productsCount || 0}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditCategory(category.id)}
              className="opacity-70 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(category)}
              className="opacity-70 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
              disabled={Boolean(category.children && category.children.length) || (category.productsCount || 0) > 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </motion.tr>
    ));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <TopBar />
        
        {/* Lightning effect background */}
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-blue-500/10 via-blue-400/5 to-transparent -z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,123,255,0.2),rgba(255,255,255,0))] -z-10 pointer-events-none" />
        
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
          >
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
                <div>
                  <h1 className="text-3xl font-bold">Category Management</h1>
                  <p className="text-muted-foreground">
                    Organize your product categories
                  </p>
                </div>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => router.push('/admin/categories/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-blue-100 dark:border-blue-900/30 hover:border-blue-300 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                <Tag className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {flatCategories.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {categories.length} top-level categories
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-100 dark:border-purple-900/30 hover:border-purple-300 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Category Structure</CardTitle>
                <FolderTree className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {flatCategories.filter(c => c.parentId).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  subcategories
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100 dark:border-green-900/30 hover:border-green-300 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empty Categories</CardTitle>
                <FolderPlus className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {flatCategories.filter(c => !c.productsCount).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  categories without products
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Search */}
          <div className="mb-6">
            <motion.div
              className="relative rounded-md overflow-hidden backdrop-blur-sm border bg-white dark:bg-gray-800"
              variants={searchContainerVariants}
              animate={searchFocused ? "focused" : "normal"}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                animate={{ rotate: searchFocused ? [0, -15, 15, -5, 5, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Search className="h-4 w-4" />
              </motion.div>
              
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="pl-10 pr-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              
              {searchTerm && (
                <motion.button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  onClick={resetSearch}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ rotate: 90 }}
                >
                  <XCircle className="h-4 w-4" />
                </motion.button>
              )}
            </motion.div>
          </div>
          
          {/* Categories table */}
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              {Array(5).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : flatCategories.length > 0 ? (
            <div className="border rounded-md bg-white dark:bg-gray-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead className="text-center">Products</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchTerm ? (
                    filteredCategories.length > 0 ? (
                      renderCategoryList(filteredCategories)
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Search className="h-10 w-10 mb-2 text-gray-300" />
                            <p>No categories match your search</p>
                            <Button
                              variant="link"
                              onClick={resetSearch}
                              className="mt-2"
                            >
                              Clear search
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    renderCategoryTree(categories)
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 border rounded-md">
              <FolderPlus className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first category to organize your products
              </p>
              <Button 
                onClick={() => router.push('/admin/categories/new')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Category
              </Button>
            </div>
          )}
        </main>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
} 