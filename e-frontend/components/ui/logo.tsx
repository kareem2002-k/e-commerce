"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface LogoProps {
  variant?: "icon" | "full";
  className?: string;
  size?: number;
  spinning?: boolean;
}

export function Logo({ 
  variant = "icon", 
  className, 
  size = 40,
  spinning = false
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  
  // Determine which logo to show based on variant and theme
  const logoSrc = variant === "full" 
    ? resolvedTheme === "dark" ? "/full-logo.png" : "/full-logo-light.png" 
    : "/logoIconOnly.png";
  
  // Set width and height based on variant
  const width = variant === "full" ? size * 4 : size;
  const height = size;
  
  // If spinning, use motion.div
  if (spinning) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className={cn("relative", className)}
        style={{ width, height }}
      >
        <Image
          src={logoSrc}
          alt="VoltEdge Logo"
          width={width}
          height={height}
          priority
          className="object-contain"
        />
      </motion.div>
    );
  }
  
  // Regular non-spinning logo
  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      <Image
        src={logoSrc}
        alt="VoltEdge Logo"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </div>
  );
} 