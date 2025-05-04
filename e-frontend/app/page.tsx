"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/logo";
import { AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import LoadingScreen from "@/components/voltedge/loading-screen";
import FeaturedProducts from "@/components/voltedge/featured-products";
import Categories from "@/components/voltedge/categories";
import Footer from "@/components/voltedge/footer";
import HeroGeometric from "@/components/kokonutui/hero-geometric";

export default function Home() {
  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {

      router.push(user ? "/home" : "/");
    }
  }, [user, loading, router]);

  return (
    <main>
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>

      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Theme toggle button - fixed position */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>

          <HeroGeometric badge="VoltEdge Electronics" title1="Power Your" title2="Digital Lifestyle" />
          <FeaturedProducts />
          <Categories />
          <Footer />
        </motion.div>
      )}
    </main>
  );
}
