"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"

interface AuthenticatedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function AuthenticatedRoute({ children, allowedRoles }: AuthenticatedRouteProps) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  return <>{children}</>
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin" || user.role === "coordinator") {
        router.push("/admin/dashboard")
      } else {
        router.push("/volunteers/dashboard")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-sm font-medium">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return <>{children}</>
}
