import VolunteerEditView from "@/sections/volunteer/view/volunteer-edit-view"
import React from "react"
import { AuthenticatedRoute } from "@/components/auth-guard"

export default function AdminVolunteerEditPage() {
  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Edit Volunteer Profile</h1>
          <p className="text-muted-foreground text-sm">
            Modify the volunteer record information.
          </p>
        </div>
        <VolunteerEditView />
      </div>
    </AuthenticatedRoute>
  )
}
