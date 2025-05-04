"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import HeroGeometric from "@/components/voltedge/hero-geometric"
import FeaturedProducts from "@/components/voltedge/featured-products"
import Categories from "@/components/voltedge/categories"
import Footer from "@/components/voltedge/footer"
import LoadingScreen from "@/components/voltedge/loading-screen"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/products');
    }
  }, [user, loading, router]);

  return (
    <main>
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>

   
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
    </main>
  )
}
