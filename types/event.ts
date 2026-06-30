export type Event = {
  id: number
  event_name: string
  volunteers_needed: number
  duration_hours: number
  description?: string | null
  is_available: boolean
  created_at?: string | null
}
