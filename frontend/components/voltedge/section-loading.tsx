"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useTheme } from "next-themes"

interface SectionLoadingProps {
  message?: string
  size?: "small" | "medium"
}

export default function SectionLoading({ 
  message, 
  size = "medium" 
}: SectionLoadingProps) {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  
  const logoSize = size === "small" ? 40 : 60
  const barWidth = size === "small" ? 120 : 160

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-4 relative"
      >
        <Image src="/images/logoIconOnly.png" alt="VoltEdge" width={logoSize} height={logoSize} />

        {/* Animated glow effect */}
        <motion.div
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-blue-500/20 blur-lg -z-10"
        />
      </motion.div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: barWidth }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
      />

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className={`mt-3 ${isDark ? "text-white/60" : "text-gray-600"} text-xs`}
        >
          {message}
        </motion.p>
      )}
    </div>
  )
} 