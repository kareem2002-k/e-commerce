"use client"

import { motion } from "framer-motion"
import { Laptop, Headphones, Smartphone, Tv, Camera, Watch, Home, Gamepad } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

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

const categories = [
  {
    name: "Computers & Laptops",
    icon: Laptop,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Audio & Headphones",
    icon: Headphones,
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Smartphones & Tablets",
    icon: Smartphone,
    color: "from-sky-500 to-cyan-600",
  },
  {
    name: "TVs & Displays",
    icon: Tv,
    color: "from-blue-600 to-indigo-600",
  },
  {
    name: "Cameras & Photography",
    icon: Camera,
    color: "from-blue-400 to-blue-500",
  },
  {
    name: "Wearable Tech",
    icon: Watch,
    color: "from-cyan-400 to-sky-500",
  },
  {
    name: "Smart Home",
    icon: Home,
    color: "from-blue-500 to-sky-500",
  },
  {
    name: "Gaming",
    icon: Gamepad,
    color: "from-indigo-500 to-blue-600",
  },
]

export default function Categories() {
  const { theme } = useTheme()
  const isDark = theme !== "light"

  return (
    <section className={`py-20 ${isDark ? "bg-[#050a14]" : "bg-gray-100"} relative overflow-hidden`}>
      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <GeometricShape
          delay={0.2}
          width={350}
          height={90}
          rotate={-8}
          gradient="from-blue-500/[0.1]"
          className="right-[-5%] top-[5%]"
        />
        <GeometricShape
          delay={0.3}
          width={250}
          height={70}
          rotate={12}
          gradient="from-cyan-500/[0.1]"
          className="left-[5%] top-[20%]"
        />
        <GeometricShape
          delay={0.4}
          width={200}
          height={60}
          rotate={-15}
          gradient="from-blue-400/[0.1]"
          className="right-[10%] bottom-[10%]"
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
            Shop by Category
          </h2>
          <p className={`${isDark ? "text-white/40" : "text-gray-600"} max-w-2xl mx-auto`}>
            Browse our extensive collection of electronics across various categories
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="group cursor-pointer"
            >
              <div
                className={`${isDark ? "bg-[#0a0a0a] border-[#1a1a1a]" : "bg-white border-gray-200"} border rounded-xl p-4 md:p-6 h-full flex flex-col items-center text-center transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(0,136,255,0.15)]`}
              >
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, 5, -5, 0],
                    transition: { duration: 0.5 },
                  }}
                  className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-4",
                    "bg-gradient-to-br",
                    category.color,
                    "shadow-[0_0_15px_rgba(0,136,255,0.3)]",
                  )}
                >
                  <category.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </motion.div>
                <h3 className={`text-sm md:text-base ${isDark ? "text-white" : "text-gray-800"} font-medium`}>
                  {category.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
