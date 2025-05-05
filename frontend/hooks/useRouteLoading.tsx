"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useLoading } from "@/components/voltedge/loading-provider"

export function useRouteLoading() {
  const { startLoading, stopLoading } = useLoading()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Show loading screen on route change
    startLoading("Changing page...")
    
    // Hide loading screen after a short delay
    const timer = setTimeout(() => {
      stopLoading()
    }, 800)
    
    return () => clearTimeout(timer)
  }, [pathname, searchParams, startLoading, stopLoading])
} 