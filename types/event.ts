import { Shift } from "./shift"

export type Event = {
  id: number
  title: string
  description?: string | null
  location?: string | null
  created_by: number
  created_at?: string | null
  shifts?: Shift[]
}

export type CreateEventPayload = {
  title: string
  description?: string
  location?: string
}

export type UpdateEventPayload = Partial<CreateEventPayload>
