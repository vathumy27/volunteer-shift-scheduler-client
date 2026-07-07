"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedRoute, AdminNav } from "@/components/auth-guard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { exportRoster, getRoster } from "@/services/shift"
import { RosterEntry, Shift } from "@/types/shift"

function statusBadge(status: string) {
  if (status === "confirmed") return <Badge variant="success">Confirmed</Badge>
  if (status === "waitlisted") return <Badge variant="warning">Waitlisted</Badge>
  return <Badge variant="muted">{status}</Badge>
}

export default function ShiftRosterPage() {
  const params = useParams()
  const shiftId = params.id as string
  const [shift, setShift] = useState<Shift | null>(null)
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getRoster(shiftId)
        setShift(data.shift)
        setRoster(data.roster)
      } catch {
        toast.error("Failed to load roster.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [shiftId])

  const handleExport = async () => {
    try {
      await exportRoster(shiftId)
      toast.success("Roster exported.")
    } catch {
      toast.error("Failed to export roster.")
    }
  }

  return (
    <AuthenticatedRoute allowedRoles={["admin", "organizer"]}>
      <div className="mx-auto max-w-5xl p-6">
        <AdminNav />
        <Link
          href={shift?.event_id ? `/admin/events/${shift.event_id}` : "/admin/events"}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Link>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Shift Roster</h1>
            {shift && (
              <p className="text-sm text-muted-foreground">
                {shift.event?.title} · {shift.shift_date} · {shift.start_time.slice(0, 5)} –{" "}
                {shift.end_time.slice(0, 5)} · {shift.spots_taken}/{shift.capacity} confirmed
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Signed Up Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
            ) : roster.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No sign-ups yet for this shift.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signed Up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.user?.name}</TableCell>
                      <TableCell>{entry.user?.email}</TableCell>
                      <TableCell>{statusBadge(entry.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.signed_up_at
                          ? new Date(entry.signed_up_at).toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedRoute>
  )
}
