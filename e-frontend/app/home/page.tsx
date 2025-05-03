"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutSuccess(true);
    
    // Show logout success message for 2 seconds, then redirect
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-background to-primary-foreground p-4"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between py-6">
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold sm:text-3xl"
            >
              Dashboard
            </motion.h1>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9 border-2 border-primary">
                  <User className="h-5 w-5" />
                </Avatar>
                <span className="font-medium">{user?.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </motion.div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Welcome</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Hello, {user?.name}! You've successfully logged in to your account.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Protected Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This page is protected. Only authenticated users can see this content.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Account Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>ID:</strong> {user?.id}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Logout Success Toast */}
        {showLogoutSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4"
          >
           
          </motion.div>
        )}
      </motion.div>
    </ProtectedRoute>
  );
} 