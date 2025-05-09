"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

function GeometricShape({
  className,
  delay = 0,
  width = 200,
  height = 60,
  rotate = 0,
  gradient = "from-blue-500/[0.15]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  const { theme } = useTheme()
  const isDark = theme !== "light"

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -50,
        rotate: rotate - 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 1.8,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1 },
      }}
      className={cn("absolute z-0", className)}
    >
      <motion.div
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            isDark ? gradient : gradient.replace(/\[(0\.\d+)\]/g, "[0.08]"),
            "backdrop-blur-[1px] border border-white/[0.1]",
            "shadow-[0_4px_16px_0_rgba(0,136,255,0.1)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

const products = [
  {
    id: 1,
    name: "Ultra HD Smart TV",
    price: 899.99,
    rating: 4.8,
    reviewCount: 38,
    image: "/placeholder.svg?height=300&width=400",
    category: "TVs & Displays",
  },
  {
    id: 2,
    name: "Pro Wireless Headphones",
    price: 249.99,
    rating: 4.9,
    reviewCount: 64,
    image: "/placeholder.svg?height=300&width=400",
    category: "Audio",
  },
  {
    id: 3,
    name: "Gaming Laptop Elite",
    price: 1299.99,
    rating: 4.7,
    reviewCount: 29,
    image: "/placeholder.svg?height=300&width=400",
    category: "Computers",
  },
  {
    id: 4,
    name: "Smart Home Hub",
    price: 129.99,
    rating: 4.6,
    reviewCount: 45,
    image: "/placeholder.svg?height=300&width=400",
    category: "Smart Home",
  },
]

export default function FeaturedProducts() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const router = useRouter();
  return (
    <section
      className={`py-20 ${isDark ? "bg-gradient-to-b from-[#030303] to-[#050a14]" : "bg-gradient-to-b from-gray-50 to-gray-100"} relative overflow-hidden`}
    >
      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <GeometricShape
          delay={0.2}
          width={300}
          height={80}
          rotate={15}
          gradient="from-blue-500/[0.1]"
          className="left-[-5%] top-[10%]"
        />
        <GeometricShape
          delay={0.3}
          width={200}
          height={60}
          rotate={-12}
          gradient="from-cyan-500/[0.1]"
          className="right-[5%] top-[30%]"
        />
        <GeometricShape
          delay={0.4}
          width={250}
          height={70}
          rotate={8}
          gradient="from-blue-400/[0.1]"
          className="left-[10%] bottom-[15%]"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
            Featured Products
          </h2>
          <p className={`${isDark ? "text-white/40" : "text-gray-600"} max-w-2xl mx-auto`}>
            Discover our top-rated electronics, carefully selected for quality, innovation, and performance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Card
                className={`${isDark ? "bg-[#0a0a0a] border-[#1a1a1a]" : "bg-white border-gray-200"} overflow-hidden h-full flex flex-col relative group`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${isDark ? "from-blue-900/5 via-transparent to-cyan-900/5" : "from-blue-500/5 via-transparent to-cyan-500/5"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div
                  className={`relative h-48 ${isDark ? "bg-gradient-to-br from-blue-900/20 to-cyan-900/20" : "bg-gradient-to-br from-blue-100/50 to-cyan-100/50"} overflow-hidden`}
                >
                  <motion.div initial={{ scale: 1 }} whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }}>
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain p-4"
                    />
                  </motion.div>
                </div>
                <CardContent className="p-4 flex-grow">
                  <div className="text-xs text-blue-500 mb-1">{product.category}</div>
                  <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-2`}>
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : isDark
                                ? "text-gray-600"
                                : "text-gray-300"
                          }`}
                        />
                      ))}
                    <span className={`${isDark ? "text-white/60" : "text-gray-500"} text-xs ml-2`}>
                      {product.rating} ({product.reviewCount} reviews)
                    </span>
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>${product.price}</div>
                </CardContent>
               
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/home/products')}
              className={`${isDark ? "text-white border-white/20 hover:bg-white/5" : "text-gray-800 border-gray-300 hover:bg-gray-100/50"} rounded-full px-8 relative overflow-hidden group`}
            >
              <motion.span
                className={`absolute inset-0 w-full h-full bg-gradient-to-r ${isDark ? "from-blue-500/10 to-cyan-500/10" : "from-blue-500/5 to-cyan-500/5"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <motion.span className="relative">View All Products</motion.span>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
