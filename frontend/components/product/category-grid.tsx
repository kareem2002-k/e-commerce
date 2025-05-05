import Link from "next/link"
import { cn } from "@/lib/utils"
import { productCategories } from "@/config/categories"

/**
 * Grid display of product categories.
 * Used on the homepage to showcase main product categories.
 */
export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {productCategories.map((category) => (
        <Link
          key={category.title}
          href={category.href}
          className="group flex flex-col items-center justify-center p-6 rounded-lg transition-all hover:shadow-md"
        >
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full mb-3 transition-transform group-hover:scale-110",
              category.title === "Laptops" ||
                category.title === "Audio" ||
                category.title === "Cameras" ||
                category.title === "Speakers"
                ? "bg-voltBlue-50 dark:bg-voltBlue-900/30"
                : "bg-voltBlue-100 dark:bg-voltBlue-900/40",
            )}
          >
            <category.icon className={cn("h-8 w-8", "text-voltBlue-500")} />
          </div>
          <span className="font-medium">{category.title}</span>
        </Link>
      ))}
    </div>
  )
}
