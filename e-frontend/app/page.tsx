"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // If user is already logged in, redirect to home page
      // Otherwise, redirect to login page
      router.push(user ? "/home" : "/login");
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="mb-8">
        <Logo variant="full" size={60} spinning={true} />
      </div>
      <p className="text-muted-foreground mt-4 animate-pulse">Loading...</p>
    </div>
  );
}
