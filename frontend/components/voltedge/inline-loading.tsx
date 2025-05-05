"use client"

import { Loader2 } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface InlineLoadingProps {
  size?: "xs" | "sm" | "md"
  text?: string
  useIcon?: boolean
  className?: string
}

export default function InlineLoading({ 
  size = "sm", 
  text,
  useIcon = false,
  className
}: InlineLoadingProps) {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6"
  }
  
  const textSize = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {useIcon ? (
        <div className="relative">
          <Image 
            src="/images/logoIconOnly.png" 
            alt="Loading" 
            width={size === "xs" ? 16 : size === "sm" ? 20 : 24} 
            height={size === "xs" ? 16 : size === "sm" ? 20 : 24} 
            className="animate-pulse"
          />
        </div>
      ) : (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className={sizeClasses[size]} />
        </motion.div>
      )}
      
      {text && <span className={cn("text-muted-foreground", textSize[size])}>{text}</span>}
    </div>
  )
} 