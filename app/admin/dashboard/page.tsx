"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, Clock, UserPlus, Users, ArrowRight, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/providers/auth-provider"
import { getEvents } from "@/services/event"
import { getVolunteers } from "@/services/volunteer"
import { Event } from "@/types/event"
import { Volunteer } from "@/types/volunteer"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [eventsData, volunteersData] = await Promise.all([
          getEvents(),
          getVolunteers(),
        ])
        setEvents(eventsData.events)
        setVolunteers(volunteersData.volunteers)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        toast.error("Failed to load dashboard data.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const openEvents = useMemo(() => events.filter((e) => e.is_available), [events])
  const spotsOpen = useMemo(
    () => openEvents.reduce((sum, e) => sum + (e.volunteers_needed || 0), 0),
    [openEvents]
  )

  const stats = [
    {
      label: "Total Volunteers",
      value: volunteers.length,
      icon: Users,
      accent: "from-primary to-violet-500",
    },
    {
      label: "Open Events",
      value: openEvents.length,
      icon: CalendarDays,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Spots Needed",
      value: spotsOpen,
      icon: UserPlus,
      accent: "from-amber-500 to-orange-500",
    },
    {
      label: "Total Events",
      value: events.length,
      icon: Clock,
      accent: "from-sky-500 to-blue-500",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}. Here&apos;s
          an overview of your volunteer program.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="shadow-xs">
              <CardContent className="flex items-center gap-4 py-2">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr ${stat.accent} text-white shadow-sm`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-extrabold tracking-tight text-foreground">
                    {isLoading ? "—" : stat.value}
                  </p>
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent volunteers */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-bold">Recent Volunteers</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link href="/admin/volunteers">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : volunteers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No volunteers registered yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {volunteers.slice(0, 5).map((v) => (
                  <li key={v.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase">
                      {v.full_name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {v.full_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{v.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Open events */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-bold">Open Events</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link href="/admin/events">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : openEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No events currently open.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {openEvents.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {e.event_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.volunteers_needed} needed · {e.duration_hours}h
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}