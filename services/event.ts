import apiClient from "@/lib/api-client"
import { downloadBlob, getFilenameFromDisposition } from "@/lib/download-file"
import { Event } from "@/types/event"
import { ExportFormat } from "@/types/export"

export interface CreateEventPayload {
  event_name: string
  volunteers_needed: number
  duration_hours: number
  description?: string
  is_available?: boolean
}

export interface UpdateEventPayload extends CreateEventPayload {}

export interface ImportResult {
  message: string
  created: number
  skipped: number
  errors?: { row: number; errors: string[] }[]
}

export const getEvents = async () => {
  const response = await apiClient.get<{ events: Event[] }>("/api/events")
  return response.data
}

export const getEvent = async (id: string | number) => {
  const response = await apiClient.get<{ event: Event }>(`/api/events/${id}`)
  return response.data
}

export const createEvent = async (payload: CreateEventPayload) => {
  const response = await apiClient.post<{ message?: string; event?: Event }>(
    "/api/events",
    payload
  )
  return response.data
}

export const updateEvent = async (id: string | number, payload: UpdateEventPayload) => {
  const response = await apiClient.put<{ message?: string; event?: Event }>(
    `/api/events/${id}`,
    payload
  )
  return response.data
}

export const deleteEvent = async (id: string | number) => {
  const response = await apiClient.delete<{ message?: string }>(`/api/events/${id}`)
  return response.data
}

export const exportEvents = async (format: ExportFormat) => {
  const response = await apiClient.get("/api/events/export", {
    params: { format },
    responseType: "blob",
  })
  const filename = getFilenameFromDisposition(
    response.headers["content-disposition"],
    `events.${format}`
  )
  downloadBlob(response.data, filename)
}

export const importEvents = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await apiClient.post<ImportResult>("/api/events/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}
