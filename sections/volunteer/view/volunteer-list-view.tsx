"use client"

import { useEffect, useState } from "react"
import { getVolunteers, deleteVolunteer, exportVolunteers, importVolunteers } from "@/services/volunteer"
import { ImportExportToolbar } from "@/components/import-export-toolbar"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Volunteer } from "@/types/volunteer"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, Pencil, Trash2 } from "lucide-react"

export default function VolunteerListView({ refreshKey = 0 }: { refreshKey?: number }) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [volunteerToDelete, setVolunteerToDelete] = useState<Volunteer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!volunteerToDelete) return
    setIsDeleting(true)
    try {
      await deleteVolunteer(volunteerToDelete.id)
      toast.success(
        `Volunteer "${volunteerToDelete.full_name}" deleted successfully!`
      )
      setVolunteerToDelete(null)
      fetchVolunteers()
    } catch (error) {
      console.error("Error deleting volunteer:", error)
      toast.error("Failed to delete volunteer.")
    } finally {
      setIsDeleting(false)
    }
  }

  const fetchVolunteers = async () => {
    try {
      const data = await getVolunteers()
      setVolunteers(data.volunteers)
    } catch (error) {
      console.error("Error fetching volunteers:", error)
    }
  }

  useEffect(() => {
    fetchVolunteers()
  }, [])

  return (
    <div className="p-2 sm:p-4">
      <div className="mb-4 flex justify-end">
        <ImportExportToolbar
          entityLabel="Volunteers"
          onExport={exportVolunteers}
          onImport={importVolunteers}
          onImportComplete={fetchVolunteers}
        />
      </div>
      <Table>
        <TableCaption>A list of volunteers fetched from the API.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {volunteers.map((volunteer) => (
            <TableRow key={volunteer.id}>
              <TableCell className="font-medium text-muted-foreground">#{volunteer.id}</TableCell>
              <TableCell className="font-semibold">{volunteer.full_name}</TableCell>
              <TableCell className="text-muted-foreground">{volunteer.email}</TableCell>
              <TableCell className="text-right font-medium">{volunteer.phone ?? "—"}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/admin/volunteers/${volunteer.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Eye className="size-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/volunteers/${volunteer.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-600">
                      <Pencil className="size-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setVolunteerToDelete(volunteer)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        open={!!volunteerToDelete}
        onOpenChange={(open) => {
          if (!open) setVolunteerToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Volunteer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete volunteer{" "}
              <strong className="font-semibold text-foreground">
                {volunteerToDelete?.full_name}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setVolunteerToDelete(null)}
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
