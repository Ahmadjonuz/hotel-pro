import { supabase, handleSupabaseError } from "@/lib/supabase"

export interface Room {
  id: string
  room_number: string
  type: string
  status: string
  price_per_night: number
  capacity: number
  amenities: string[]
  description: string | null
  created_at: string
}

export const roomsService = {
  // Get all rooms
  async getAllRooms(): Promise<{ data: Room[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number")

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error) }
    }
  },

  // Get available rooms
  async getAvailableRooms(checkIn: string, checkOut: string): Promise<{ data: Room[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "available")
        .not("id", "in", 
          supabase
            .from("bookings")
            .select("room_id")
            .or(`check_in.gte.${checkIn},check_out.lte.${checkOut}`)
            .not("status", "eq", "cancelled")
        )
        .order("room_number")

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error) }
    }
  },

  // Get room by ID
  async getRoomById(id: string): Promise<{ data: Room | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error) }
    }
  },

  // Get rooms by status
  async getRoomsByStatus(status: string): Promise<{ data: Room[] | null; error: any }> {
    try {
      const { data, error } = await supabase.from("rooms").select("*").eq("status", status).order("room_number")

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error) }
    }
  },

  // Create a new room
  async createRoom(room: Omit<Room, "id" | "created_at">): Promise<{ data: Room | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert([room])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error) }
    }
  },

  // Update a room
  async updateRoom(id: string, updates: Partial<Room>): Promise<{ data: Room | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error) }
    }
  },

  // Update room status
  async updateRoomStatus(id: string, status: string): Promise<{ data: Room | null; error: any }> {
    return this.updateRoom(id, { status })
  },

  // Delete a room
  async deleteRoom(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error), success: false }
    }
  },

  // Get detailed information about a room
  async getRoomDetails(id: string): Promise<{ data: any | null; error: any }> {
    try {
      // Get room information
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .single()

      if (roomError) throw roomError

      // Get room's bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          guest_id,
          check_in,
          check_out,
          status,
          total_amount,
          payment_status,
          special_requests,
          guests (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq("room_id", id)
        .order("check_in", { ascending: false })

      if (bookingsError) throw bookingsError

      // Get room's maintenance requests
      const { data: maintenanceRequests, error: maintenanceError } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("room_id", id)
        .order("created_at", { ascending: false })

      if (maintenanceError) throw maintenanceError

      // Get room's housekeeping tasks
      const { data: housekeepingTasks, error: housekeepingError } = await supabase
        .from("housekeeping_tasks")
        .select("*")
        .eq("room_id", id)
        .order("scheduled_date", { ascending: false })

      if (housekeepingError) throw housekeepingError

      return {
        data: {
          ...room,
          bookings,
          maintenance_requests: maintenanceRequests,
          housekeeping_tasks: housekeepingTasks
        },
        error: null
      }
    } catch (error) {
      return { ...handleSupabaseError(error) }
    }
  },
}

