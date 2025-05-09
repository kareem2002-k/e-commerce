"use client"

import { CategoryGrid } from "@/components/category-grid"
import { DealsBanner } from "@/components/deals-banner"
import { FeaturedProducts } from "@/components/featured-products"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProductsAndCategories } from "@/hooks/useProducts"
import { useFeaturedProducts } from "@/hooks/useProducts"
import { useState, useEffect } from "react"
import { Product } from "@/types"
import { useLoading } from "@/components/voltedge/loading-provider"
import SectionLoading from "@/components/voltedge/section-loading"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useHeroSection, useDealsBanner } from "@/hooks/useContent"
import { CampaignBanner } from "@/components/campaign-banner"

// Extending the Product type for local use to include createdAt
interface ProductWithDate extends Product {
  createdAt?: string;
}

export default function HomePage() {
  const { categories, loading: categoriesLoading, error: categoriesError , products } = useProductsAndCategories()
  const { products: featuredProducts, loading: featuredLoading, error: featuredError } = useFeaturedProducts()
  const [newArrivals, setNewArrivals] = useState<ProductWithDate[]>([])
  const { startLoading, stopLoading } = useLoading()
  const { user } = useAuth()
  const router = useRouter()
  const { heroSection, loading: heroLoading } = useHeroSection()
  const { dealsBanner, loading: dealsBannerLoading } = useDealsBanner()

  // Handle initial page data loading
  useEffect(() => {
    if (categoriesLoading || featuredLoading || heroLoading || dealsBannerLoading) {
      startLoading("Loading products...")
    } else {
      stopLoading()
    }
  }, [categoriesLoading, featuredLoading, heroLoading, dealsBannerLoading, startLoading, stopLoading])

  // Get new arrivals from products
  useEffect(() => {
    if (products && products.length > 0) { 
      // For demonstration, sort by ID as fallback if createdAt doesn't exist
      // In a real app, ensure your Product type includes createdAt from the API
      const sortedProducts = [...products].sort((a, b) => {
        // Type assertion to work with our extended interface
        const productA = a as ProductWithDate;
        const productB = b as ProductWithDate;
        
        if (productA.createdAt && productB.createdAt) {
          return new Date(productB.createdAt).getTime() - new Date(productA.createdAt).getTime()
        }
        // Fallback to sorting by ID for demo purposes
        return b.id.localeCompare(a.id)
      })
      setNewArrivals(sortedProducts.slice(0, 4))
    }
  }, [products])

  return (
    <div className="space-y-10">
      {/* Hero Section - Updated with darker background */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-voltBlue-900/80 to-voltBlue-800/80 dark:from-voltBlue-950 dark:to-voltBlue-900 p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-voltBlue-700/40 dark:bg-voltBlue-800/40 border border-voltBlue-600/40 dark:border-voltBlue-700/40 mb-6">
              <Zap className="h-4 w-4 text-voltBlue-300" />
              <span className="text-sm text-voltBlue-200 tracking-wide">
                {heroSection?.subtitle || "New Arrivals"}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                {heroSection?.title?.split(" ")[0] || "Cutting-Edge"}
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-voltBlue-300 via-voltBlue-200 to-voltBlue-100",
                  "font-pacifico",
                )}
              >
                {heroSection?.title?.split(" ").slice(1).join(" ") || "Electronics"}
              </span>
            </h1>

            <p className="text-voltBlue-100 text-lg mb-6 max-w-md">
              {heroSection?.description || "Discover the latest in technology with premium devices designed for the modern lifestyle."}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="rounded-full bg-voltBlue-500 hover:bg-voltBlue-600 text-white"
                onClick={() => heroSection?.primaryBtnLink && router.push(heroSection.primaryBtnLink)}
              >
                {heroSection?.primaryBtnText || "Shop Now"}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full border-voltBlue-400 text-voltBlue-100"
                onClick={() => heroSection?.secondaryBtnLink && router.push(heroSection.secondaryBtnLink)}
              >
                {heroSection?.secondaryBtnText || "View Deals"}
              </Button>
              
              {user?.isAdmin && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full bg-amber-500 hover:bg-amber-600 text-white border-0"
                  onClick={() => router.push('/home/admin')}
                >
                  Admin Panel
                </Button>
              )}
            </div>
          </div>

          <div className="relative h-[300px] md:h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-voltBlue-500/20 to-voltBlue-300/20 rounded-full blur-3xl" />
            <div 
              className="relative z-10 w-full h-full bg-contain bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${heroSection?.imageUrl || '/placeholder.svg?height=400&width=400'}')`
              }}
            />
          </div>
        </div>
      </section>

      {/* Active Campaign Banner */}
      <CampaignBanner />

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          {categoriesLoading ? (
            <SectionLoading message="Loading categories..." />
          ) : (
            <CategoryGrid categories={categories} loading={false} />
          )}
        </section>
      )}

      {/* Featured Products */}
      <section>
        {featuredLoading ? (
          <SectionLoading message="Loading featured products..." />
        ) : featuredError ? (
          <p className="text-red-500">Error loading featured products</p>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <FeaturedProducts products={featuredProducts} loading={false} />
        ) : null}
      </section>

      {/* Deals Banner */}
      <section>
        <DealsBanner customData={dealsBanner} />
      </section>

      {/* New Arrivals */}
      <section>
        <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
        {featuredLoading ? (
          <SectionLoading message="Loading new arrivals..." />
        ) : featuredError ? (
          <p className="text-red-500">Error loading products</p>
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <div 
                key={product.id} 
                className="group rounded-xl overflow-hidden border border-border hover:border-voltBlue-300 transition-all"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].url} 
                      alt={product.images[0].altText} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-voltBlue-600 mt-1">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No new arrivals found</p>
        )}
      </section>
    </div>
  )
}
