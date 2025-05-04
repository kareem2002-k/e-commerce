"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, Sparkles, SlidersHorizontal, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import TopBar from "@/components/layout/TopBar";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import LoadingScreen from "@/components/voltedge/loading-screen";
import { toast } from "sonner";
import { Product } from "@/types";
import { useProductsAndCategories } from "@/hooks/useProducts";


// Loading animation for products
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
</svg>
`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Use our custom hook for products and categories
  const { products, categories, loading, error } = useProductsAndCategories();
  
  // Filtered products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || selectedCategory === "" ? true : product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Handle product click
  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };
  
  // Add to cart functionality
  const addToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const { name } = product;
    toast.success(`Added ${name} to cart`, {
      description: "Item has been added to your shopping cart",
      action: {
        label: "View Cart",
        onClick: () => console.log("View cart clicked")
      }
    });
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
      boxShadow: "0 0 20px rgba(0, 123, 255, 0.5)",
      borderColor: "rgba(0, 123, 255, 1)"
    },
    normal: { 
      scale: 1,
      boxShadow: "0 0 0px rgba(0, 123, 255, 0)",
      borderColor: "rgba(148, 163, 184, 0.2)"
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading products..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Products</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <TopBar />
        
        {/* Enhanced gradient background with lightning effect */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-blue-500/20 via-blue-400/10 to-transparent -z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,123,255,0.3),rgba(255,255,255,0))] -z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-screen overflow-hidden opacity-20 -z-10 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: `${Math.random() * 100}%`, y: -100, opacity: 0 }}
              animate={{ 
                y: '120vh', 
                opacity: [0, 0.7, 0],
                x: `${Math.random() * 100}%`
              }}
              transition={{ 
                duration: 2 + Math.random() * 3, 
                repeat: Infinity, 
                delay: i * 2,
                ease: "easeIn"
              }}
              className="absolute w-[2px] h-[100px] bg-gradient-to-b from-blue-300 via-blue-500 to-transparent"
            />
          ))}
        </div>
        
        <main className="container mx-auto px-4 py-6 ">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-blue-500"
                >
                  <svg className="h-8 w-8 inline mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                Browse Products
                <motion.div
                  animate={{ 
                    rotate: [0, 15, -15, 10, -10, 0],
                    scale: [1, 1.2, 1] 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                >
                  <Sparkles className="h-6 w-6 text-blue-500" />
                </motion.div>
              </h1>
              <p className="text-muted-foreground">
                Find the perfect electronics for your needs
              </p>
            </div>
            
            {/* Admin button */}
            {user?.isAdmin && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => router.push('/admin/products')}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg shadow-blue-500/20"
                >
                  Manage Products
                </Button>
              </motion.div>
            )}
          </motion.div>
          
          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mb-8"
          >
            <motion.div 
              className="relative mx-auto max-w-3xl rounded-2xl overflow-hidden backdrop-blur-sm border border-blue-100 dark:border-blue-800/30 bg-white/80 dark:bg-gray-800/80"
              variants={searchContainerVariants}
              animate={searchFocused ? "focused" : "normal"}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-500"
                animate={{ 
                  rotate: searchFocused ? [0, -15, 15, -5, 5, 0] : 0,
                  scale: searchFocused ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.5 }}
              >
                <Search className="h-5 w-5" />
              </motion.div>
              
              <Input
                placeholder="Search for amazing products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="pl-14 pr-14 py-6 bg-transparent border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              
              {searchTerm && (
                <motion.button 
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  onClick={() => setSearchTerm("")}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ rotate: 90 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </motion.button>
              )}
              
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => {
                      if (searchTerm) {
                        // Perform search
                        toast.info(`Searching for "${searchTerm}"`, {
                          duration: 2000
                        });
                      }
                    }}
                  >
                    <Search className="h-4 w-4 mr-1" /> Search
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Filters section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 mb-8 backdrop-blur-sm border border-blue-100 dark:border-blue-800/30"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center text-blue-500 mr-2">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-medium">Filter By:</span>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="md:w-[200px] border-blue-200 dark:border-blue-800/50 focus:ring-blue-500">
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
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="md:w-[120px] border-blue-200 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Reset Filters
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Mobile filters toggle */}
          <motion.div 
            className="md:hidden mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between border-blue-200 dark:border-blue-800/50"
            >
              <span>Filters</span>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </motion.div>
          
          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden border border-blue-100 dark:border-blue-900/30">
                    <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 w-3/4 mb-2 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
                      <div className="h-4 w-1/2 mb-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
                      <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => handleProductClick(product.id)}
                  className="hover-card-shine"
                >
                  <Card className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-lg transition-all duration-300 relative border border-blue-100 dark:border-blue-800/30 bg-white dark:bg-gray-800 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Electric border effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-300/0 via-blue-500 to-blue-300/0 animate-[moveGradientX_2s_ease_infinite]" />
                      <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-blue-300/0 via-blue-500 to-blue-300/0 animate-[moveGradientY_2s_ease_infinite]" />
                      <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-r from-blue-300/0 via-blue-500 to-blue-300/0 animate-[moveGradientXReverse_2s_ease_infinite]" />
                      <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-blue-300/0 via-blue-500 to-blue-300/0 animate-[moveGradientYReverse_2s_ease_infinite]" />
                    </div>
                    
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText || product.name}
                          fill
                          className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                          placeholder="blur"
                          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="h-12 w-12 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      {product.stock <= product.lowStockThreshold && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <Badge className="bg-red-500 animate-pulse shadow-lg shadow-red-500/30">
                            Only {product.stock} left
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    <CardContent className="p-4 flex-grow bg-white dark:bg-gray-800">
                      {product.category && (
                        <motion.div 
                          className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium mb-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20"
                          whileHover={{ scale: 1.05 }}
                        >
                          <svg className="h-3 w-3 mr-1 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {product.category.name}
                        </motion.div>
                      )}
                      <h3 className="font-bold text-lg mb-2 line-clamp-1 mt-2">{product.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <motion.p 
                        className="font-bold text-xl text-blue-600 dark:text-blue-400"
                        whileHover={{ scale: 1.05 }}
                      >
                        ${product.price.toFixed(2)}
                      </motion.p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 bg-white dark:bg-gray-800">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full" 
                      >
                        <Button 
                          onClick={(e) => addToCart(e, product)} 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white group overflow-hidden relative btn-lightning"
                        >
                          <span className="relative flex items-center justify-center">
                            <ShoppingCart className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                            Add to Cart
                          </span>
                          <span className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100">
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease_forwards]" />
                          </span>
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-gradient-to-br from-blue-50/50 to-blue-50/50 dark:from-blue-900/10 dark:to-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30"
            >
              <svg className="mx-auto h-16 w-16 text-blue-400 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search criteria</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="border-blue-200 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Reset Filters
                </Button>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 