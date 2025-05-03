"use client";

import { useState, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

// Define form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Memoized form component to prevent unnecessary re-renders
const LoginFormContent = memo(function LoginFormContent({ 
  form, 
  isLoading, 
  onSubmit, 
  handleKeyDown 
}: { 
  form: any, 
  isLoading: boolean, 
  onSubmit: (data: LoginFormValues) => void,
  handleKeyDown: (e: React.KeyboardEvent) => void 
}) {
  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit((data: LoginFormValues) => {
            onSubmit(data);
          })(e);
        }} 
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="your.email@example.com"
                  type="email"
                  autoComplete="email"
                  onKeyDown={handleKeyDown}
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Password"
                  type="password"
                  autoComplete="current-password"
                  onKeyDown={handleKeyDown}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
              <span className="ml-2">Signing in...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
});

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize React Hook Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  // Form submission handler - memoized to prevent re-renders
  const onSubmit = useCallback(async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      await login(values.email, values.password);
      toast.success("Login successful", {
        description: "You have been successfully logged in."
      });
      router.push("/home");
    } catch (err) {
      toast.error("Login failed", {
        description: error || "Failed to login. Please check your credentials."
      });
      clearError();
    } finally {
      setIsLoading(false);
    }
  }, [login, router, error, clearError]);

  // Prevent form submission when pressing Enter in inputs - memoized to prevent re-renders
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  }, []);

  return (
    <AuthRedirect>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-foreground to-secondary p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginFormContent 
                form={form} 
                isLoading={isLoading} 
                onSubmit={onSubmit} 
                handleKeyDown={handleKeyDown} 
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </AuthRedirect>
  );
}
