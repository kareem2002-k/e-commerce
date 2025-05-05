"use client"

import { motion } from "framer-motion"
import { Pacifico } from "next/font/google"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
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
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

export default function HeroGeometric({
  badge = "VoltEdge Electronics",
  title1 = "Power Your",
  title2 = "Digital Lifestyle",
}: {
  badge?: string
  title1?: string
  title2?: string
}) {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const router = useRouter();

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  return (
    <div
      className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden ${isDark ? "bg-[#030303]" : "bg-gray-100"}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${isDark ? "from-blue-500/[0.05] via-transparent to-cyan-500/[0.05]" : "from-blue-500/[0.15] via-transparent to-cyan-500/[0.15]"} blur-3xl`}
      />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient={isDark ? "from-blue-500/[0.15]" : "from-blue-500/[0.25]"}
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient={isDark ? "from-cyan-500/[0.15]" : "from-cyan-500/[0.25]"}
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient={isDark ? "from-blue-400/[0.15]" : "from-blue-400/[0.25]"}
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient={isDark ? "from-sky-500/[0.15]" : "from-sky-500/[0.25]"}
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient={isDark ? "from-blue-600/[0.15]" : "from-blue-600/[0.25]"}
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDark ? "bg-white/[0.03] border border-white/[0.08]" : "bg-black/[0.08] border border-black/[0.15]"} mb-8 md:mb-12`}
          >
            <Image src="/images/logoIconOnly.png" alt="VoltEdge" width={20} height={20} />
            <span className={`text-sm ${isDark ? "text-white/60" : "text-black/80"} tracking-wide`}>{badge}</span>
          </motion.div>

          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
              <span
                className={`bg-clip-text text-transparent ${isDark ? "bg-gradient-to-b from-white to-white/80" : "bg-gradient-to-b from-gray-900 to-gray-800"}`}
              >
                {title1}
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r",
                  isDark 
                    ? "from-blue-300 via-white/90 to-cyan-300" 
                    : "from-blue-500 via-blue-600 to-cyan-500",
                  pacifico.className,
                )}
              >
                {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
            <p
              className={`text-base sm:text-lg md:text-xl ${isDark ? "text-white/40" : "text-black/70"} mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4`}
            >
              Cutting-edge electronics for the modern tech enthusiast. Premium gadgets, smart devices, and innovative
              solutions.
            </p>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 w-full sm:w-auto relative overflow-hidden group"
                onClick={() => router.push('/login')}
              >
                <motion.span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.span className="relative flex items-center">
                  Shop Now{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className={`${isDark ? "text-white border-white/20 hover:bg-white/5" : "text-gray-800 border-gray-400 hover:bg-gray-100/80"} rounded-full px-8 w-full sm:w-auto relative overflow-hidden group`}
                onClick={() => router.push('#categories')}
              >
                <motion.span
                  className={`absolute inset-0 w-full h-full bg-gradient-to-r ${isDark ? "from-blue-500/10 to-cyan-500/10" : "from-blue-500/15 to-cyan-500/15"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <motion.span className="relative flex items-center">
                  Explore Categories{" "}
                  <Zap className="ml-2 h-4 w-4 text-blue-500 group-hover:text-blue-400 group-hover:rotate-12 transition-all duration-300" />
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div
        className={`absolute inset-0 bg-gradient-to-t ${isDark ? "from-[#030303] via-transparent to-[#030303]/80" : "from-gray-100 via-transparent to-gray-100/80"} pointer-events-none`}
      />
    </div>
  )
}
