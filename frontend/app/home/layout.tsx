import type React from "react"
import type { Metadata } from "next"
import { Inter, Pacifico } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/components/cart/cart-provider"
import { LoadingProvider } from "@/components/voltedge/loading-provider"

export const metadata: Metadata = {
  title: "VoltEdge - Premium Electronics",
  description: "Your one-stop shop for premium electronics and gadgets",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LoadingProvider>
        <CartProvider>{children}</CartProvider>
      </LoadingProvider>
    </ThemeProvider>
  )
}
