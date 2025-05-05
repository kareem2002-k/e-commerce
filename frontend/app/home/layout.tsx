"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  // Page transition animation
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <motion.main
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="flex-1 container mx-auto py-6 px-4 sm:px-6"
      >
        {children}
      </motion.main>
      <footer className="bg-background/50 backdrop-blur-sm border-t py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} VoltEdge Electronics. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
