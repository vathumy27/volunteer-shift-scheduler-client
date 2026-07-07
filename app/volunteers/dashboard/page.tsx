"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, Clock, Sparkles, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedRoute, VolunteerNav } from "@/components/auth-guard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/providers/auth-provider"
import { cancelSignup, getMyHours, getMyShifts } from "@/services/shift"
import { Signup } from "@/types/shift"

function statusBadge(status: string) {
  if (status === "confirmed") return <Badge variant="success">Confirmed</Badge>
  if (status === "waitlisted") return <Badge variant="warning">Waitlisted</Badge>
  return <Badge variant="muted">{status}</Badge>
}

function ShiftRow({
  signup,
  showCancel,
  onCancel,
  cancelling,
}: {
  signup: Signup
  showCancel?: boolean
  onCancel?: () => void
  cancelling?: boolean
}) {
  const shift = signup.shift
  if (!shift) return null

  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{shift.event?.title}</p>
        <p className="text-xs text-muted-foreground">
          {shift.shift_date} · {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
          {shift.role_description ? ` · ${shift.role_description}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {statusBadge(signup.status)}
        {!showCancel && (
          <span className="text-xs text-muted-foreground">{shift.duration_hours}h</span>
        )}
        {showCancel && signup.status === "confirmed" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={cancelling}
          >
            Cancel
          </Button>
        )}
      </div>
    </li>
  )
}

export default function VolunteerDashboard() {
  const { user } = useAuth()
  const [upcoming, setUpcoming] = useState<Signup[]>([])
  const [past, setPast] = useState<Signup[]>([])
  const [hours, setHours] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cancelling, setCancelling] = useState<number | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [shiftsData, hoursData] = await Promise.all([getMyShifts(), getMyHours()])
      setUpcoming(shiftsData.upcoming)
      setPast(shiftsData.past)
      setHours(hoursData.hours_volunteered)
    } catch {
      toast.error("Failed to load dashboard.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCancel = async (shiftId: number) => {
    setCancelling(shiftId)
    try {
      await cancelSignup(shiftId)
      toast.success("Sign-up cancelled.")
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to cancel.")
    } finally {
      setCancelling(null)
    }
  }

  return (
    <AuthenticatedRoute allowedRoles={["volunteer"]}>
      <div className="mx-auto max-w-5xl p-6">
        <VolunteerNav />
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-primary to-violet-600 p-6 text-primary-foreground shadow-sm sm:p-8">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome back
              </div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Hi, {user?.name || user?.email?.split("@")[0]}!
              </h1>
              <p className="max-w-xl text-sm text-primary-foreground/85">
                Your upcoming shifts, past volunteer hours, and sign-up management.
              </p>
              <Button asChild variant="secondary" className="mt-3 font-semibold">
                <Link href="/volunteers/events">
                  Browse Open Shifts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold">
                  {isLoading ? "—" : hours ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Hours volunteered (completed shifts)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Upcoming Shifts</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No upcoming shifts.{" "}
                  <Link href="/volunteers/events" className="text-primary underline">
                    Browse open shifts
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {upcoming.map((signup) => (
                    <ShiftRow
                      key={signup.id}
                      signup={signup}
                      showCancel
                      cancelling={cancelling === signup.shift_id}
                      onCancel={() => handleCancel(signup.shift_id)}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Past Shifts</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="h-14 animate-pulse rounded-lg bg-muted" />
              ) : past.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No past shifts yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {past.map((signup) => (
                    <ShiftRow key={signup.id} signup={signup} />
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
