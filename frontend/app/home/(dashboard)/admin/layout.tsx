'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait until auth state is loaded
    if (!loading) {
      // If user is not logged in or not an admin, redirect to home
      if (!user || !user.isAdmin) {
        router.push('/home')
      }
    }
  }, [user, loading, router])

  // Show nothing while checking authentication
  if (loading || !user || !user.isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Checking permissions...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    )
  }

  // Render admin content if user is admin
  return <>{children}</>
} 