"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"

interface AuthenticatedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

const ADMIN_ROLES = ["admin", "organizer"]

export function AuthenticatedRoute({ children, allowedRoles }: AuthenticatedRouteProps) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/auth/login")
      return
    }

    if (pathname.startsWith("/admin") && user.role === "volunteer") {
      router.push("/403")
      return
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/403")
    }
  }, [user, loading, router, pathname, allowedRoles])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-sm font-medium">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  if (pathname.startsWith("/admin") && user.role === "volunteer") return null

  if (allowedRoles && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (ADMIN_ROLES.includes(user.role)) {
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

  if (user) return null

  return <>{children}</>
}

export function AdminNav() {
  const { user, logout } = useAuth()

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
      <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
        <a href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
          Dashboard
        </a>
        <a href="/admin/events" className="text-muted-foreground hover:text-foreground">
          Events
        </a>
      </nav>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {user?.name || user?.email} ({user?.role})
        </span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  )
}

export function VolunteerNav() {
  const { user, logout } = useAuth()

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
      <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
        <a href="/volunteers/dashboard" className="text-muted-foreground hover:text-foreground">
          Dashboard
        </a>
        <a href="/volunteers/events" className="text-muted-foreground hover:text-foreground">
          Browse Shifts
        </a>
      </nav>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {user?.name || user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
