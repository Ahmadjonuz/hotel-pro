import { supabase, handleSupabaseError, type Room } from "@/lib/supabase"

export const roomsService = {
  // Get all rooms
  async getAllRooms(): Promise<{ data: Room[] | null; error: any }> {
    try {
      const { data, error } = await supabase.from("rooms").select("*").order("room_number")

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get room by ID
  async getRoomById(id: string): Promise<{ data: Room | null; error: any }> {
    try {
      const { data, error } = await supabase.from("rooms").select("*").eq("id", id).single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get rooms by status
  async getRoomsByStatus(status: string): Promise<{ data: Room[] | null; error: any }> {
    try {
      const { data, error } = await supabase.from("rooms").select("*").eq("status", status).order("room_number")

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Create a new room
  async createRoom(room: Omit<Room, "id" | "created_at">): Promise<{ data: Room | null; error: any }> {
    try {
      const { data, error } = await supabase.from("rooms").insert([room]).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update a room
  async updateRoom(id: string, updates: Partial<Room>): Promise<{ data: Room | null; error: any }> {
    try {
      const { data, error } = await supabase.from("rooms").update(updates).eq("id", id).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update room status
  async updateRoomStatus(id: string, status: string): Promise<{ data: Room | null; error: any }> {
    return this.updateRoom(id, { status })
  },

  // Delete a room
  async deleteRoom(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error), success: false }
    }
  },
}

