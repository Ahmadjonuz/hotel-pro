export type MaintenanceTask = {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  room_id?: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      housekeeping_staff: {
        Row: {
          id: string
          name: string
          job_position: string
          status: 'available' | 'busy' | 'off' | 'on_break'
          phone: string | null
          email: string | null
          shift_start: string | null
          shift_end: string | null
          days_off: string[] | null
          specialization: string[] | null
          max_daily_tasks: number
          performance_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['housekeeping_staff']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['housekeeping_staff']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      housekeeping_tasks: {
        Row: {
          id: string
          room_number: string
          task_type: 'room_cleaning' | 'deep_cleaning' | 'turndown_service' | 'linen_change' | 'restocking' | 'maintenance_report' | 'inspection' | 'special_request'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to: string | null
          description: string | null
          notes: string | null
          estimated_duration: number | null
          actual_duration: number | null
          scheduled_start: string | null
          scheduled_end: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['housekeeping_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['housekeeping_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      housekeeping_task_history: {
        Row: {
          id: string
          task_id: string
          previous_status: string | null
          new_status: string
          previous_assigned_to: string | null
          new_assigned_to: string | null
          changed_by: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['housekeeping_task_history']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['housekeeping_task_history']['Row'], 'id' | 'created_at'>>
      }
      maintenance_tasks: {
        Row: {
          id: string
          title: string
          description: string
          status: string
          priority: string
          room_id: string | null
          equipment_id: string | null
          assigned_to: string | null
          due_date: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['maintenance_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['maintenance_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 