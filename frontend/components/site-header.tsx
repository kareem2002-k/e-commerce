"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { UserNav } from "@/components/navigation/user-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, Menu } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { useCart } from "@/components/cart/cart-provider"
import { ThemeToggle } from "./theme-toggle"

/**
 * The main header component for the site.
 * Includes navigation, search, theme toggle, and user menu.
 * Responsive design with mobile menu support.
 */
export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const router = useRouter()
  const { isCartOpen, toggleCart, openCart, closeCart } = useCart()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm("")
      if (searchOpen) setSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
            <MobileNav />
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logoIconOnly-Xo8UDfSNWE2m0mop6klaWzyUx0pDi1.png"
            alt="VoltEdge"
            width={32}
            height={32}
          />
          <span className="hidden font-bold sm:inline-block">VoltEdge</span>
        </Link>

        <div className="hidden md:flex md:flex-1">
          <MainNav />
        </div>

        <div className={cn("ml-auto flex items-center gap-2", searchOpen && isDesktop ? "flex-1" : "")}>
          <div className={cn("flex items-center", searchOpen && isDesktop ? "w-full" : "w-auto")}>
            {(searchOpen || !isDesktop) && (
              <form onSubmit={handleSearch} className="relative w-full max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            )}
            {isDesktop && !searchOpen && (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={toggleCart}>
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Button>

          <ThemeToggle />

          <UserNav />
        </div>
      </div>

      <CartDrawer open={isCartOpen} onOpenChange={(open) => (open ? openCart() : closeCart())} />
    </header>
  )
}
