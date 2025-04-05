import { supabase, handleSupabaseError, type HousekeepingTask } from "@/lib/supabase"

export const housekeepingService = {
  // Get all tasks
  async getAllTasks(): Promise<{ data: HousekeepingTask[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("housekeeping_tasks")
        .select("*, rooms(*)")
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get task by ID
  async getTaskById(id: string): Promise<{ data: HousekeepingTask | null; error: any }> {
    try {
      const { data, error } = await supabase.from("housekeeping_tasks").select("*, rooms(*)").eq("id", id).single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get tasks by status
  async getTasksByStatus(status: string): Promise<{ data: HousekeepingTask[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("housekeeping_tasks")
        .select("*, rooms(*)")
        .eq("status", status)
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get tasks by assigned staff
  async getTasksByAssignedTo(staffId: string): Promise<{ data: HousekeepingTask[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("housekeeping_tasks")
        .select("*, rooms(*)")
        .eq("assigned_to", staffId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Create a new task
  async createTask(
    task: Omit<HousekeepingTask, "id" | "created_at">,
  ): Promise<{ data: HousekeepingTask | null; error: any }> {
    try {
      const { data, error } = await supabase.from("housekeeping_tasks").insert([task]).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update a task
  async updateTask(
    id: string,
    updates: Partial<HousekeepingTask>,
  ): Promise<{ data: HousekeepingTask | null; error: any }> {
    try {
      const { data, error } = await supabase.from("housekeeping_tasks").update(updates).eq("id", id).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Mark task as complete
  async markTaskComplete(id: string): Promise<{ data: HousekeepingTask | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("housekeeping_tasks")
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

  // Delete a task
  async deleteTask(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("housekeeping_tasks").delete().eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      return { ...handleSupabaseError(error), success: false }
    }
  },
}

