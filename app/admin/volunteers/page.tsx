import Link from "next/link"
import { UserPlus } from "lucide-react"

import VolunteerListView from "@/sections/volunteer/view/volunteer-list-view"
import { AuthenticatedRoute } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"

export default function AdminVolunteersPage() {
  return (
    <AuthenticatedRoute allowedRoles={["admin", "coordinator"]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Volunteer Directory
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse, search, import, export, and manage all registered volunteers.
            </p>
          </div>
          <Button asChild className="font-semibold">
            <Link href="/admin/volunteers/new">
              <UserPlus className="h-4 w-4" />
              Add Volunteer
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">
          <VolunteerListView />
        </div>
      </div>
    </AuthenticatedRoute>
  )
}