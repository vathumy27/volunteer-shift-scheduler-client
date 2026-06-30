"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, Clock, Sparkles, Users, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/providers/auth-provider"
import { getEvents } from "@/services/event"
import { Event } from "@/types/event"

export default function VolunteerDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        const data = await getEvents()
        setEvents(data.events)
      } catch (error) {
        console.error("Error fetching events:", error)
        toast.error("Failed to load events.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const availableEvents = useMemo(
    () => events.filter((event) => event.is_available),
    [events]
  )

  const totalSpotsOpen = useMemo(
    () => availableEvents.reduce((sum, event) => sum + (event.volunteers_needed || 0), 0),
    [availableEvents]
  )

  const totalHoursOnOffer = useMemo(
    () => availableEvents.reduce((sum, event) => sum + (event.duration_hours || 0), 0),
    [availableEvents]
  )

  const stats = [
    {
      label: "Open Events",
      value: availableEvents.length,
      icon: CalendarDays,
      accent: "from-primary to-violet-500",
    },
    {
      label: "Volunteer Spots Open",
      value: totalSpotsOpen,
      icon: Users,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Hours On Offer",
      value: totalHoursOnOffer,
      icon: Clock,
      accent: "from-amber-500 to-orange-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-primary to-violet-600 p-6 text-primary-foreground shadow-sm sm:p-8">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome back
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {user?.email ? `Hi, ${user.email.split("@")[0]}!` : "Hi there!"}
          </h1>
          <p className="max-w-xl text-sm text-primary-foreground/85">
            Thanks for giving your time. Browse open events below, find a shift
            that fits your schedule, and reach out to your coordinator to sign up.
          </p>
          <Button
            asChild
            variant="secondary"
            className="mt-3 font-semibold shadow-sm"
          >
            <Link href="/volunteers/events">
              Browse Available Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
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

      {/* Upcoming events preview */}
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href="/volunteers/events">
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
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : availableEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                No events are open right now
              </p>
              <p className="text-xs text-muted-foreground">
                Check back soon — new volunteer events are added regularly.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {availableEvents.slice(0, 5).map((event) => (
                <li
                  key={event.id}
                  className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {event.event_name}
                    </p>
                    {event.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {event.volunteers_needed} needed
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {event.duration_hours}h
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}