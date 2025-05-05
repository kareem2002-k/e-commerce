"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetClose } from "@/components/ui/sheet"
import { productCategories } from "@/config/categories"

/**
 * Mobile navigation component that displays in a slide-out sheet.
 * Includes collapsible product categories and main navigation links.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logoIconOnly-Xo8UDfSNWE2m0mop6klaWzyUx0pDi1.png"
            alt="VoltEdge"
            width={32}
            height={32}
          />
          <span className="font-bold text-xl">VoltEdge</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-lg font-medium" onClick={() => setOpen(false)}>
            Home
          </Link>

          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between px-0 py-2 font-medium"
              onClick={() => setOpen(!open)}
            >
              <span className="text-lg">Products</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")} />
            </Button>
            {open && (
              <div className="grid grid-cols-1 gap-2 pl-4">
                {productCategories.map((category) => (
                  <SheetClose asChild key={category.title}>
                    <Link
                      href={category.href}
                      className="flex items-center gap-2 py-2 text-muted-foreground hover:text-foreground"
                    >
                      <category.icon className="h-5 w-5 text-voltBlue-500" />
                      <span>{category.title}</span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
            )}
          </div>

          <SheetClose asChild>
            <Link href="/search?tag=deals" className="text-lg font-medium">
              Deals
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link href="/support" className="text-lg font-medium">
              Support
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link href="/orders" className="text-lg font-medium">
              My Orders
            </Link>
          </SheetClose>
        </div>
      </ScrollArea>
    </div>
  )
}
