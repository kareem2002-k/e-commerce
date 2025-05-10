"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Edit, Trash2, Search, 
  Zap, ArrowUpDown, XCircle, Filter,
  BarChart3, Package, Tag, DollarSign,
  ChevronDown, Upload, Download, RefreshCw, Eye, Star
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import TopBar from "@/components/layout/TopBar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useGet } from "@/hooks/useApiFetch";
import DataLoader from "@/components/ui/data-loader";
import { Category, Product } from "@/types";
import { getUrl } from "@/utils/index";



export default function AdminProductsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name:asc");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    featuredProducts: 0,
    totalValue: 0,
    totalCategories: 0
  });
  
  // Fetch data using custom hooks
  const API_URL = getUrl();
  const [productsState, fetchProducts] = useGet<Product[]>(`${API_URL}/products`, {
    showErrorToast: false,
  });
  
  const [categoriesState, fetchCategories] = useGet<Category[]>(`${API_URL}/categories`, {
    showErrorToast: false,
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

  // Direct API call without custom hook for debugging
  useEffect(() => {
    if (token) {
      fetchProductsDirectly();
      fetchCategoriesDirectly();
    }
  }, [token]);

  const fetchProductsDirectly = async () => {
    try {
      if (!token) {
        console.error('No authentication token available');
        toast.error('Authentication error. Please log in again.');
        return;
      }

      console.log('Fetching products with token:', token ? 'Token exists' : 'No token');
      setLoading(true);
      
      const response = await fetch(`/api/products`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else {
          throw new Error(`Error fetching products: ${response.status}`);
        }
      }
      
      const data = await response.json() as Product[];
      console.log('Products fetched successfully:', data.length);
      setProducts(data);
      
      // Calculate stats
      const totalValue = data.reduce((sum: number, product: Product) => 
        sum + (product.price * product.stock), 0);
      const lowStockCount = data.filter((product: Product) => 
        product.stock <= product.lowStockThreshold).length;
      const featuredCount = data.filter((product: Product) => 
        product.featured).length;
      
      setStats(prev => ({
        ...prev,
        totalProducts: data?.length ?? 0,
        lowStockProducts: lowStockCount,
        featuredProducts: featuredCount,
        totalValue
      }));
      
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      
      if (error.message.includes('401')) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to load products: ' + error.message);
      }
      
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategoriesDirectly = async () => {
    try {
      if (!token) {
        console.error('No authentication token available for categories');
        return;
      }

      const response = await fetch(`/api/categories`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.status}`);
      }
      
      const data = await response.json() as Category[];
      console.log('Categories fetched successfully:', data.length);
      setCategories(data);
      
      setStats(prev => ({
        ...prev,
        totalCategories: data?.length ?? 0
      }));
      
    } catch (error: any) {
      console.error('Error fetching categories:', error.message);
    }
  };
  
  // Set data when it's loaded
  useEffect(() => {
    if (productsState.isSuccess && productsState.data) {
      setProducts(productsState.data);
      
      // Calculate stats
      const totalValue = productsState.data.reduce((sum: number, product: Product) => 
        sum + (product.price * product.stock), 0);
      const lowStockCount = productsState.data.filter((product: Product) => 
        product.stock <= product.lowStockThreshold).length;
      const featuredCount = productsState.data.filter((product: Product) => 
        product.featured).length;
      
      setStats(prev => ({
        ...prev,
        totalProducts: productsState.data?.length ?? 0,
        lowStockProducts: lowStockCount,
        featuredProducts: featuredCount,
        totalValue
      }));
    }
  }, [productsState.data, productsState.isSuccess]);
  
  useEffect(() => {
    if (categoriesState.isSuccess && categoriesState.data) {
      setCategories(categoriesState.data);
      setStats(prev => ({
        ...prev,
        totalCategories: categoriesState.data?.length ?? 0
      }));
    }
  }, [categoriesState.data, categoriesState.isSuccess]);
  // Combined loading state
  useEffect(() => {
    setLoading(productsState.loading || categoriesState.loading);
  }, [productsState.loading, categoriesState.loading]);
  
  // Apply filters and sorting
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" ? true : product.categoryId === selectedCategory;
    
    const matchesTab = 
      (activeTab === "all") || 
      (activeTab === "low-stock" && product.stock <= product.lowStockThreshold) ||
      (activeTab === "in-stock" && product.stock > product.lowStockThreshold) ||
      (activeTab === "featured" && product.featured);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const [field, direction] = sortBy.split(':');
    const multiplier = direction === 'asc' ? 1 : -1;
    
    switch (field) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'price':
        return multiplier * (a.price - b.price);
      case 'stock':
        return multiplier * (a.stock - b.stock);
      default:
        return 0;
    }
  });
  
  // Edit product
  const handleEditProduct = (productId: string) => {
    router.push(`/home/admin/products/edit/${productId}`);
  };
  
  // Delete product
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      // Check for user authentication
      if (!user?.email) {
        toast.error("Authentication required");
        return;
      }
      
      console.log(user.email);
      
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      // Success - update local state
      setProducts(products.filter(p => p.id !== productToDelete.id));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalProducts: prev.totalProducts - 1,
        lowStockProducts: productToDelete.stock <= productToDelete.lowStockThreshold 
          ? prev.lowStockProducts - 1 
          : prev.lowStockProducts,
        totalValue: prev.totalValue - (productToDelete.price * productToDelete.stock)
      }));
      
      toast.success("Product deleted successfully");
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error("Failed to delete product");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("name:asc");
    setActiveTab("all");
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

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

  const statsCardVariants = {
    hover: { 
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen ">
        
        {/* Lightning effect background */}
        <div className="absolute top-0 left-0 right-0 h-[300px]z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[300px] -z-10 pointer-events-none" />
        
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
          >
            <div className="flex items-center">
              <svg className="h-8 w-8 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            <div>
                <h1 className="text-3xl font-bold">Product Management</h1>
                <p className="text-muted-foreground">
                  Control your store's inventory and product catalog
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
                  variant="outline"
                  onClick={() => toast.info("Coming soon: Import product functionality")}
                  className="hidden md:flex"
            >
                  <Upload className="mr-2 h-4 w-4" />
                  Import
            </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                  variant="outline"
                  onClick={() => toast.info("Coming soon: Export product functionality")}
                  className="hidden md:flex"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                          </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => router.push('/home/admin/products/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Stats Cards - only show when data is loaded */}
          {!loading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show" 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <motion.div variants={itemVariants} whileHover="hover">
                <Card className="border-blue-100 dark:border-blue-900/30 hover:border-blue-300 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.totalProducts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      across {stats.totalCategories} categories
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants} whileHover="hover">
                <Card className="border-red-100 dark:border-red-900/30 hover:border-red-300 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                    <motion.div 
                      initial={{ rotate: 0 }}
                      animate={{ rotate: stats.lowStockProducts > 0 ? [0, 10, -10, 0] : 0 }}
                      transition={{ 
                        repeat: stats.lowStockProducts > 0 ? Infinity : 0, 
                        repeatDelay: 2
                      }}
                    >
                      <Zap className="h-4 w-4 text-red-500" />
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {stats.lowStockProducts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      products need attention
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants} whileHover="hover">
                <Card className="border-amber-100 dark:border-amber-900/30 hover:border-amber-300 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Featured Products</CardTitle>
                    <Star className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-500">
                      {stats.featuredProducts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      showcased on homepage
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants} whileHover="hover">
                <Card className="border-green-100 dark:border-green-900/30 hover:border-green-300 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${stats.totalValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      total stock value
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
          
          {/* Tabs + Search + Filters */}
          <div className="space-y-4 mb-6">
            <Tabs 
              defaultValue="all" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all">All Products</TabsTrigger>
                <TabsTrigger 
                  value="in-stock" 
                  className="relative"
                >
                  In Stock
                  {products.filter(p => p.stock > p.lowStockThreshold).length > 0 && (
                    <Badge className="ml-2 bg-green-500 hover:bg-green-600">
                      {products.filter(p => p.stock > p.lowStockThreshold).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="low-stock"
                  className="relative"
                >
                  Low Stock
                  {stats.lowStockProducts > 0 && (
                    <Badge className="ml-2 bg-red-500 hover:bg-red-600">
                      {stats.lowStockProducts}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="featured"
                  className="relative"
                >
                  Featured
                  {products.filter(p => p.featured).length > 0 && (
                    <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">
                      {products.filter(p => p.featured).length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
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
                      placeholder="Search by name, SKU, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="pl-10 pr-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    
                    {searchTerm && (
                      <motion.button 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        onClick={() => setSearchTerm("")}
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
                
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                      <SelectItem value="price:asc">Price (Low-High)</SelectItem>
                      <SelectItem value="price:desc">Price (High-Low)</SelectItem>
                      <SelectItem value="stock:asc">Stock (Low-High)</SelectItem>
                      <SelectItem value="stock:desc">Stock (High-Low)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    onClick={resetFilters}
                    className="px-2"
                    title="Reset filters"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <TabsContent value="all" className="pt-2">
                <DataLoader
                  isLoading={loading}
                  error={null} // We're not showing the error, just handling the loading state
                  data={sortedProducts}
                  onRetry={() => {
                    fetchProducts();
                    fetchCategories();
                  }}
                  isEmpty={(data) => data.length === 0}
                  emptyComponent={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12 border rounded-md bg-white dark:bg-gray-800"
                    >
                      <svg className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <h3 className="text-xl font-medium mt-4">No products found</h3>
                      <p className="text-muted-foreground mt-2">
                        {searchTerm || selectedCategory !== "all" 
                          ? "Try adjusting your filters" 
                          : "Add your first product to get started"}
                      </p>
                      {!searchTerm && selectedCategory === "all" && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-6"
                        >
                          <Button 
                            onClick={() => router.push('/admin/products/new')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Product
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  }
                >
                  {(data) => renderProductTable(data)}
                </DataLoader>
              </TabsContent>
              
              <TabsContent value="in-stock" className="pt-2">
                <DataLoader
                  isLoading={loading}
                  error={null} // We're not showing the error, just handling the loading state
                  data={sortedProducts}
                  onRetry={() => {
                    fetchProducts();
                    fetchCategories();
                  }}
                  isEmpty={(data) => data.length === 0}
                  emptyComponent={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12 border rounded-md bg-white dark:bg-gray-800"
                    >
                      <svg className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <h3 className="text-xl font-medium mt-4">No products found</h3>
                      <p className="text-muted-foreground mt-2">
                        {searchTerm || selectedCategory !== "all" 
                          ? "Try adjusting your filters" 
                          : "Add your first product to get started"}
                      </p>
                      {!searchTerm && selectedCategory === "all" && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-6"
                        >
                          <Button 
                            onClick={() => router.push('/admin/products/new')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Product
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  }
                >
                  {(data) => renderProductTable(data)}
                </DataLoader>
              </TabsContent>
              
              <TabsContent value="low-stock" className="pt-2">
                <DataLoader
                  isLoading={loading}
                  error={null} // We're not showing the error, just handling the loading state
                  data={sortedProducts}
                  onRetry={() => {
                    fetchProducts();
                    fetchCategories();
                  }}
                  isEmpty={(data) => data.length === 0}
                  emptyComponent={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12 border rounded-md bg-white dark:bg-gray-800"
                    >
                      <svg className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <h3 className="text-xl font-medium mt-4">No products found</h3>
                      <p className="text-muted-foreground mt-2">
                        {searchTerm || selectedCategory !== "all" 
                          ? "Try adjusting your filters" 
                          : "Add your first product to get started"}
                      </p>
                      {!searchTerm && selectedCategory === "all" && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-6"
                        >
                          <Button 
                            onClick={() => router.push('/admin/products/new')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Product
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  }
                >
                  {(data) => renderProductTable(data)}
                </DataLoader>
              </TabsContent>
              
              <TabsContent value="featured" className="pt-2">
                <DataLoader
                  isLoading={loading}
                  error={null} // We're not showing the error, just handling the loading state
                  data={sortedProducts}
                  onRetry={() => {
                    fetchProducts();
                    fetchCategories();
                  }}
                  isEmpty={(data) => data.length === 0}
                  emptyComponent={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12 border rounded-md bg-white dark:bg-gray-800"
                    >
                      <svg className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <h3 className="text-xl font-medium mt-4">No products found</h3>
                      <p className="text-muted-foreground mt-2">
                        {searchTerm || selectedCategory !== "all" 
                          ? "Try adjusting your filters" 
                          : "Add your first product to get started"}
                      </p>
                      {!searchTerm && selectedCategory === "all" && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-6"
                        >
                          <Button 
                            onClick={() => router.push('/admin/products/new')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Product
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  }
                >
                  {(data) => renderProductTable(data)}
                </DataLoader>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
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
  
  function renderProductTable(products: Product[]) {
    // We've already handled loading and empty states with DataLoader
    return (
      <div className="border rounded-md bg-white dark:bg-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {products.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group"
                >
                  <TableCell className="p-2">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText || product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {product.name}
                      <div className="flex gap-1">
                        {product.featured && (
                          <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                            Featured
                          </Badge>
                        )}
                        {product.discount && (
                          <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                            {product.discount}% Off
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="font-mono">
                    {product.discount ? (
                      <div className="flex flex-col">
                        <span className="text-green-600">${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                        <span className="text-xs line-through text-gray-500">${product.price}</span>
                      </div>
                    ) : (
                      `$${product.price}`
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {product.stock}
                      {product.stock <= product.lowStockThreshold && (
                        <Badge variant="outline" className="ml-2 text-red-500 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                          Low
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                        {product.category.name}
                      </Badge>
                    ) : "None"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="View product"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product.id)}
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(product)}
                        className="opacity-70 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    );
  }
} 