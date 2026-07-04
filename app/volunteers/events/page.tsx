"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Clock, Search } from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedRoute, VolunteerNav } from "@/components/auth-guard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getShifts, signUpForShift } from "@/services/shift"
import { Shift } from "@/types/shift"

export default function VolunteerEventsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [signingUp, setSigningUp] = useState<number | null>(null)

  const loadShifts = async () => {
    setIsLoading(true)
    try {
      const data = await getShifts("open")
      setShifts(data.shifts)
    } catch {
      toast.error("Failed to load shifts.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadShifts()
  }, [])

  const filteredShifts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return shifts
    return shifts.filter(
      (shift) =>
        shift.event?.title.toLowerCase().includes(query) ||
        shift.role_description?.toLowerCase().includes(query)
    )
  }, [shifts, search])

  const handleSignUp = async (shift: Shift) => {
    setSigningUp(shift.id)
    try {
      const result = await signUpForShift(shift.id)
      toast.success(result.message)
      loadShifts()
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to sign up."
      toast.error(msg)
    } finally {
      setSigningUp(null)
    }
  }

  return (
    <AuthenticatedRoute allowedRoles={["volunteer"]}>
      <div className="mx-auto max-w-5xl p-6">
        <VolunteerNav />
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight">Browse Shifts</h1>
              <p className="text-sm text-muted-foreground">
                Find an open shift and sign up. Capacity is enforced on the server.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shifts..."
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-xl border bg-muted" />
              ))}
            </div>
          ) : filteredShifts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-semibold">No open shifts right now</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredShifts.map((shift) => (
                <Card key={shift.id} className="flex flex-col justify-between shadow-xs">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-bold leading-snug">
                        {shift.event?.title}
                      </CardTitle>
                      {shift.is_full ? (
                        <Badge variant="destructive">Full</Badge>
                      ) : (
                        <Badge variant="success">Open</Badge>
                      )}
                    </div>
                    {shift.role_description && (
                      <p className="text-sm text-muted-foreground">{shift.role_description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-1 text-xs font-medium text-muted-foreground">
                    <p className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {shift.shift_date}
                    </p>
                    <p className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)} ({shift.duration_hours}h)
                    </p>
                    <p>
                      {shift.spots_taken} / {shift.capacity} spots taken
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleSignUp(shift)}
                      disabled={shift.is_full || signingUp === shift.id}
                      className="w-full font-semibold"
                      variant={shift.is_full ? "secondary" : "default"}
                    >
                      {shift.is_full ? "Full — Join Waitlist" : "Sign Up"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedRoute>
  )
}
