import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"
import type { HousekeepingTask, HousekeepingStaff, TaskStats } from "@/types/housekeeping"

type DbTask = Database['public']['Tables']['housekeeping_tasks']['Row']
type DbStaff = Database['public']['Tables']['housekeeping_staff']['Row']

export const housekeepingService = {
  // Staff related functions
  async getStaff() {
    try {
      const { data, error } = await supabase
        .from('housekeeping_staff')
        .select('*')
        .order('name')
      
      if (error) {
        return { data: null, error }
      }
      
      return { data, error: null }
    } catch (error) {
      return { 
        data: null, 
        error: { message: error instanceof Error ? error.message : "Failed to fetch staff" } 
      }
    }
  },

  async createStaff(staff: Omit<HousekeepingStaff, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('housekeeping_staff')
        .insert(staff)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : "Failed to create staff member" }
      }
    }
  },

  async updateStaff(id: string, updates: Partial<HousekeepingStaff>) {
    try {
      const { data, error } = await supabase
        .from('housekeeping_staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : "Failed to update staff member" }
      }
    }
  },

  // Task related functions
  async getTasks() {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select(`
          *,
          assigned_to_staff:housekeeping_staff!assigned_to (
            id,
            name,
            status
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : "Failed to fetch tasks" }
      }
    }
  },

  async createTask(task: Omit<HousekeepingTask, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .insert(task)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : "Failed to create task" }
      }
    }
  },

  async updateTask(id: string, updates: Partial<HousekeepingTask>) {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : "Failed to update task" }
      }
    }
  },

  async deleteTask(id: string) {
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .delete()
        .eq('id', id)

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return {
        error: { message: error instanceof Error ? error.message : "Failed to delete task" }
      }
    }
  },

  // Task history
  async getTaskHistory(taskId: string) {
    try {
      const { data, error } = await supabase
        .from('housekeeping_task_history')
        .select(`
          *,
          previous_staff:housekeeping_staff!previous_assigned_to (
            id,
            name
          ),
          new_staff:housekeeping_staff!new_assigned_to (
            id,
            name
          ),
          user:auth.users!changed_by (
            id,
            email
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : "Failed to fetch task history" }
      }
    }
  },

  // Utility functions
  calculateTaskStats(tasks: HousekeepingTask[]): TaskStats {
    return tasks.reduce((stats, task) => ({
      total: stats.total + 1,
      pending: stats.pending + (task.status === 'pending' ? 1 : 0),
      inProgress: stats.inProgress + (task.status === 'in_progress' ? 1 : 0),
      completed: stats.completed + (task.status === 'completed' ? 1 : 0),
      cancelled: stats.cancelled + (task.status === 'cancelled' ? 1 : 0)
    }), {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0
    })
  },

  async getStaffTasks(staffId: string) {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .eq('assigned_to', staffId)
        .order('scheduled_start', { ascending: true })

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : "Failed to fetch staff tasks" }
      }
    }
  },

  async getStaffTaskHistory(staffId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('housekeeping_tasks')
      .select('*')
      .eq('assigned_to', staffId)
      .gte('scheduled_start', startDate)
      .lte('scheduled_start', endDate)
      .order('scheduled_start', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  }
}

