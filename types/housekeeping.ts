export type TaskType = 
  | 'room_cleaning'
  | 'deep_cleaning'
  | 'turndown_service'
  | 'linen_change'
  | 'restocking'
  | 'maintenance_report'
  | 'inspection'
  | 'special_request'

export type RoomStatus = 
  | 'clean'
  | 'dirty'
  | 'cleaning_in_progress'
  | 'out_of_order'
  | 'inspection_needed'
  | 'do_not_disturb'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type StaffStatus = 'available' | 'busy' | 'off' | 'on_break'

export interface HousekeepingStaff {
  id: string
  name: string
  job_position: string
  status: StaffStatus
  max_daily_tasks: number
  phone?: string
  email?: string
  shift_start?: string
  shift_end?: string
  days_off?: string[]
  specialization?: string[]
  performance_rating?: number
  created_at: string
  updated_at: string
}

export interface HousekeepingTask {
  id: string
  room_number: string
  task_type: TaskType
  status: TaskStatus
  priority: TaskPriority
  assigned_to?: string
  description?: string
  notes?: string
  estimated_duration?: number // in minutes
  actual_duration?: number // in minutes
  scheduled_start?: string
  scheduled_end?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  // Joined fields
  assigned_to_staff?: HousekeepingStaff
}

export interface TaskHistory {
  id: string
  task_id: string
  previous_status?: TaskStatus
  new_status: TaskStatus
  previous_assigned_to?: string
  new_assigned_to?: string
  changed_by: string
  notes?: string
  created_at: string
  // Joined fields
  previous_staff?: Pick<HousekeepingStaff, 'id' | 'name'>
  new_staff?: Pick<HousekeepingStaff, 'id' | 'name'>
  user?: {
    id: string
    email: string
  }
}

export interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  cancelled: number
}

export interface StaffHistory {
  staff: HousekeepingStaff
  tasks: Array<HousekeepingTask & { history?: TaskHistory[] }>
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: {
    message: string
    code?: string
  } | null
}

export interface StaffResponse extends ApiResponse<HousekeepingStaff[]> {}
export interface TaskResponse extends ApiResponse<HousekeepingTask[]> {}
export interface StaffHistoryResponse extends ApiResponse<StaffHistory> {}
export interface TaskStatsResponse extends ApiResponse<TaskStats> {} 