import Link from "next/link"
import { Laptop, Smartphone, Headphones, Watch, Camera, Tv, Speaker, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  {
    name: "Laptops",
    icon: Laptop,
    href: "/search?category=Laptops",
    color: "bg-voltBlue-50 dark:bg-voltBlue-900/30",
    iconColor: "text-voltBlue-500",
  },
  {
    name: "Smartphones",
    icon: Smartphone,
    href: "/search?category=Smartphones",
    color: "bg-voltBlue-100 dark:bg-voltBlue-900/40",
    iconColor: "text-voltBlue-600",
  },
  {
    name: "Audio",
    icon: Headphones,
    href: "/search?category=Audio",
    color: "bg-voltBlue-50 dark:bg-voltBlue-900/30",
    iconColor: "text-voltBlue-500",
  },
  {
    name: "Wearables",
    icon: Watch,
    href: "/search?category=Wearables",
    color: "bg-voltBlue-100 dark:bg-voltBlue-900/40",
    iconColor: "text-voltBlue-600",
  },
  {
    name: "Cameras",
    icon: Camera,
    href: "/search?category=Cameras",
    color: "bg-voltBlue-50 dark:bg-voltBlue-900/30",
    iconColor: "text-voltBlue-500",
  },
  {
    name: "TVs",
    icon: Tv,
    href: "/search?category=TVs",
    color: "bg-voltBlue-100 dark:bg-voltBlue-900/40",
    iconColor: "text-voltBlue-600",
  },
  {
    name: "Speakers",
    icon: Speaker,
    href: "/search?category=Speakers",
    color: "bg-voltBlue-50 dark:bg-voltBlue-900/30",
    iconColor: "text-voltBlue-500",
  },
  {
    name: "Gaming",
    icon: Gamepad2,
    href: "/search?category=Gaming",
    color: "bg-voltBlue-100 dark:bg-voltBlue-900/40",
    iconColor: "text-voltBlue-600",
  },
]

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={category.href}
          className="group flex flex-col items-center justify-center p-6 rounded-lg transition-all hover:shadow-md"
        >
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full mb-3 transition-transform group-hover:scale-110",
              category.color,
            )}
          >
            <category.icon className={cn("h-8 w-8", category.iconColor)} />
          </div>
          <span className="font-medium">{category.name}</span>
        </Link>
      ))}
    </div>
  )
}
