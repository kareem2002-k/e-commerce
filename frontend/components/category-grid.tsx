import Link from "next/link"
import { Laptop, Smartphone, Headphones, Watch, Camera, Tv, Speaker, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"
import SectionLoading from "@/components/voltedge/section-loading"

// Icon mapping for categories
const iconMap: Record<string, any> = {
  "Laptops": Laptop,
  "Smartphones": Smartphone,
  "Audio": Headphones,
  "Wearables": Watch,
  "Cameras": Camera,
  "TVs": Tv,
  "Speakers": Speaker,
  "Gaming": Gamepad2,
  // Default to Laptop if not found
  "default": Laptop,
};


interface CategoryGridProps {
  categories?: { id: string; name: string }[];
  loading?: boolean;
}

export function CategoryGrid({ categories, loading }: CategoryGridProps = {}) {
  // If loading or no categories provided, return null
  if (loading) {
    return <SectionLoading message="Loading categories..." size="small" />
  }

  // If no categories provided, return null
  if (!categories || categories.length === 0) {
    return null;
  }

  // Map provided categories
  const displayCategories = categories.map(cat => {
    const icon = iconMap[cat.name] || iconMap.default;
    const isEven = Number(cat.id) % 2 === 0;
    return {
      id: cat.id,
      name: cat.name,
      icon: icon,
      href: `/home/search?category=${cat.name}`,
      color: isEven ? "bg-voltBlue-100 dark:bg-voltBlue-900/40" : "bg-voltBlue-50 dark:bg-voltBlue-900/30",
      iconColor: isEven ? "text-voltBlue-600" : "text-voltBlue-500",
    }
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {displayCategories.map((category) => (
        <Link
          key={category.id}
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
