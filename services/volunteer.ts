import apiClient from '@/lib/api-client'
import { downloadBlob, getFilenameFromDisposition } from '@/lib/download-file'
import { Volunteer } from '@/types/volunteer'
import { ExportFormat } from '@/types/export'

export interface CreateVolunteerPayload {
  full_name: string
  email: string
  phone?: string
  age?: number
  joined_date?: string
}

export interface UpdateVolunteerPayload extends CreateVolunteerPayload {}

export interface ImportResult {
  message: string
  created: number
  skipped: number
  errors?: { row: number; errors: string[] }[]
}

export const getVolunteers = async () => {
  const response = await apiClient.get<{ volunteers: Volunteer[] }>('/api/volunteers')
  return response.data
}

export const getVolunteer = async (id: string | number) => {
  const response = await apiClient.get<{ volunteer: Volunteer }>(`/api/volunteers/${id}`)
  return response.data
}

export const createVolunteer = async (payload: CreateVolunteerPayload) => {
  const response = await apiClient.post<{ message?: string; volunteer?: Volunteer }>('/api/volunteers', payload)
  return response.data
}

export const updateVolunteer = async (id: string | number, payload: UpdateVolunteerPayload) => {
  const response = await apiClient.put<{ message?: string; volunteer?: Volunteer }>(`/api/volunteers/${id}`, payload)
  return response.data
}

export const deleteVolunteer = async (id: string | number) => {
  const response = await apiClient.delete<{ message?: string }>(`/api/volunteers/${id}`)
  return response.data
}

export const exportVolunteers = async (format: ExportFormat) => {
  const response = await apiClient.get('/api/volunteers/export', {
    params: { format },
    responseType: 'blob',
  })
  const filename = getFilenameFromDisposition(
    response.headers['content-disposition'],
    `volunteers.${format}`
  )
  downloadBlob(response.data, filename)
}

export const importVolunteers = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<ImportResult>('/api/volunteers/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
