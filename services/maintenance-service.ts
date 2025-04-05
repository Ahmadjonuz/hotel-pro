import { supabase, handleSupabaseError, type MaintenanceRequest } from "@/lib/supabase"

export const maintenanceService = {
  // Get all maintenance requests
  async getAllRequests(): Promise<{ data: MaintenanceRequest[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*, rooms(*)")
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get request by ID
  async getRequestById(id: string): Promise<{ data: MaintenanceRequest | null; error: any }> {
    try {
      const { data, error } = await supabase.from("maintenance_requests").select("*, rooms(*)").eq("id", id).single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get requests by status
  async getRequestsByStatus(status: string): Promise<{ data: MaintenanceRequest[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*, rooms(*)")
        .eq("status", status)
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get requests by priority
  async getRequestsByPriority(priority: string): Promise<{ data: MaintenanceRequest[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*, rooms(*)")
        .eq("priority", priority)
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Create a new request
  async createRequest(
    request: Omit<MaintenanceRequest, "id" | "created_at">,
  ): Promise<{ data: MaintenanceRequest | null; error: any }> {
    try {
      const { data, error } = await supabase.from("maintenance_requests").insert([request]).select().single()

      if (error) throw error

      // If high priority, update room status to maintenance
      if (request.priority === "high") {
        await supabase.from("rooms").update({ status: "maintenance" }).eq("id", request.room_id)
      }

      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update a request
  async updateRequest(
    id: string,
    updates: Partial<MaintenanceRequest>,
  ): Promise<{ data: MaintenanceRequest | null; error: any }> {
    try {
      const { data, error } = await supabase.from("maintenance_requests").update(updates).eq("id", id).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Mark request as complete
  async markRequestComplete(id: string): Promise<{ data: MaintenanceRequest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .update({ status: "completed" })
        .eq("id", id)
        .select("*, rooms(*)")
        .single()

      if (error) throw error

      // Update room status to available
      if (data) {
        await supabase.from("rooms").update({ status: "available" }).eq("id", data.room_id)
      }

      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Delete a request
  async deleteRequest(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("maintenance_requests").delete().eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error), success: false }
    }
  },
}

