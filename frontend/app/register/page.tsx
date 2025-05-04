"use client"

import { useState, useCallback, memo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EyeIcon, EyeOffIcon, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import LoadingScreen from "@/components/voltedge/loading-screen"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/AuthContext"
import { AuthRedirect } from "@/components/auth/AuthRedirect"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Define form schema
const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

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
            "backdrop-blur-[2px] border-2 border-white/[0.15] dark:border-white/[0.15] border-gray-200/50",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

// Memoized form component to prevent unnecessary re-renders
const RegisterFormContent = memo(function RegisterFormContent({ 
  form, 
  isLoading, 
  onSubmit, 
  handleKeyDown,
  showPassword,
  setShowPassword
}: { 
  form: any;
  isLoading: boolean;
  onSubmit: (data: RegisterFormValues) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}) {
  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit((data: RegisterFormValues) => {
            onSubmit(data);
          })(e);
        }} 
        className="space-y-4 mb-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">
                Full Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  autoComplete="name"
                  onKeyDown={handleKeyDown}
                  className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="your@email.com"
                  type="email"
                  autoComplete="email"
                  onKeyDown={handleKeyDown}
                  className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    onKeyDown={handleKeyDown}
                    className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">
                Confirm Password
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  onKeyDown={handleKeyDown}
                  className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2 mb-2">
          <Checkbox id="terms" required />
          <Label
            htmlFor="terms"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            I agree to the{" "}
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg relative overflow-hidden group"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                <span className="ml-2">Creating account...</span>
              </div>
            ) : (
              <>
                <motion.span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.span className="relative">Create Account</motion.span>
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  )
})

export default function RegisterPage() {
  const router = useRouter()
  const { register, error, clearError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Initialize React Hook Form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
  })

  // Form submission handler - memoized to prevent re-renders
  const onSubmit = useCallback(
    async (values: RegisterFormValues) => {
      try {
        setIsLoading(true)
        await register(values.name, values.email, values.password)
        toast.success("Registration successful", {
          description: "Your account has been created successfully.",
        })
        router.push("/home")
      } catch (err) {
        toast.error("Registration failed", {
          description: error || "Failed to create account. Please try again.",
        })
        clearError()
      } finally {
        setIsLoading(false)
      }
    },
    [register, router, error, clearError]
  )

  // Prevent form submission when pressing Enter in inputs - memoized to prevent re-renders
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault()
    }
  }, [])

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.3 + i * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  if (isLoading && false) {
    // Only show loading screen on prolonged operations if needed
    return <LoadingScreen message="Creating your account..." />
  }

  return (
    <AuthRedirect>
      <div className="min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#030303] transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-cyan-500/[0.03] dark:from-blue-500/[0.05] dark:to-cyan-500/[0.05] blur-3xl" />

        <div className="absolute inset-0 overflow-hidden">
          <ElegantShape
            delay={0.3}
            width={600}
            height={140}
            rotate={12}
            gradient="from-blue-500/[0.08] dark:from-blue-500/[0.15]"
            className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
          />

          <ElegantShape
            delay={0.5}
            width={500}
            height={120}
            rotate={-15}
            gradient="from-cyan-500/[0.08] dark:from-cyan-500/[0.15]"
            className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
          />

          <ElegantShape
            delay={0.4}
            width={300}
            height={80}
            rotate={-8}
            gradient="from-blue-400/[0.08] dark:from-blue-400/[0.15]"
            className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
          />
        </div>

        {/* Theme toggle button - fixed position */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Back button */}
        <Link href="/" className="fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 bg-background/10 backdrop-blur-sm border border-white/10 hover:bg-background/20"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
            <span className="sr-only">Back to home</span>
          </Button>
        </Link>

        <div className="relative z-10 w-full max-w-md px-4 py-8">
          <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-white/[0.08] p-6 md:p-8">
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/images/full-logo.png"
                  alt="VoltEdge"
                  width={180}
                  height={50}
                />
              </motion.div>
            </div>

            <motion.h1
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="text-2xl md:text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white"
            >
              Create Account
            </motion.h1>

            <motion.p
              custom={1}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="text-center text-gray-600 dark:text-gray-300 mb-8"
            >
              Join VoltEdge for exclusive deals and offers
            </motion.p>

            <motion.div
              custom={2}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <RegisterFormContent 
                form={form} 
                isLoading={isLoading} 
                onSubmit={onSubmit} 
                handleKeyDown={handleKeyDown}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            </motion.div>

            <motion.div
              custom={5}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="mt-6 text-center"
            >
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </AuthRedirect>
  )
}
