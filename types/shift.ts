import { AuthUser } from "@/providers/auth-provider"

export type Shift = {
  id: number
  event_id: number
  shift_date: string
  start_time: string
  end_time: string
  capacity: number
  role_description?: string | null
  spots_taken: number
  is_full: boolean
  duration_hours: number
  created_at?: string | null
  event?: {
    id: number
    title: string
    location?: string | null
  }
}

export type Signup = {
  id: number
  shift_id: number
  user_id: number
  status: "confirmed" | "waitlisted" | "cancelled"
  signed_up_at?: string | null
  cancelled_at?: string | null
  shift?: Shift
  user?: AuthUser
}

export type RosterEntry = Signup & {
  user: AuthUser
}

export type CreateShiftPayload = {
  shift_date: string
  start_time: string
  end_time: string
  capacity: number
  role_description?: string
}

export type UpdateShiftPayload = Partial<CreateShiftPayload>

export type MyShiftsResponse = {
  upcoming: Signup[]
  past: Signup[]
}
