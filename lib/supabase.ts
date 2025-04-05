import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Key length:", supabaseAnonKey.length)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  if (error instanceof Error) {
    return { error: error.message }
  }
  return { error: "An unexpected error occurred" }
}

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
  special_requests: string
  created_at?: string
}

export type HousekeepingTask = {
  id: string
  room_id: string
  status: string
  priority: string
  assigned_to: string
  notes: string
  created_at?: string
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

