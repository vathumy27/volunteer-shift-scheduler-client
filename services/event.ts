import apiClient from '@/lib/api-client'
import { downloadBlob, getFilenameFromDisposition } from '@/lib/download-file'
import { Events } from '@/types/event'
import { ExportFormat } from '@/types/export'

export interface CreateEventPayload {
  full_name: string
  email: string
  age?: number
  joined_date?: string
}

// export interface UpdateEventPayload extends CreateStudentPayload {}

export interface ImportResult {
  message: string
  created: number
  skipped: number
  errors?: { row: number; errors: string[] }[]
}

export const getStudents = async () => {
  const response = await apiClient.get<{ students: Event[] }>('/api/Events')
  return response.data
}

export const getEvent = async (id: string | number) => {
  const response = await apiClient.get<{ Event: Event }>(`/api/Events/${id}`)
  return response.data
}

export const createEvent = async (payload: CreateEventPayload) => {
  const response = await apiClient.post<{ message?: string; Event?: Event }>('/api/Events', payload)
  return response.data
}

export const updateEvent = async (id: string | number, payload: UpdateEventPayload) => {
  const response = await apiClient.put<{ message?: string; Event?: Event }>(`/api/Events/${id}`, payload)
  return response.data
}

export const deleteEvent = async (id: string | number) => {
  const response = await apiClient.delete<{ message?: string }>(`/api/Events/${id}`)
  return response.data
}

export const exportEvents = async (format: ExportFormat) => {
  const response = await apiClient.get('/api/Events/export', {
    params: { format },
    responseType: 'blob',
  })
  const filename = getFilenameFromDisposition(
    response.headers['content-disposition'],
    `Events.${format}`
  )
  downloadBlob(response.data, filename)
}

export const importEvents = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<ImportResult>('/api/Events/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}