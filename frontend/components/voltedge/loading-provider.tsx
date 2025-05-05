"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import LoadingScreen from "./loading-screen"

interface LoadingContextType {
  isLoading: boolean
  startLoading: (message?: string) => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {}
})

export function useLoading() {
  return useContext(LoadingContext)
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | undefined>("Powering up...")
  
  // Initial app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])
  
  const startLoading = (msg?: string) => {
    setMessage(msg)
    setIsLoading(true)
  }
  
  const stopLoading = () => {
    setIsLoading(false)
  }
  
  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {isLoading && <LoadingScreen message={message} />}
      <div className={isLoading ? "hidden" : "block"}>
        {children}
      </div>
    </LoadingContext.Provider>
  )
} 