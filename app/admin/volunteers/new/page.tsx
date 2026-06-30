import VolunteerCreateView from "@/sections/volunteer/view/volunteer-create-view"
import React from "react"
import { AuthenticatedRoute } from "@/components/auth-guard"

export default function AdminVolunteerCreatePage() {
  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Create Volunteer</h1>
          <p className="text-muted-foreground text-sm">
            Add a new volunteer profile into the system database.
          </p>
        </div>
        <VolunteerCreateView />
      </div>
    </AuthenticatedRoute>
  )
}
