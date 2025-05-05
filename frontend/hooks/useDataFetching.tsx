"use client"

import { useState, useEffect, useCallback } from "react"
import { useLoading } from "@/components/voltedge/loading-provider"

export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  initialData: T,
  loadingMessage: string = "Loading data..."
) {
  const [data, setData] = useState<T>(initialData)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { startLoading, stopLoading } = useLoading()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    startLoading(loadingMessage)
    
    try {
      const result = await fetchFn()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      console.error("Error fetching data:", err)
    } finally {
      setIsLoading(false)
      stopLoading()
    }
  }, [fetchFn, loadingMessage, startLoading, stopLoading])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, error, isLoading, refetch: fetchData }
} 