"use client"

import { useEffect, useState } from "react"
import { Bell, Check, Clock, Filter, Info, MessageSquare, Search, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { uz } from "date-fns/locale/uz"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { notificationsService } from "@/services/notifications-service"
import { Notification, NotificationStats, NotificationType } from "@/types/notifications"
import { toast } from "@/components/ui/use-toast"

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [filter, setFilter] = useState<NotificationType | "all">("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadNotifications()
      loadStats()
    }
  }, [user])

  const loadNotifications = async () => {
    setLoading(true)
    const { data, error } = await notificationsService.getNotifications(
      filter !== "all" ? { type: filter } : undefined
    )
    if (error) {
      toast({
        title: "Xatolik",
        description: "Bildirishnomalarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } else if (data) {
      setNotifications(data)
    }
    setLoading(false)
  }

  const loadStats = async () => {
    const { data, error } = await notificationsService.getStats()
    if (error) {
      toast({
        title: "Xatolik",
        description: "Statistikani yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } else if (data) {
      setStats(data)
    }
  }

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [filter])

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "booking":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "reminder":
        return <Bell className="h-4 w-4 text-amber-500" />
      case "maintenance":
        return <Info className="h-4 w-4 text-red-500" />
      case "payment":
        return <Check className="h-4 w-4 text-green-500" />
      case "housekeeping":
        return <Check className="h-4 w-4 text-purple-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationTypeLabel = (type: NotificationType) => {
    switch (type) {
      case "booking":
        return "Bron"
      case "reminder":
        return "Eslatma"
      case "maintenance":
        return "Texnik xizmat"
      case "payment":
        return "To'lov"
      case "housekeeping":
        return "Tozalash"
      case "system":
        return "Tizim"
      default:
        return type
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (search && !notification.title.toLowerCase().includes(search.toLowerCase()) && 
        !notification.message.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const markAllAsRead = async () => {
    const { error } = await notificationsService.markAsRead()
    if (error) {
      toast({
        title: "Xatolik",
        description: "Barcha bildirishnomalarni o'qilgan deb belgilashda xatolik yuz berdi",
        variant: "destructive",
      })
      return
    }
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    loadStats()
  }

  const markAsRead = async (id: string) => {
    const { error } = await notificationsService.markAsRead([id])
    if (error) {
      toast({
        title: "Xatolik",
        description: "Bildirishnomani o'qilgan deb belgilashda xatolik yuz berdi",
        variant: "destructive",
      })
      return
    }
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    loadStats()
  }

  const deleteNotification = async (id: string) => {
    const { error } = await notificationsService.delete(id)
    if (error) {
      toast({
        title: "Xatolik",
        description: "Bildirishnomani o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
      return
    }
    setNotifications(notifications.filter((n) => n.id !== id))
    loadStats()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
          >
            <X className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bildirishnomalar</h1>
            <p className="text-muted-foreground">
              Barcha bildirishnomalarni ko'rish va boshqarish
            </p>
          </div>
        </div>
        <Button onClick={markAllAsRead} variant="outline">
          Barchasini o'qilgan deb belgilash
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">O'qilmagan</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unread || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrlash</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Bildirishnoma sarlavhasi yoki matni bo'yicha qidirish..."
                className="pl-8 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(value: NotificationType | "all") => setFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Turi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="booking">Bronlar</SelectItem>
                  <SelectItem value="reminder">Eslatmalar</SelectItem>
                  <SelectItem value="maintenance">Texnik xizmat</SelectItem>
                  <SelectItem value="payment">To'lovlar</SelectItem>
                  <SelectItem value="housekeeping">Tozalash</SelectItem>
                  <SelectItem value="system">Tizim</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setSearch("")
                  setFilter("all")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Yuklanmoqda...
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start justify-between p-4 ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{notification.title}</span>
                        <Badge variant="secondary" className="font-normal">
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: uz })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">O'qilgan deb belgilash</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">O'chirish</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Bildirishnomalar topilmadi
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 