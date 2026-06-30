"use client"

import { useRef, useState } from "react"
import { Download, FileUp, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExportFormat } from "@/types/export"

interface ImportExportToolbarProps {
  entityLabel: string
  onExport: (format: ExportFormat) => Promise<void>
  onImport: (file: File) => Promise<{ created: number; skipped: number; errors?: { row: number; errors: string[] }[] }>
  onImportComplete?: () => void
  canImport?: boolean
}

export function ImportExportToolbar({
  entityLabel,
  onExport,
  onImport,
  onImportComplete,
  canImport = true,
}: ImportExportToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    try {
      await onExport(format)
      toast.success(`${entityLabel} exported as ${format.toUpperCase()}.`)
    } catch (error) {
      console.error(`Error exporting ${entityLabel}:`, error)
      toast.error(`Failed to export ${entityLabel.toLowerCase()}.`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a CSV file.")
      return
    }

    setIsImporting(true)
    try {
      const result = await onImport(file)
      if (result.errors?.length) {
        toast.warning(
          `Import finished: ${result.created} created, ${result.skipped} skipped. Check console for row errors.`
        )
        console.warn(`${entityLabel} import row errors:`, result.errors)
      } else {
        toast.success(`Import finished: ${result.created} ${entityLabel.toLowerCase()} created.`)
      }
      onImportComplete?.()
    } catch (error) {
      console.error(`Error importing ${entityLabel}:`, error)
      toast.error(`Failed to import ${entityLabel.toLowerCase()}.`)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {canImport && (
        <Button
          variant="outline"
          disabled={isImporting || isExporting}
          onClick={handleImportClick}
        >
          <Upload className="size-4 mr-1.5" />
          {isImporting ? "Importing..." : "Import CSV"}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isExporting || isImporting}>
            <Download className="size-4 mr-1.5" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            <FileUp className="size-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("pdf")}>
            <FileUp className="size-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
