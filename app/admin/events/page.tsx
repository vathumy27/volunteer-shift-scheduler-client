import EventListView from "@/sections/event/view/event-list-view"
import { AuthenticatedRoute } from "@/components/auth-guard"

export default function AdminEventsPage() {
  return (
    <AuthenticatedRoute allowedRoles={["admin", "coordinator"]}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Event Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse, search, import, export, and manage all volunteer events and shifts.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">
          <EventListView />
        </div>
      </div>
    </AuthenticatedRoute>
  )
}
