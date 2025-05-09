"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { DealsBanner as DealsBannerType } from "@/hooks/useContent"
import { useRouter } from "next/navigation"

interface DealsBannerProps {
  customData?: DealsBannerType | null;
}

export function DealsBanner({ customData }: DealsBannerProps) {
  const router = useRouter();
  
  // Default values
  const title = customData?.title || "Summer Savings Spectacular";
  const subtitle = customData?.subtitle || "Flash Sale";
  const description = customData?.description || "Up to 40% off on selected electronics. Limited time offer!";
  const buttonText = customData?.buttonText || "Shop Now";
  const buttonLink = customData?.buttonLink || "/home/products";
  const discount = customData?.discount || "40%";
  const backgroundColor = customData?.backgroundColor || "var(--voltBlue-600), var(--voltBlue-400)";
  const imageUrl = customData?.imageUrl || '/placeholder.svg?height=400&width=1200';

  // Check if backgroundColor contains Tailwind classes or CSS variables
  const isTailwindClass = backgroundColor.includes('from-') && backgroundColor.includes('to-');
  
  return (
    <div className={isTailwindClass ? 
      `relative overflow-hidden rounded-lg bg-gradient-to-r ${backgroundColor} p-6 md:p-8` : 
      "relative overflow-hidden rounded-lg p-6 md:p-8"
    }
    style={!isTailwindClass ? { background: `linear-gradient(to right, ${backgroundColor})` } : undefined}
    >
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay" 
        style={imageUrl ? { backgroundImage: `url('${imageUrl}')` } : undefined} 
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Zap className="h-5 w-5 text-white" />
            <span className="text-sm font-medium uppercase tracking-wider text-white/90">{subtitle}</span>
          </div>
          <h3 className={cn("text-2xl md:text-3xl font-bold text-white mb-2", "font-pacifico")}>
            {title}
          </h3>
          <p className="text-white/80 max-w-md">{description}</p>
        </div>

        <motion.div initial={{ scale: 0.9 }} animate={{ scale: [0.9, 1.05, 1] }} transition={{ duration: 0.5 }}>
          <Button 
            size="lg" 
            className="bg-white text-voltBlue-600 hover:bg-white/90 hover:text-voltBlue-700"
            onClick={() => buttonLink && router.push(buttonLink)}
          >
            {buttonText}
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/20"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="absolute -top-6 -left-6 h-16 w-16 rounded-full bg-white/20"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, delay: 1, repeat: Number.POSITIVE_INFINITY }}
      />
    </div>
  )
}
