"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import TopBar from "@/components/layout/TopBar";

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

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

  return (
    <ProtectedRoute>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background"
      >
        <TopBar />
        
        <div className="mx-auto max-w-6xl p-4">
          <div className="mt-8">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold sm:text-3xl"
            >
              Welcome to VoltEdge
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-muted-foreground"
            >
              Your premium destination for cutting-edge electronics
            </motion.p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => router.push('/products')}
              className="cursor-pointer"
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Featured Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Discover our latest products and bestsellers. Premium quality at competitive prices.</p>
                  <Button variant="link" className="p-0 mt-2">
                    Browse Products →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Special Offers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Exclusive deals for our customers. Limited-time offers on selected electronics.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Account Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  
                  {/* Admin button */}
                  {user?.isAdmin && (
                    <Button 
                      onClick={() => router.push('/admin/products')}
                      className="bg-blue-600 hover:bg-blue-700 mt-4"
                    >
                      Manage Products
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
} 