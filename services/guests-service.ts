import { supabase, handleSupabaseError, type Guest } from "@/lib/supabase"

export const guestsService = {
  // Get all guests
  async getAllGuests(): Promise<{ data: Guest[] | null; error: any }> {
    try {
      const { data, error } = await supabase.from("guests").select("*").order("last_name")

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get guest by ID
  async getGuestById(id: string): Promise<{ data: Guest | null; error: any }> {
    try {
      const { data, error } = await supabase.from("guests").select("*").eq("id", id).single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Search guests
  async searchGuests(query: string): Promise<{ data: Guest[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order("last_name")

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Create a new guest
  async createGuest(guest: Omit<Guest, "id" | "created_at">): Promise<{ data: Guest | null; error: any }> {
    try {
      const { data, error } = await supabase.from("guests").insert([guest]).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update a guest
  async updateGuest(id: string, updates: Partial<Guest>): Promise<{ data: Guest | null; error: any }> {
    try {
      const { data, error } = await supabase.from("guests").update(updates).eq("id", id).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update loyalty points
  async updateLoyaltyPoints(id: string, points: number): Promise<{ data: Guest | null; error: any }> {
    try {
      // First get current points
      const { data: guest, error: fetchError } = await this.getGuestById(id)
      if (fetchError) throw fetchError
      if (!guest) throw new Error("Guest not found")

      const newPoints = guest.loyalty_points + points

      return this.updateGuest(id, { loyalty_points: newPoints })
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Delete a guest
  async deleteGuest(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("guests").delete().eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error), success: false }
    }
  },
}

