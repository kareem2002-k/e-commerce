"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

export default function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Placeholder cart data (will be replaced with actual cart state)
  const cartItemCount = 0;
  
  const handleLogout = () => {
    logout();
    
    toast.success("Logged out successfully", {
      description: "You have been logged out of your account."
    });
    
    // Redirect after a short delay
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };
  
  const navItems = [
    { name: "Home", href: "/home" },
    { name: "Products", href: "/products" },
    // Add more nav items as needed
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          {/* Logo */}
          <Link href="/home">
            <span className="hidden md:inline-block font-bold text-xl">VoltEdge</span>
            <span className="md:hidden font-bold text-xl">VE</span>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
            {user?.isAdmin && (
              <Link
                href="/admin/products"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* Shopping cart */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-500">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                {cartItemCount === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground mb-6">
                      Looks like you haven't added any products to your cart yet.
                    </p>
                    <Button onClick={() => router.push('/products')}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  // Cart items will be rendered here
                  <div>Cart items go here</div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          {/* User menu (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-primary">
                    <User className="h-4 w-4" />
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && <p className="font-medium">{user.name}</p>}
                    {user?.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push('/profile')}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push('/orders')}
                >
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 bg-background md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="container h-full flex flex-col">
          <div className="flex items-center justify-between py-4">
            <Link href="/home" onClick={() => setMobileMenuOpen(false)}>
              <span className="font-bold text-xl">VoltEdge</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex flex-col gap-4 mt-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium py-2 transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user?.isAdmin && (
              <Link
                href="/admin/products"
                className="text-lg font-medium py-2 transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
          </nav>
          
          <div className="mt-auto mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 py-2">
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <User className="h-4 w-4" />
                </Avatar>
                <div>
                  {user?.name && <p className="font-medium">{user.name}</p>}
                  {user?.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                </div>
              </div>
              
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => {
                  router.push('/profile');
                  setMobileMenuOpen(false);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => {
                  router.push('/orders');
                  setMobileMenuOpen(false);
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                My Orders
              </Button>
              
              <Button
                variant="destructive"
                className="justify-start mt-4"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 