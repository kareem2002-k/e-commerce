"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import TopBar from "@/components/layout/TopBar";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      router.replace('/');
    } else {
      router.replace('/login');
    }
  }, [user, router]);
  
  return null;
} 