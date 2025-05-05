import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logoIconOnly-Xo8UDfSNWE2m0mop6klaWzyUx0pDi1.png"
                alt="VoltEdge"
                width={32}
                height={32}
              />
              <span className="font-bold text-xl">VoltEdge</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your one-stop shop for premium electronics and cutting-edge technology.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Youtube className="h-4 w-4" />
                <span className="sr-only">YouTube</span>
              </Button>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-3">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/products/laptops" className="text-muted-foreground hover:text-foreground">
                    Laptops
                  </Link>
                </li>
                <li>
                  <Link href="/products/smartphones" className="text-muted-foreground hover:text-foreground">
                    Smartphones
                  </Link>
                </li>
                <li>
                  <Link href="/products/audio" className="text-muted-foreground hover:text-foreground">
                    Audio
                  </Link>
                </li>
                <li>
                  <Link href="/products/wearables" className="text-muted-foreground hover:text-foreground">
                    Wearables
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-muted-foreground hover:text-foreground">
                    All Products
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-muted-foreground hover:text-foreground">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-muted-foreground hover:text-foreground">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/warranty" className="text-muted-foreground hover:text-foreground">
                    Warranty
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="text-muted-foreground hover:text-foreground">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="/sustainability" className="text-muted-foreground hover:text-foreground">
                    Sustainability
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-medium mb-3">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get special offers, free giveaways, and product launches.
            </p>
            <form className="flex gap-2">
              <Input type="email" placeholder="Your email" className="max-w-[220px]" />
              <Button type="submit" size="icon">
                <Mail className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} VoltEdge. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
