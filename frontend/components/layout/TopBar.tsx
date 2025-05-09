"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, LogOut, User, Menu, X, Zap, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
import Image from "next/image";
import CartItems from "@/components/cart/CartItems";

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/home/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };
  
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/home/products" },
  ];

  const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={pageTransition}
      className={`sticky top-0 z-50 w-full backdrop-blur transition-all duration-300 ${
        scrolled ? "bg-background/80 shadow-md" : "bg-background/50"
      }`}
    >
      <div className="container flex h-16 items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-6">
          {/* Logo */}
          <Link href="/">
            <motion.div 
              className="flex items-center gap-2 font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image src="/images/logoIconOnly.png" alt="VoltEdge" width={32} height={32} />
             
             <span className="text-xl">VoltEdge</span>
            </motion.div>
          </Link>
          
    
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ThemeToggle />
          </motion.div>
          
          {/* Shopping cart */}
          <Sheet>
            <SheetTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-purple-600 to-fuchsia-600">
                        {itemCount}
                      </Badge>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="right" className="border-l border-purple-100 dark:border-purple-900">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                  Your Cart
                </SheetTitle>
              </SheetHeader>
              <div className="py-6 flex flex-col h-[calc(100vh-8rem)]">
                <CartItems onClose={() => document.body.click()} />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* User menu (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button variant="ghost" size="icon" className="relative rounded-full bg-purple-50 dark:bg-purple-900/20">
                    <Avatar className="h-8 w-8 border-2 border-purple-600">
                      <User className="h-4 w-4" />
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                <div className="flex items-center justify-start gap-2 p-2 border-b">
                  <Avatar className="h-8 w-8 border-2 border-purple-600">
                    <User className="h-4 w-4" />
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && <p className="font-medium">{user.name}</p>}
                    {user?.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center mt-2 focus:bg-purple-50 dark:focus:bg-purple-900/20"
                  onClick={() => router.push('/home/profile')}
                >
                  <User className="mr-2 h-4 w-4 text-purple-600" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center focus:bg-purple-50 dark:focus:bg-purple-900/20"
                  onClick={() => router.push('/home/orders')}
                >
                  <ShoppingCart className="mr-2 h-4 w-4 text-purple-600" />
                  My Orders
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <DropdownMenuItem 
                    className="cursor-pointer flex items-center focus:bg-purple-50 dark:focus:bg-purple-900/20"
                    onClick={() => router.push('/admin/products')}
                  >
                    <Zap className="mr-2 h-4 w-4 text-purple-600" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                {user?.isAdmin && (
                  <DropdownMenuItem 
                    className="cursor-pointer flex items-center focus:bg-purple-50 dark:focus:bg-purple-900/20"
                    onClick={() => router.push('/home/admin/coupons')}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4 text-purple-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12h16" />
                      <path d="M4 12a8 8 0 0 1 8-8" />
                      <path d="M4 12a8 8 0 0 0 8 8" />
                      <path d="M9 8l3-3 3 3" />
                      <path d="M9 16l3 3 3-3" />
                    </svg>
                    Manage Coupons
                  </DropdownMenuItem>
                )}
                {user?.isAdmin && (
                  <DropdownMenuItem 
                    className="cursor-pointer flex items-center focus:bg-purple-50 dark:focus:bg-purple-900/20"
                    onClick={() => router.push('/home/admin/campaigns')}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4 text-purple-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.5 21h3c.8 0 1.5-.7 1.5-1.5v-3c0-.8-.7-1.5-1.5-1.5h-3c-.8 0-1.5.7-1.5 1.5v3c0 .8.7 1.5 1.5 1.5z" />
                      <path d="M3 16.5v3c0 .8.7 1.5 1.5 1.5h3c.8 0 1.5-.7 1.5-1.5v-3c0-.8-.7-1.5-1.5-1.5h-3c-.8 0-1.5.7-1.5 1.5z" />
                      <path d="M12 3h3c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5h-3c-.8 0-1.5-.7-1.5-1.5v-3c0-.8.7-1.5 1.5-1.5z" />
                      <path d="M16.5 10.5c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5" />
                      <path d="M10.5 3h-6c-.8 0-1.5.7-1.5 1.5v6c0 .8.7 1.5 1.5 1.5" />
                    </svg>
                    Marketing Campaigns
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:text-red-500 flex items-center mt-2 focus:bg-red-50 dark:focus:bg-red-900/20"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile menu button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Mobile search - always visible below navbar */}
      <div className="md:hidden px-4 pb-2">
        <form onSubmit={handleSearch} className="flex w-full">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-r-0 rounded-r-none bg-background"
            />
          </div>
          <Button 
            type="submit" 
            className="rounded-l-none bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={pageTransition}
            className="fixed inset-0 z-50 bg-background md:hidden"
          >
            <div className="container h-full flex flex-col">
              <div className="flex items-center justify-between py-4">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-2 font-bold">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span className="text-xl">VoltEdge</span>
                  </div>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
              
              <nav className="flex flex-col gap-3 mt-8">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={`text-lg font-medium py-2 px-2 block transition-colors rounded-md ${
                          isActive 
                            ? "bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 text-purple-600" 
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
                {user?.isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.1 }}
                  >
                    <Link
                      href="/admin/products"
                      className={`text-lg font-medium py-2 px-2 block transition-colors rounded-md ${
                        pathname?.startsWith('/admin')
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600"
                          : "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  </motion.div>
                )}
                {user?.isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 0.5) * 0.1 }}
                  >
                    <Link
                      href="/home/admin/coupons"
                      className="text-lg font-medium py-2 px-2 block transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Manage Coupons
                    </Link>
                  </motion.div>
                )}
                {user?.isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.1 }}
                  >
                    <Link
                      href="/home/admin/campaigns"
                      className="text-lg font-medium py-2 px-2 block transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Marketing Campaigns
                    </Link>
                  </motion.div>
                )}
              </nav>
              
              <div className="mt-auto mb-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 py-2 px-2 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 rounded-md">
                    <Avatar className="h-10 w-10 border-2 border-purple-600">
                      <User className="h-5 w-5" />
                    </Avatar>
                    <div>
                      {user?.name && <p className="font-medium">{user.name}</p>}
                      {user?.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                    </div>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="justify-start w-full border-purple-100 dark:border-purple-900/20"
                      onClick={() => {
                        router.push('/home/profile');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4 text-purple-600" />
                      Profile
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="justify-start w-full border-purple-100 dark:border-purple-900/20"
                      onClick={() => {
                        router.push('/home/orders');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4 text-purple-600" />
                      My Orders
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="destructive"
                      className="justify-start w-full mt-4"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
} 