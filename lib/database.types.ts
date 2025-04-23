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
      user_profiles: {
        Row: {
          id: string
          role: 'admin' | 'manager' | 'receptionist'
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'manager' | 'receptionist'
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'manager' | 'receptionist'
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role: 'admin' | 'manager' | 'receptionist'
          resource: string
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          role: 'admin' | 'manager' | 'receptionist'
          resource: string
          action: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'manager' | 'receptionist'
          resource?: string
          action?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_permission: {
        Args: {
          resource: string
          action: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'receptionist'
    }
  }
} 