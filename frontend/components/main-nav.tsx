"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Laptop, Smartphone, Headphones, Watch, Camera, Tv, Speaker, Gamepad2 } from "lucide-react"

const components: { title: string; href: string; description: string; icon: React.ReactNode }[] = [
  {
    title: "Laptops",
    href: "/search?category=Laptops",
    description: "High-performance laptops for work and gaming.",
    icon: <Laptop className="h-6 w-6 text-voltBlue-500" />,
  },
  {
    title: "Smartphones",
    href: "/search?category=Smartphones",
    description: "Latest smartphones with cutting-edge technology.",
    icon: <Smartphone className="h-6 w-6 text-voltBlue-500" />,
  },
  {
    title: "Audio",
    href: "/search?category=Audio",
    description: "Premium headphones and earbuds for immersive sound.",
    icon: <Headphones className="h-6 w-6 text-voltBlue-500" />,
  },
  {
    title: "Wearables",
    href: "/search?category=Wearables",
    description: "Smart watches and fitness trackers for active lifestyles.",
    icon: <Watch className="h-6 w-6 text-voltBlue-500" />,
  },
  {
    title: "Cameras",
    href: "/search?category=Cameras",
    description: "Professional cameras for photography enthusiasts.",
    icon: <Camera className="h-6 w-6 text-voltBlue-500" />,
  },
  {
    title: "TVs",
    href: "/search?category=TVs",
    description: "Smart TVs with crystal-clear display and connectivity.",
    icon: <Tv className="h-6 w-6 text-voltBlue-500" />,
  },
  {
    title: "Speakers",
    href: "/search?category=Speakers",
    description: "Wireless speakers for room-filling sound.",
    icon: <Speaker className="h-6 w-6 text-voltBlue-500" />,
  },
  {
    title: "Gaming",
    href: "/search?category=Gaming",
    description: "Gaming consoles and accessories for ultimate gameplay.",
    icon: <Gamepad2 className="h-6 w-6 text-voltBlue-500" />,
  },
]

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem key={component.title} title={component.title} href={component.href} icon={component.icon}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/search?tag=deals" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Deals</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/support" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Support</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {icon}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
