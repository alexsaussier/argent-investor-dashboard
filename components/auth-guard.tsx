"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "super_admin"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)

        const response = await fetch("/api/auth/me", {
          credentials: "include", // Ensure cookies are included
        })

        if (!response.ok) {
          // User not authenticated, redirect to login
           router.push("/login")
          return
        }

        const data = await response.json()

        // Check role authorization
        if (requiredRole) {
          if (requiredRole === "admin" && !["admin", "super_admin"].includes(data.user.role)) {
            router.push("/")
            return
          }

          if (requiredRole === "super_admin" && data.user.role !== "super_admin") {
            router.push("/")
            return
          }
        }

        setUser(data.user)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 bg-blue-600 rounded animate-pulse mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
