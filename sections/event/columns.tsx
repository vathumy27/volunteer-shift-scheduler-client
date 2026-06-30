"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Event } from "@/types/event"
import { DataTableColumnHeader } from "./data-table-column-header"

interface CreateColumnsOptions {
  onDelete: (event: Event) => void
}

export function createColumns({
  onDelete,
}: CreateColumnsOptions): ColumnDef<Event>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-muted-foreground">
          #{row.getValue("id")}
        </span>
      ),
    },
    {
      accessorKey: "event_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event Name" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold">{row.getValue("event_name")}</span>
      ),
    },
    {
      accessorKey: "volunteers_needed",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Volunteers Needed"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const count = row.getValue("volunteers_needed") as number
        return (
          <div className="text-right font-medium">
            {count} {count === 1 ? "volunteer" : "volunteers"}
          </div>
        )
      },
    },
    {
      accessorKey: "duration_hours",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Duration"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const hours = row.getValue("duration_hours") as number
        return (
          <div className="text-right text-muted-foreground">
            {hours} {hours === 1 ? "hour" : "hours"}
          </div>
        )
      },
    },
    {
      accessorKey: "is_available",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      filterFn: (row, id, value) => {
        if (value === "available") return row.getValue(id) === true
        if (value === "unavailable") return row.getValue(id) === false
        return true
      },
      cell: ({ row }) => {
        const isAvailable = row.getValue("is_available") as boolean
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isAvailable
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {isAvailable ? "Available" : "Unavailable"}
          </span>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: false,
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null
        if (!description) {
          return <span className="text-muted-foreground">—</span>
        }
        return (
          <span className="line-clamp-1 max-w-[240px] text-muted-foreground">
            {description}
          </span>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const event = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(event.id))}
              >
                Copy event ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(event)}
              >
                <Trash2 className="size-4" />
                Delete event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
