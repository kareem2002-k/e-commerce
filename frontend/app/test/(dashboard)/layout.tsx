import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { GeometricBackground } from "@/components/ui/geometric-background"

/**
 * Main dashboard layout component.
 * Provides the common layout structure for all dashboard pages.
 *
 * @param children - The page content to be rendered within the layout
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <GeometricBackground />
      <SiteHeader />
      <main className="flex-1 container py-6 md:py-10 relative z-10">{children}</main>
      <SiteFooter />
    </div>
  )
}
