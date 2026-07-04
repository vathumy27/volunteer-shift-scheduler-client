import apiClient from "@/lib/api-client"
import { downloadBlob, getFilenameFromDisposition } from "@/lib/download-file"
import {
  CreateShiftPayload,
  MyShiftsResponse,
  RosterEntry,
  Shift,
  UpdateShiftPayload,
} from "@/types/shift"

export const getShifts = async (status?: string) => {
  const response = await apiClient.get<{ shifts: Shift[] }>("/api/shifts", {
    params: status ? { status } : undefined,
  })
  return response.data
}

export const getShift = async (id: string | number) => {
  const response = await apiClient.get<{ shift: Shift }>(`/api/shifts/${id}`)
  return response.data
}

export const createShift = async (eventId: string | number, payload: CreateShiftPayload) => {
  const response = await apiClient.post<{ message?: string; shift?: Shift }>(
    `/api/events/${eventId}/shifts`,
    payload
  )
  return response.data
}

export const updateShift = async (id: string | number, payload: UpdateShiftPayload) => {
  const response = await apiClient.put<{ message?: string; shift?: Shift }>(
    `/api/shifts/${id}`,
    payload
  )
  return response.data
}

export const deleteShift = async (id: string | number) => {
  const response = await apiClient.delete<{ message?: string }>(`/api/shifts/${id}`)
  return response.data
}

export const signUpForShift = async (shiftId: string | number) => {
  const response = await apiClient.post<{
    message: string
    status: string
  }>(`/api/shifts/${shiftId}/signup`)
  return response.data
}

export const cancelSignup = async (shiftId: string | number) => {
  const response = await apiClient.delete<{ message: string }>(
    `/api/shifts/${shiftId}/signup`
  )
  return response.data
}

export const getMyShifts = async () => {
  const response = await apiClient.get<MyShiftsResponse>("/api/users/me/shifts")
  return response.data
}

export const getMyHours = async (userId?: number) => {
  const response = await apiClient.get<{ user_id: number; hours_volunteered: number }>(
    "/api/users/me/hours",
    { params: userId ? { user_id: userId } : undefined }
  )
  return response.data
}

export const getRoster = async (shiftId: string | number) => {
  const response = await apiClient.get<{
    shift: Shift
    roster: RosterEntry[]
  }>(`/api/shifts/${shiftId}/roster`)
  return response.data
}

export const exportRoster = async (shiftId: string | number) => {
  const response = await apiClient.get(`/api/shifts/${shiftId}/roster/export`, {
    responseType: "blob",
  })
  const filename = getFilenameFromDisposition(
    response.headers["content-disposition"],
    `roster-shift-${shiftId}.csv`
  )
  downloadBlob(response.data, filename)
}
