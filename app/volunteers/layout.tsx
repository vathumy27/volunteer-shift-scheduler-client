"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { AuthenticatedRoute } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  HeartHandshake,
  LayoutDashboard,
  CalendarDays,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Home,
} from "lucide-react"

export default function VolunteersLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems = [
    {
      title: "Dashboard",
      href: "/volunteers/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Available Events",
      href: "/volunteers/events",
      icon: CalendarDays,
    },
  ]

  const activeLink = (href: string) => {
    if (href === "/volunteers/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen)

  return (
    <AuthenticatedRoute allowedRoles={["volunteer"]}>
      <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300">
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-xs md:hidden"
            onClick={toggleMobile}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out md:sticky md:z-10
            ${isCollapsed ? "w-20" : "w-64"}
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
            <Link
              href="/"
              className="flex items-center gap-2.5 overflow-hidden hover:opacity-90 transition-opacity"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-primary to-violet-500 text-primary-foreground shadow-sm shadow-primary/20">
                <HeartHandshake className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <span className="font-bold text-base tracking-tight bg-linear-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
                  Volunteer Portal
                </span>
              )}
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobile}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const isActive = activeLink(item.href)
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative
                    ${isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {!isCollapsed && <span>{item.title}</span>}

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                      {item.title}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t border-border/60 space-y-2.5">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all group relative"
            >
              <Home className="h-4.5 w-4.5 shrink-0" />
              {!isCollapsed && <span>Public Site</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Public Site
                </div>
              )}
            </Link>

            <div className="flex items-center justify-between gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full h-9 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center"
                aria-label="Toggle theme"
              >
                <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hidden md:flex w-full h-9 rounded-lg text-muted-foreground hover:text-foreground items-center justify-center"
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
              </Button>
            </div>

            <div className="flex items-center gap-3 p-1.5 rounded-lg bg-muted/40 border border-border/30">
              <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <span className="text-xs uppercase font-bold">
                  {user?.email?.charAt(0) || "V"}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-foreground leading-none">
                    {user?.email}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider pt-0.5 leading-none">
                    {user?.role}
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 items-center justify-between px-4 border-b border-border bg-card md:hidden sticky top-0 z-30">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HeartHandshake className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-sm tracking-tight">Volunteer Portal</span>
            </Link>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleMobile}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthenticatedRoute>
  )
}