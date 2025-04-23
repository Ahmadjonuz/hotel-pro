import { supabase, supabaseAdmin } from "@/lib/supabase"
import { handleSupabaseError } from "@/lib/utils"

export type UserRole = "admin" | "manager" | "receptionist"

export interface UserProfile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  role: UserRole
  resource: string
  action: string
  created_at: string
}

export const userService = {
  async createUser(email: string, password: string, profile: Omit<UserProfile, "id" | "created_at" | "updated_at">) {
    try {
      // Check if current user is admin
      const { data: isAdmin, error: adminCheckError } = await this.isCurrentUserAdmin()
      if (adminCheckError) {
        return { error: handleSupabaseError(adminCheckError) }
      }
      if (!isAdmin) {
        return { 
          error: { 
            message: "Faqat administrator yangi foydalanuvchi qo'sha oladi", 
            code: "PERMISSION_DENIED" 
          } 
        }
      }

      // Create auth user with admin client
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: profile.role }
      })

      if (authError) {
        console.error("Error creating auth user:", authError)
        return { error: handleSupabaseError(authError) }
      }

      // Create user profile with admin client
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .insert([{ 
          ...profile, 
          id: authData.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        // Clean up auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return { error: handleSupabaseError(profileError) }
      }

      return { data: { auth: authData.user, profile: profileData }, error: null }
    } catch (error) {
      console.error("Error in createUser:", error)
      return { error: handleSupabaseError(error) }
    }
  },

  async updateUserProfile(userId: string, profile: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>) {
    try {
      const { data, error } = await supabaseAdmin
        .from("user_profiles")
        .update(profile)
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        console.error("Error updating user profile:", error)
        return { error: handleSupabaseError(error) }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error in updateUserProfile:", error)
      return { error: handleSupabaseError(error) }
    }
  },

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return { error: handleSupabaseError(error) }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error in getUserProfile:", error)
      return { error: handleSupabaseError(error) }
    }
  },

  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching users:", error)
        return { error: handleSupabaseError(error) }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error in getAllUsers:", error)
      return { error: handleSupabaseError(error) }
    }
  },

  async deleteUser(userId: string) {
    try {
      // Get current user's role
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { 
          error: { 
            message: "Tizimga kirmagansiz", 
            code: "NOT_AUTHENTICATED" 
          } 
        }
      }

      // Get current user's profile to check role
      const { data: currentUserProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Error fetching user role:", profileError)
        return { error: handleSupabaseError(profileError) }
      }

      // Get target user's profile (user being deleted)
      const { data: targetUserProfile, error: targetProfileError } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .single()

      if (targetProfileError) {
        console.error("Error fetching target user role:", targetProfileError)
        return { error: handleSupabaseError(targetProfileError) }
      }

      // Check deletion permissions based on roles
      const currentUserRole = currentUserProfile.role
      const targetUserRole = targetUserProfile.role

      // Admin can delete anyone
      if (currentUserRole === 'admin') {
        // Admin can proceed with deletion
      }
      // Manager can only delete receptionists
      else if (currentUserRole === 'manager') {
        if (targetUserRole !== 'receptionist') {
          return { 
            error: { 
              message: "Menejer faqat qabul xodimlarini o'chira oladi", 
              code: "PERMISSION_DENIED" 
            } 
          }
        }
      }
      // Receptionists cannot delete anyone
      else {
        return { 
          error: { 
            message: "Qabul xodimi foydalanuvchilarni o'chira olmaydi", 
            code: "PERMISSION_DENIED" 
          } 
        }
      }

      // First check if user has any bookings
      const { data: bookings, error: bookingCheckError } = await supabase
        .from('bookings')
        .select('id')
        .eq('guest_id', userId);
        
      if (bookingCheckError) {
        console.error("Error checking bookings:", bookingCheckError);
        return { error: { message: "Foydalanuvchi ma'lumotlarini tekshirishda xatolik", code: "DATA_CHECK_ERROR" } };
      }
      
      // Delete each booking individually to avoid potential constraint issues
      if (bookings && bookings.length > 0) {
        for (const booking of bookings) {
          const { error: deleteBookingError } = await supabaseAdmin
            .from('bookings')
            .delete()
            .eq('id', booking.id);
            
          if (deleteBookingError) {
            console.error("Error deleting booking:", deleteBookingError);
            return { error: { message: "Foydalanuvchiga tegishli bronlarni o'chirishda xatolik", code: "BOOKING_DELETE_FAILED" } };
          }
        }
      }
      
      // Check for any other database references to this user
      // First delete user profile from user_profiles table
      const { error: profileDeleteError } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', userId);
        
      if (profileDeleteError) {
        console.error("Error deleting user profile:", profileDeleteError);
        return { error: { message: "Foydalanuvchi profilini o'chirishda xatolik", code: "PROFILE_DELETE_FAILED" } };
      }

      // Now delete the auth user
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authError) {
        console.error("Error deleting auth user:", authError);
        // Try to restore the profile since auth deletion failed
        try {
          await supabaseAdmin
            .from('user_profiles')
            .insert([{ id: userId, ...targetUserProfile }]);
        } catch (restoreError) {
          console.error("Failed to restore user profile after auth deletion error:", restoreError);
        }
        
        return { error: { 
          message: "Foydalanuvchini o'chirishda xatolik yuz berdi: " + authError.message, 
          code: "AUTH_DELETE_FAILED" 
        }};
      }

      return { error: null }
    } catch (error) {
      console.error("Error in deleteUser:", error)
      return { error: { 
        message: "Foydalanuvchini o'chirishda kutilmagan xatolik yuz berdi", 
        code: "UNEXPECTED_ERROR",
        details: error instanceof Error ? error.message : String(error)
      }}
    }
  },

  async getUserPermissions(userId: string) {
    try {
      // First get user's role
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.error("Error fetching user role:", profileError)
        return { error: handleSupabaseError(profileError) }
      }

      // Then get permissions for that role
      const { data: permissions, error: permError } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role", profile.role)

      if (permError) {
        console.error("Error fetching role permissions:", permError)
        return { error: handleSupabaseError(permError) }
      }

      return { data: permissions, error: null }
    } catch (error) {
      console.error("Error in getUserPermissions:", error)
      return { error: handleSupabaseError(error) }
    }
  },

  async checkPermission(userId: string, resource: string, action: string) {
    try {
      const { data, error } = await supabase
        .rpc("check_user_permission", { resource, action })

      if (error) {
        console.error("Error checking permission:", error)
        return { error: handleSupabaseError(error) }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error in checkPermission:", error)
      return { error: handleSupabaseError(error) }
    }
  },

  async isCurrentUserAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: false, error: null }

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching user role:", error)
        return { error: handleSupabaseError(error) }
      }

      return { data: profile.role === "admin", error: null }
    } catch (error) {
      console.error("Error in isCurrentUserAdmin:", error)
      return { error: handleSupabaseError(error) }
    }
  }
} 