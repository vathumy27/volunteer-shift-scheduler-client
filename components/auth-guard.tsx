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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-sm font-medium">Checking authentication...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            You do not have permission to access this page. Your role: <span className="font-semibold">{user.role}</span>
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Go Home
            </Button>
            <Button variant="destructive" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
