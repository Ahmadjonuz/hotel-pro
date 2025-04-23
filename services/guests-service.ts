import { supabase } from "@/lib/supabase"

export interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: string | null
  document_type: string | null
  document_number: string | null
  is_vip: boolean
  loyalty_points: number
  notes: string | null
  created_at: string
}

// Simple helper for error handling
function createErrorResponse(message: string, details: any = null) {
  return {
    success: false,
    error: { message, details }
  };
}

export const guestsService = {
  // Get all guests
  async getAllGuests(sortBy?: string, sortDirection: "asc" | "desc" = "asc"): Promise<{ data: Guest[] | null; error: any }> {
    try {
      let query = supabase
        .from("guests")
        .select("*")

      // Apply sorting if specified
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortDirection === "asc" })
      } else {
        // Default sorting by last_name if no sort specified
        query = query.order("last_name")
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error in getAllGuests:", error);
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Mehmonlarni yuklashda xatolik", 
          details: error 
        } 
      };
    }
  },

  // Get guest by ID
  async getGuestById(id: string): Promise<{ data: Guest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error in getGuestById:", error);
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Mehmon ma'lumotlarini yuklashda xatolik", 
          details: error 
        } 
      };
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
      console.error("Error in searchGuests:", error);
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Mehmonlarni qidirishda xatolik", 
          details: error 
        } 
      };
    }
  },

  // Create a new guest
  async createGuest(guest: Omit<Guest, "id" | "created_at">): Promise<{ data: Guest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("guests")
        .insert([{
          ...guest,
          is_vip: guest.is_vip || false,
          loyalty_points: guest.loyalty_points || 0,
        }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error in createGuest:", error);
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Mehmon yaratishda xatolik", 
          details: error 
        } 
      };
    }
  },

  // Update a guest
  async updateGuest(id: string, updates: Partial<Guest>): Promise<{ data: Guest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("guests")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error in updateGuest:", error);
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Mehmon ma'lumotlarini yangilashda xatolik", 
          details: error 
        } 
      };
    }
  },

  // Delete a guest
  async deleteGuest(id: string): Promise<{ success: boolean; error: any }> {
    try {
      // First check if guest has any related bookings
      const bookingsResponse = await supabase
        .from("bookings")
        .select("id")
        .eq("guest_id", id);
        
      if (bookingsResponse.error) {
        console.error("Error checking bookings:", bookingsResponse.error);
        return createErrorResponse("Mehmon bronlarini tekshirishda xatolik", bookingsResponse.error);
      }
      
      // Delete any related bookings first
      if (bookingsResponse.data && bookingsResponse.data.length > 0) {
        const deleteBookingsResponse = await supabase
          .from("bookings")
          .delete()
          .eq("guest_id", id);
          
        if (deleteBookingsResponse.error) {
          console.error("Error deleting bookings:", deleteBookingsResponse.error);
          return createErrorResponse("Mehmon bronlarini o'chirishda xatolik", deleteBookingsResponse.error);
        }
      }
      
      // Now delete the guest
      const deleteGuestResponse = await supabase
        .from("guests")
        .delete()
        .eq("id", id);
        
      if (deleteGuestResponse.error) {
        console.error("Error deleting guest:", deleteGuestResponse.error);
        return createErrorResponse("Mehmonni o'chirishda xatolik", deleteGuestResponse.error);
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Unexpected error in deleteGuest:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Mehmonni o'chirishda kutilmagan xatolik",
        error
      );
    }
  }
}

