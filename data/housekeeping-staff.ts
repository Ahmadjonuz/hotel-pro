import type { StaffStatus } from "@/types/housekeeping"

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

export const housekeepingStaff: HousekeepingStaff[] = [
  {
    id: "1",
    name: "Aziza Karimova",
    job_position: "Senior Housekeeper",
    status: "available",
    max_daily_tasks: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2", 
    name: "Dilshod Umarov",
    job_position: "Housekeeper",
    status: "busy",
    max_daily_tasks: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Nodira Saidova",
    job_position: "Housekeeper",
    status: "available",
    max_daily_tasks: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "4",
    name: "Jamshid Alimov",
    job_position: "Housekeeper",
    status: "off",
    max_daily_tasks: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
] 