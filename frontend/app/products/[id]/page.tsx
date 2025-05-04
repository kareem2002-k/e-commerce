"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  ChevronLeft,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TopBar from "@/components/layout/TopBar";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from "@/types";
import { useProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import React from "react";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);

  // Extract id from params using React.use() for future compatibility
  // This approach works both with current Next.js versions and future ones
  const id = params.id;

  // Use the product hook to fetch product data
  const { product, loading, error } = useProduct(id);

  console.log(product)


  // Use useEffect for navigation instead of during render
  useEffect(() => {
    if (error?.message === "Product not found") {
      router.push("/products");
    }
  }, [error, router]);

  // Calculate average rating if reviews exist
  const averageRating = product?.reviews?.length
    ? (
        product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length
      ).toFixed(1)
    : null;

  // Add to cart functionality
  const addToCart = () => {
    if (!product) return;

    // TODO: Implement actual cart functionality
    toast.success(`Added ${quantity} of ${product.name} to cart`, {
      description: "Item has been added to your shopping cart",
      action: {
        label: "View Cart",
        onClick: () => console.log("View cart clicked"),
      },
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <TopBar />

        <main className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="h-[400px] w-full rounded-lg" />
              <div>
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/4 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-8" />
                <Skeleton className="h-8 w-1/3 mb-6" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : product ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image gallery */}
              <div>
                {product.images && product.images.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {product.images.map((image) => (
                        <CarouselItem key={image.id}>
                          <div className="relative h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            <Image
                              src={image.url}
                              alt={image.altText || product.name}
                              fill
                              className="object-contain p-4"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                ) : (
                  <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Product details */}
              <div>
                <div className="flex items-center mb-2">
                  {product.category && (
                    <Badge
                      variant="outline"
                      className="text-blue-500 border-blue-200"
                    >
                      {product.category.name}
                    </Badge>
                  )}
                  {product.stock <= product.lowStockThreshold && (
                    <Badge className="ml-2 bg-red-500">
                      Only {product.stock} left
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                <button onClick={() => console.log(product)}>Click me</button>

                {/* Rating */}
                {averageRating && (
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(Number(averageRating))
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {averageRating} ({product.reviews?.length} reviews)
                    </span>
                  </div>
                )}

                <p className="text-2xl font-bold mb-4">
                  ${product.price}
                </p>

                <div className="mb-6">
                  <p className="text-muted-foreground">{product.description}</p>
                </div>

                <div className="flex items-center mb-6">
                  <span className="mr-4">SKU: {product.sku}</span>
                  <span
                    className={
                      product.stock > 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center mb-6">
                  <span className="mr-4">Quantity:</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                  >
                    -
                  </Button>
                  <span className="mx-4 min-w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={product.stock === 0 || quantity >= product.stock}
                  >
                    +
                  </Button>
                </div>

                {/* Add to cart button */}
                <Button
                  onClick={addToCart}
                  className="w-full h-12 text-lg mb-6"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>

                {/* Shipping info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
                  <Card>
                    <CardContent className="flex items-center p-4">
                      <Truck className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-sm">Free Shipping</span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center p-4">
                      <ShieldCheck className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-sm">2 Year Warranty</span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center p-4">
                      <RotateCcw className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-sm">30 Day Returns</span>
                    </CardContent>
                  </Card>
                </div>

                {/* Admin button */}
                {user?.isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/admin/products/edit/${product.id}`)
                    }
                    className="w-full mt-4"
                  >
                    Edit Product
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium">Product not found</h3>
              <p className="text-muted-foreground mt-2">
                The product you are looking for does not exist or has been
                removed.
              </p>
              <Button className="mt-6" onClick={() => router.push("/products")}>
                Back to Products
              </Button>
            </div>
          )}

          {/* Reviews section */}
          {product && product.reviews && product.reviews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
              <div className="grid gap-4">
                {product.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{review.user.name}</p>
                          <div className="flex">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
