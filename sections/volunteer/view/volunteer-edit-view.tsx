"use client"

import React, { useEffect, useState } from "react"
import { getVolunteer } from "@/services/volunteer"
import { useParams } from "next/navigation"

import { Volunteer } from "@/types/volunteer"
import VolunteerNewEditForm from "../volunteer-new-edit-form"

export default function VolunteerEditView() {
  const { id } = useParams()
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)

  useEffect(() => {
    if (id) {
      getVolunteer(id as string)
        .then((data) => {
          setVolunteer(data.volunteer)
        })
        .catch((error) => {
          console.error("Error fetching volunteer:", error)
        })
    }
  }, [id])

  if (!volunteer) {
    return (
      <div className="flex items-center justify-center py-8">
        <div>Loading volunteer details...</div>
      </div>
    )
  }

  return (
    <div className="flex justify-center px-4 py-8">
      <VolunteerNewEditForm currentVolunteer={volunteer} />
    </div>
  )
}
