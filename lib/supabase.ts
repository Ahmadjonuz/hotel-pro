import { createClient } from "@supabase/supabase-js"
import { handleSupabaseError } from "./utils"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

// Singleton pattern for Supabase clients
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-application-name': 'hotelpro'
        }
      }
    })
  }
  return supabaseInstance
})()

export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      },
      global: {
        headers: {
          'x-application-name': 'hotelpro-admin'
        }
      }
    })
  }
  return supabaseAdminInstance
})()

// Types for our database tables
export type Room = {
  id: string
  room_number: string
  type: string
  status: string
  price_per_night: number
  capacity: number
  amenities: string[]
  description: string
  created_at?: string
}

export type Guest = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  is_vip: boolean
  loyalty_points: number
  notes: string
  created_at?: string
}

export type Booking = {
  id: string
  guest_id: string
  room_id: string
  check_in: string
  check_out: string
  status: string
  total_amount: number
  payment_status: string
  special_requests?: string | null
  created_at?: string
}

export type HousekeepingTask = {
  id: string
  room_id: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  assigned_to: string | null
  notes: string
  scheduled_date: string
  completed_at?: string | null
  created_at?: string
  updated_at?: string
  rooms?: {
    id: string
    type: string
    room_number: string
  }
}

export type MaintenanceRequest = {
  id: string
  room_id: string
  issue: string
  status: string
  priority: string
  reported_by: string
  assigned_to: string
  notes: string
  created_at?: string
}

export { handleSupabaseError }

