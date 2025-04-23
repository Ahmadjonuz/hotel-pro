import { supabase } from "@/lib/supabase"
import { handleSupabaseError } from "@/lib/utils"

export interface RevenueStats {
  total_revenue: number
  daily_revenue: { date: string; amount: number }[]
  monthly_revenue: { month: string; amount: number }[]
  yearly_revenue: { year: string; amount: number }[]
}

export interface OccupancyStats {
  total_rooms: number
  occupied_rooms: number
  available_rooms: number
  occupancy_rate: number
  daily_occupancy: { date: string; rate: number }[]
}

export interface BookingSource {
  source: string
  count: number
  percentage: number
}

export const reportsService = {
  async getRevenueStats(timeframe: "daily" | "monthly" | "yearly") {
    try {
      const { data, error } = await supabase.rpc("get_revenue_stats", { timeframe_param: timeframe })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error in getRevenueStats:", error)
      return handleSupabaseError(error)
    }
  },

  async getOccupancyStats() {
    try {
      const { data, error } = await supabase.rpc("get_occupancy_stats")
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error in getOccupancyStats:", error)
      return handleSupabaseError(error)
    }
  },

  async getBookingSources() {
    try {
      const { data, error } = await supabase.rpc("get_booking_sources")
      if (error) throw error
      
      // Transform the response to match the expected structure
      const sources = data?.sources || []
      return { data: sources, error: null }
    } catch (error) {
      console.error("Error in getBookingSources:", error)
      return handleSupabaseError(error)
    }
  }
} 