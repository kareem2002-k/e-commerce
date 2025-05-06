"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = "Powering up..." }: LoadingScreenProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Only show theme-specific styles after hydration to prevent mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Use a consistent theme for the initial render to avoid hydration mismatch
  // After mounting, we'll use the correct theme
  const isDark = mounted ? resolvedTheme === "dark" : false

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-[#030303] flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
        >
          <Image src="/images/logoIconOnly.png" alt="VoltEdge" width={80} height={80} />

          {/* Animated glow effect */}
          <motion.div
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl -z-10"
          />
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 text-gray-600 dark:text-white/60 text-sm"
        >
          {message}
        </motion.p>
      </div>
    </div>
  )
}
