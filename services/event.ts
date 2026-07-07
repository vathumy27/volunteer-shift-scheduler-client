import apiClient from "@/lib/api-client"
import { CreateEventPayload, Event, UpdateEventPayload } from "@/types/event"

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
