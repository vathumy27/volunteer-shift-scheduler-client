"use client"

import { Table } from "@tanstack/react-table"
import { ListFilter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().globalFilter ||
    table.getColumn("is_available")?.getFilterValue() !== undefined

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search events..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-9 max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 border-dashed">
              <ListFilter className="mr-2 size-4" />
              Availability
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={
                (table.getColumn("is_available")?.getFilterValue() as string) ??
                "all"
              }
              onValueChange={(value) => {
                table
                  .getColumn("is_available")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }}
            >
              <DropdownMenuRadioItem value="all">All events</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="available">Available</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="unavailable">
                Unavailable
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.setGlobalFilter("")
              table.getColumn("is_available")?.setFilterValue(undefined)
            }}
            className="h-9 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
