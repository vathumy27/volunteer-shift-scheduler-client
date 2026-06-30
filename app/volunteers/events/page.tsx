"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Clock, Users, Search, HeartHandshake } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getEvents } from "@/services/event"
import { Event } from "@/types/event"

export default function VolunteerEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [requested, setRequested] = useState<Record<number, boolean>>({})

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

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return availableEvents
    return availableEvents.filter(
      (event) =>
        event.event_name.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
    )
  }, [availableEvents, search])

  const handleRequestSpot = (event: Event) => {
    setRequested((prev) => ({ ...prev, [event.id]: true }))
    toast.success(
      `Interest noted for "${event.event_name}". Your coordinator will follow up to confirm your shift.`
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Available Events
          </h1>
          <p className="text-sm text-muted-foreground">
            Find a shift that fits your schedule and let your coordinator know
            you&apos;re interested.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border bg-muted" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="shadow-xs">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">
              {search ? "No matching events" : "No events are open right now"}
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              {search
                ? "Try a different search term or clear the search to see all open events."
                : "New volunteer events are added regularly — please check back soon."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="flex flex-col justify-between shadow-xs transition-shadow hover:shadow-md"
            >
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-bold leading-snug">
                    {event.event_name}
                  </CardTitle>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    Open
                  </span>
                </div>
                {event.description && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {event.volunteers_needed} volunteers needed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {event.duration_hours} hour{event.duration_hours === 1 ? "" : "s"}
                </span>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleRequestSpot(event)}
                  disabled={!!requested[event.id]}
                  className="w-full font-semibold"
                  variant={requested[event.id] ? "secondary" : "default"}
                >
                  <HeartHandshake className="h-4 w-4" />
                  {requested[event.id] ? "Interest Sent" : "I'm Interested"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}