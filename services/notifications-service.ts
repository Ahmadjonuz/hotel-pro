import { supabase } from "@/lib/supabase"
import { handleSupabaseError } from "@/lib/utils"
import { 
  Notification, 
  NotificationCreate, 
  NotificationFilters, 
  NotificationStats, 
  NotificationUpdate 
} from "@/types/notifications"

export const notificationsService = {
  async getNotifications(filters?: NotificationFilters, limit: number = 50, offset: number = 0) {
    try {
      const { data, error } = await supabase.rpc('get_notifications', {
        p_type: filters?.type,
        p_read: filters?.read,
        p_from_date: filters?.from_date,
        p_to_date: filters?.to_date,
        p_limit: limit,
        p_offset: offset
      })

      if (error) throw error
      return { data: data as Notification[], error: null }
    } catch (error) {
      console.error("Error in getNotifications:", error)
      return handleSupabaseError(error)
    }
  },

  async getStats() {
    try {
      const { data, error } = await supabase.rpc('get_notification_stats')
      if (error) throw error
      return { data: data as NotificationStats, error: null }
    } catch (error) {
      console.error("Error in getNotificationStats:", error)
      return handleSupabaseError(error)
    }
  },

  async markAsRead(notificationIds?: string[]) {
    try {
      const { error } = await supabase.rpc('mark_notifications_as_read', {
        p_notification_ids: notificationIds
      })
      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error("Error in markNotificationsAsRead:", error)
      return handleSupabaseError(error)
    }
  },

  async create(notification: NotificationCreate) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single()

      if (error) throw error
      return { data: data as Notification, error: null }
    } catch (error) {
      console.error("Error in createNotification:", error)
      return handleSupabaseError(error)
    }
  },

  async update(id: string, updates: NotificationUpdate) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: data as Notification, error: null }
    } catch (error) {
      console.error("Error in updateNotification:", error)
      return handleSupabaseError(error)
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error("Error in deleteNotification:", error)
      return handleSupabaseError(error)
    }
  }
} 