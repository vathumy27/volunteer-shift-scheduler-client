"use client"

import { getVolunteer, deleteVolunteer } from "@/services/volunteer"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Volunteer } from "@/types/volunteer"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Pencil, Trash2, Mail, Calendar, Hash, Phone, User, Clock } from "lucide-react"

export default function VolunteerProfileView() {
  const { id } = useParams()
  const router = useRouter()

  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!volunteer) return
    setIsDeleting(true)
    try {
      await deleteVolunteer(volunteer.id)
      toast.success(`Volunteer "${volunteer.full_name}" deleted successfully!`)
      router.push("/admin/volunteers")
    } catch (error) {
      console.error("Error deleting volunteer:", error)
      toast.error("Failed to delete volunteer.")
      setIsDeleting(false)
    }
  }

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
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground font-medium">Loading volunteer profile...</div>
      </div>
    )
  }

  const infoItems = [
    { label: "Volunteer ID", value: `#${volunteer.id}`, icon: Hash },
    { label: "Email Address", value: volunteer.email, icon: Mail },
    { label: "Age", value: volunteer.age ? `${volunteer.age} years` : "—", icon: User },
    { label: "Phone", value: volunteer.phone ?? "—", icon: Phone },
    { label: "Joined Date", value: volunteer.joined_date ?? "—", icon: Calendar },
    { label: "Created At", value: volunteer.created_at ?? "—", icon: Clock },
  ]

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/admin/volunteers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Volunteer Directory
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/admin/volunteers/${volunteer.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 font-semibold border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Profile header */}
      <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <span className="text-xl font-bold uppercase">
                {volunteer.full_name?.charAt(0) || "S"}
              </span>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">{volunteer.full_name}</CardTitle>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    volunteer.is_active
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20"
                  }`}
                >
                  {volunteer.is_active ? "Active" : "Inactive"}
                </span>
                <span className="text-sm text-muted-foreground">#{volunteer.id}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {infoItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground truncate">{item.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Volunteer Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete volunteer{" "}
              <strong className="font-semibold text-foreground">
                {volunteer.full_name}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
