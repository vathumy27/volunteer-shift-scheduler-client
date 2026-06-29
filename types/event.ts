export type Events = {
  events_id: number
  events_name: string
  duration: number
  volunteer_id: string
  volunteer_role: string
  description?: string | null
  is_available: boolean
  created_at?: string | null
}