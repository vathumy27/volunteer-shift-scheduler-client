"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Plus, Users } from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedRoute, AdminNav } from "@/components/auth-guard"
import { Badge } from "@/components/ui/badge"
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
import { getEvent } from "@/services/event"
import { createShift } from "@/services/shift"
import { Event } from "@/types/event"
import { Shift } from "@/types/shift"

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [shiftDate, setShiftDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("12:00")
  const [capacity, setCapacity] = useState("2")
  const [roleDescription, setRoleDescription] = useState("")

  const loadEvent = async () => {
    setLoading(true)
    try {
      const data = await getEvent(eventId)
      setEvent(data.event)
    } catch {
      toast.error("Failed to load event.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvent()
  }, [eventId])

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createShift(eventId, {
        shift_date: shiftDate,
        start_time: startTime,
        end_time: endTime,
        capacity: parseInt(capacity, 10),
        role_description: roleDescription || undefined,
      })
      toast.success("Shift added.")
      setOpen(false)
      setShiftDate("")
      setRoleDescription("")
      loadEvent()
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add shift.")
    }
  }

  const renderShift = (shift: Shift) => (
    <Card key={shift.id}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">
            {shift.shift_date} · {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
          </CardTitle>
          {shift.role_description && (
            <p className="text-sm text-muted-foreground">{shift.role_description}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {shift.spots_taken} / {shift.capacity} spots filled · {shift.duration_hours}h
          </p>
        </div>
        <div className="flex items-center gap-2">
          {shift.is_full ? (
            <Badge variant="destructive">Full</Badge>
          ) : (
            <Badge variant="success">Open</Badge>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/shifts/${shift.id}/roster`}>
              <Users className="h-4 w-4" />
              Roster
            </Link>
          </Button>
        </div>
      </CardHeader>
    </Card>
  )

  return (
    <AuthenticatedRoute allowedRoles={["admin", "organizer"]}>
      <div className="mx-auto max-w-5xl p-6">
        <AdminNav />
        <Link
          href="/admin/events"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {loading ? (
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        ) : event ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{event.title}</h1>
                {event.location && (
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                )}
                {event.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                )}
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4" />
                    Add Shift
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Shift</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddShift} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shift_date">Date</Label>
                      <Input
                        id="shift_date"
                        type="date"
                        value={shiftDate}
                        onChange={(e) => setShiftDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min={1}
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role_description">Role Description</Label>
                      <Input
                        id="role_description"
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.target.value)}
                        placeholder="e.g. Setup crew, Registration desk"
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Shift</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold">Shifts</h2>
              {event.shifts && event.shifts.length > 0 ? (
                event.shifts.map(renderShift)
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No shifts yet. Add a shift to open sign-ups.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Event not found.</p>
        )}
      </div>
    </AuthenticatedRoute>
  )
}
