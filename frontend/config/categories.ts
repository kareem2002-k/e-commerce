import { Laptop, Smartphone, Headphones, Watch, Camera, Tv, Speaker, Gamepad2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * Product category configuration.
 * Centralized definition of all product categories with their metadata.
 */
export interface ProductCategory {
  title: string
  href: string
  description: string
  icon: LucideIcon
}

export const productCategories: ProductCategory[] = [
  {
    title: "Laptops",
    href: "/home/search?category=Laptops",
    description: "High-performance laptops for work and gaming.",
    icon: Laptop,
  },
  {
    title: "Smartphones",
    href: "/home/search?category=Smartphones",
    description: "Latest smartphones with cutting-edge technology.",
    icon: Smartphone,
  },
  {
    title: "Audio",
    href: "/home/search?category=Audio",
    description: "Premium headphones and earbuds for immersive sound.",
    icon: Headphones,
  },
  {
    title: "Wearables",
    href: "/home/search?category=Wearables",
    description: "Smart watches and fitness trackers for active lifestyles.",
    icon: Watch,
  },
  {
    title: "Cameras",
    href: "/home/search?category=Cameras",
    description: "Professional cameras for photography enthusiasts.",
    icon: Camera,
  },
  {
    title: "TVs",
    href: "/home/search?category=TVs",
    description: "Smart TVs with crystal-clear display and connectivity.",
    icon: Tv,
  },
  {
    title: "Speakers",
    href: "/home/search?category=Speakers",
    description: "Wireless speakers for room-filling sound.",
    icon: Speaker,
  },
  {
    title: "Gaming",
    href: "/home/search?category=Gaming",
    description: "Gaming consoles and accessories for ultimate gameplay.",
    icon: Gamepad2,
  },
]
