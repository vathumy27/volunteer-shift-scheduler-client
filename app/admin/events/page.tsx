"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedRoute, AdminNav } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createEvent, deleteEvent, getEvents } from "@/services/event"
import { Event } from "@/types/event"

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")

  const loadEvents = async () => {
    setLoading(true)
    try {
      const data = await getEvents()
      setEvents(data.events)
    } catch {
      toast.error("Failed to load events.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createEvent({ title, description, location })
      toast.success("Event created.")
      setOpen(false)
      setTitle("")
      setDescription("")
      setLocation("")
      loadEvents()
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create event.")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event and all its shifts?")) return
    try {
      await deleteEvent(id)
      toast.success("Event deleted.")
      loadEvents()
    } catch {
      toast.error("Failed to delete event.")
    }
  }

  return (
    <AuthenticatedRoute allowedRoles={["admin", "organizer"]}>
      <div className="mx-auto max-w-5xl p-6">
        <AdminNav />
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground">
              Create events and manage their shifts.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No events yet. Create your first event to add shifts.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">
                      <Link href={`/admin/events/${event.id}`} className="hover:underline">
                        {event.title}
                      </Link>
                    </CardTitle>
                    {event.location && (
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                    )}
                    {event.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  )
}
