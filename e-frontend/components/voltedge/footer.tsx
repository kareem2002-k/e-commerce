"use client"

import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"

export default function Footer() {
  const { theme } = useTheme()
  const isDark = theme !== "light"

  return (
    <footer className={`${isDark ? "bg-[#030303] text-white/70" : "bg-gray-100 text-gray-600"} pt-16 pb-8`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <Image src="/images/full-logo.png" alt="VoltEdge" width={180} height={50} className="mb-4" />
              <p className="text-sm">
                Powering your digital lifestyle with cutting-edge electronics and innovative technology solutions.
              </p>
            </div>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className={`${isDark ? "text-white/60 hover:text-blue-500" : "text-gray-500 hover:text-blue-500"} transition-colors`}
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className={`${isDark ? "text-white/60 hover:text-blue-500" : "text-gray-500 hover:text-blue-500"} transition-colors`}
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className={`${isDark ? "text-white/60 hover:text-blue-500" : "text-gray-500 hover:text-blue-500"} transition-colors`}
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className={`${isDark ? "text-white/60 hover:text-blue-500" : "text-gray-500 hover:text-blue-500"} transition-colors`}
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className={`${isDark ? "text-white" : "text-gray-800"} font-semibold mb-4`}>Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Categories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Deals
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`${isDark ? "text-white" : "text-gray-800"} font-semibold mb-4`}>Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <span>123 Tech Street, Digital City, 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-blue-500" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-blue-500" />
                <span>info@voltedge.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`${isDark ? "text-white" : "text-gray-800"} font-semibold mb-4`}>Newsletter</h3>
            <p className="text-sm mb-4">Subscribe to receive updates on new products and special promotions.</p>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className={isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-800"}
              />
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className={`border-t ${isDark ? "border-white/10" : "border-gray-200"} pt-8 mt-8 text-center text-sm`}>
          <p>&copy; {new Date().getFullYear()} VoltEdge Electronics. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-blue-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-500 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-blue-500 transition-colors">
              Shipping Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
