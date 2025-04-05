import { supabase, handleSupabaseError, type Booking } from "@/lib/supabase"

export const bookingsService = {
  // Get all bookings
  async getAllBookings(): Promise<{ data: Booking[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, guests(*), rooms(*)")
        .order("check_in", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get booking by ID
  async getBookingById(id: string): Promise<{ data: Booking | null; error: any }> {
    try {
      const { data, error } = await supabase.from("bookings").select("*, guests(*), rooms(*)").eq("id", id).single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get bookings by guest ID
  async getBookingsByGuestId(guestId: string): Promise<{ data: Booking[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, rooms(*)")
        .eq("guest_id", guestId)
        .order("check_in", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get bookings by date range
  async getBookingsByDateRange(startDate: string, endDate: string): Promise<{ data: Booking[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, guests(*), rooms(*)")
        .or(`check_in.gte.${startDate},check_out.lte.${endDate}`)
        .order("check_in")

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Create a new booking
  async createBooking(booking: Omit<Booking, "id" | "created_at">): Promise<{ data: Booking | null; error: any }> {
    try {
      const { data, error } = await supabase.from("bookings").insert([booking]).select().single()

      if (error) throw error

      // Update room status to occupied
      await supabase.from("rooms").update({ status: "occupied" }).eq("id", booking.room_id)

      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update a booking
  async updateBooking(id: string, updates: Partial<Booking>): Promise<{ data: Booking | null; error: any }> {
    try {
      const { data, error } = await supabase.from("bookings").update(updates).eq("id", id).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update booking status
  async updateBookingStatus(id: string, status: string): Promise<{ data: Booking | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id)
        .select("*, rooms(*)")
        .single()

      if (error) throw error

      // Update room status based on booking status
      if (data) {
        let roomStatus = "available"
        if (status === "confirmed" || status === "checked-in") {
          roomStatus = "occupied"
        } else if (status === "checked-out") {
          roomStatus = "cleaning"
        }

        await supabase.from("rooms").update({ status: roomStatus }).eq("id", data.room_id)
      }

      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Delete a booking
  async deleteBooking(id: string): Promise<{ success: boolean; error: any }> {
    try {
      // First get the booking to get the room_id
      const { data: booking, error: fetchError } = await this.getBookingById(id)
      if (fetchError) throw fetchError

      const { error } = await supabase.from("bookings").delete().eq("id", id)

      if (error) throw error

      // Update room status to available if the booking was active
      if (booking && (booking.status === "confirmed" || booking.status === "checked-in")) {
        await supabase.from("rooms").update({ status: "available" }).eq("id", booking.room_id)
      }

      return { success: true, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error), success: false }
    }
  },
}

