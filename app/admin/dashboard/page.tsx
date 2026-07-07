"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, Clock, Users, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedRoute, AdminNav } from "@/components/auth-guard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getEvents } from "@/services/event"
import { getShifts } from "@/services/shift"
import { Event } from "@/types/event"
import { Shift } from "@/types/shift"

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [eventsData, shiftsData] = await Promise.all([getEvents(), getShifts()])
        setEvents(eventsData.events)
        setShifts(shiftsData.shifts)
      } catch {
        toast.error("Failed to load dashboard data.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const fillingUpSoon = useMemo(
    () =>
      shifts.filter(
        (s) => !s.is_full && s.capacity > 0 && s.spots_taken / s.capacity >= 0.5
      ),
    [shifts]
  )

  const stats = [
    { label: "Total Events", value: events.length, icon: CalendarDays },
    { label: "Total Shifts", value: shifts.length, icon: Clock },
    {
      label: "Shifts Filling Up",
      value: fillingUpSoon.length,
      icon: Users,
    },
  ]

  return (
    <AuthenticatedRoute allowedRoles={["admin", "organizer"]}>
      <div className="mx-auto max-w-5xl p-6">
        <AdminNav />
        <div className="space-y-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of events, shifts, and capacity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="shadow-xs">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold">
                        {isLoading ? "—" : stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold">Shifts Filling Up Soon</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/events">
                  Manage events
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
              ) : fillingUpSoon.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No shifts are near capacity yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {fillingUpSoon.slice(0, 5).map((shift) => (
                    <li
                      key={shift.id}
                      className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold">{shift.event?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {shift.shift_date} · {shift.start_time.slice(0, 5)} –{" "}
                          {shift.end_time.slice(0, 5)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">
                          {shift.spots_taken}/{shift.capacity} filled
                        </Badge>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/shifts/${shift.id}/roster`}>Roster</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedRoute>
  )
}
