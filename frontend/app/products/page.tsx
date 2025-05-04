"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart, Filter, Search } from "lucide-react";
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

// Product type based on backend schema
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  lowStockThreshold: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  images: {
    id: string;
    url: string;
    altText: string;
  }[];
};

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((product: Product) => 
            product.category ? JSON.stringify(product.category) : null
          ))
        )
        .filter(Boolean)
        .map(cat => JSON.parse(cat as string));
        
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
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
  
  // Add to cart functionality (placeholder for now)
  const addToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    console.log(`Added product ${productId} to cart`);
    // TODO: Implement actual cart functionality
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <TopBar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="text-muted-foreground">Browse our collection of premium electronics</p>
            </div>
            
            {/* Admin button */}
            {user?.isAdmin && (
              <Button 
                onClick={() => router.push('/admin/products')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Manage Products
              </Button>
            )}
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="md:ml-auto"
            >
              Reset Filters
            </Button>
          </div>
          
          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-6 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -5 }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <Card className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow">
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText || product.name}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {product.stock <= product.lowStockThreshold && (
                        <Badge className="absolute top-2 right-2 bg-red-500">Low Stock</Badge>
                      )}
                    </div>
                    <CardContent className="p-4 flex-grow">
                      {product.category && (
                        <div className="text-xs text-blue-500 mb-1">{product.category.name}</div>
                      )}
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <p className="font-bold text-xl">${product.price.toFixed(2)}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button 
                        onClick={(e) => addToCart(e, product.id)} 
                        className="w-full"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium">No products found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 