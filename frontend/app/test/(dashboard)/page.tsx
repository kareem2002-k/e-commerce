import { CategoryGrid } from "@/components/category-grid"
import { DealsBanner } from "@/components/deals-banner"
import { FeaturedProducts } from "@/components/featured-products"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero Section - Updated with darker background */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-voltBlue-900/80 to-voltBlue-800/80 dark:from-voltBlue-950 dark:to-voltBlue-900 p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-voltBlue-700/40 dark:bg-voltBlue-800/40 border border-voltBlue-600/40 dark:border-voltBlue-700/40 mb-6">
              <Zap className="h-4 w-4 text-voltBlue-300" />
              <span className="text-sm text-voltBlue-200 tracking-wide">New Arrivals</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                Cutting-Edge
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-voltBlue-300 via-voltBlue-200 to-voltBlue-100",
                  "font-pacifico",
                )}
              >
                Electronics
              </span>
            </h1>

            <p className="text-voltBlue-100 text-lg mb-6 max-w-md">
              Discover the latest in technology with premium devices designed for the modern lifestyle.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full bg-voltBlue-500 hover:bg-voltBlue-600 text-white">
                Shop Now
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-voltBlue-400 text-voltBlue-100">
                View Deals
              </Button>
            </div>
          </div>

          <div className="relative h-[300px] md:h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-voltBlue-500/20 to-voltBlue-300/20 rounded-full blur-3xl" />
            <div className="relative z-10 w-full h-full bg-[url('/placeholder.svg?height=400&width=400')] bg-contain bg-center bg-no-repeat" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <CategoryGrid />
      </section>

      {/* Featured Products */}
      <section>
        <FeaturedProducts />
      </section>

      {/* Deals Banner */}
      <section>
        <DealsBanner />
      </section>

      {/* New Arrivals */}
      <section>
        <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* We would map through new arrivals here, but for simplicity we'll just show a placeholder */}
          <div className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground">Product 1</span>
          </div>
          <div className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground">Product 2</span>
          </div>
          <div className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground">Product 3</span>
          </div>
          <div className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground">Product 4</span>
          </div>
        </div>
      </section>
    </div>
  )
}
