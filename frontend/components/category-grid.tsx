import Link from "next/link"
import { 
  Laptop, Smartphone, Headphones, Watch, Camera, Tv, Speaker, 
  Gamepad2, Tag, ShoppingCart, Package, Home, Store, Gift, Keyboard,
  Mouse, Printer, Cpu, Monitor, HardDrive, Mic
} from "lucide-react"
import { cn } from "@/lib/utils"
import SectionLoading from "@/components/voltedge/section-loading"

// Get icon component for the category
const getCategoryIcon = (iconName: string | null | undefined) => {
  if (!iconName) return Tag;
  
  // Map common category icons - add more as needed
  switch (iconName) {
    case "Laptop": return Laptop;
    case "Smartphone": return Smartphone;
    case "Headphones": return Headphones;
    case "Watch": return Watch;
    case "Camera": return Camera;
    case "Tv": return Tv;
    case "Speaker": return Speaker;
    case "Gamepad": 
    case "Gamepad2": return Gamepad2;
    case "Package": return Package;
    case "ShoppingCart": return ShoppingCart;
    case "Home": return Home;
    case "Store": return Store;
    case "Gift": return Gift;
    case "Keyboard": return Keyboard;
    case "Mouse": return Mouse;
    case "Printer": return Printer;
    case "Cpu": return Cpu;
    case "Monitor": return Monitor;
    case "HardDrive": return HardDrive;
    case "Mic": 
    case "Microphone": return Mic;
    default: return Tag;
  }
};

// Default icon mapping for categories without an icon specified
const defaultIconMap: Record<string, string> = {
  "Laptops": "Laptop",
  "Smartphones": "Smartphone",
  "Audio": "Headphones",
  "Wearables": "Watch",
  "Cameras": "Camera",
  "TVs": "Tv",
  "Speakers": "Speaker",
  "Gaming": "Gamepad2",
  // Default fallback
  "default": "Tag",
};


interface CategoryGridProps {
  categories?: { id: string; name: string; icon?: string | null }[];
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
    // Use the stored icon if available, otherwise fallback to mapping or default
    const iconName = cat.icon || defaultIconMap[cat.name] || defaultIconMap.default;
    
    // Get the actual icon component
    const IconComponent = getCategoryIcon(iconName);
    
    const isEven = Number(cat.id) % 2 === 0;
    
    return {
      id: cat.id,
      name: cat.name,
      icon: IconComponent,
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
