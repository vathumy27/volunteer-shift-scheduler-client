import VolunteerProfileView from "@/sections/volunteer/view/volunteer-profile-view"
import React from "react"
import { AuthenticatedRoute } from "@/components/auth-guard"

export default function AdminVolunteerProfilePage() {
  return (
    <AuthenticatedRoute allowedRoles={["admin", "coordinator"]}>
      <VolunteerProfileView />
    </AuthenticatedRoute>
  )
}
