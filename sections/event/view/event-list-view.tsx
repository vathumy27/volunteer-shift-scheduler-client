"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { deleteEvent, getEvents, exportEvents, importEvents } from "@/services/event"
import { ImportExportToolbar } from "@/components/import-export-toolbar"
import { Event } from "@/types/event"
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
import { createColumns } from "../columns"
import { DataTable } from "../data-table"

export default function EventListView({ refreshKey = 0 }: { refreshKey?: number }) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getEvents()
      setEvents(data.events)
    } catch (error) {
      console.error("Error fetching events:", error)
      toast.error("Failed to load events.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleDelete = async () => {
    if (!eventToDelete) return
    setIsDeleting(true)
    try {
      await deleteEvent(eventToDelete.id)
      toast.success(
        `Event "${eventToDelete.event_name}" deleted successfully!`
      )
      setEventToDelete(null)
      fetchEvents()
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("Failed to delete event.")
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = useMemo(
    () => createColumns({ onDelete: setEventToDelete }),
    []
  )

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading events...
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ImportExportToolbar
          entityLabel="Events"
          onExport={exportEvents}
          onImport={importEvents}
          onImportComplete={fetchEvents}
        />
      </div>
      <DataTable columns={columns} data={events} />
      <Dialog
        open={!!eventToDelete}
        onOpenChange={(open) => {
          if (!open) setEventToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong className="font-semibold text-foreground">
                {eventToDelete?.event_name}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setEventToDelete(null)}
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
    </>
  )
}
