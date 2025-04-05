"use client"

import { useState } from "react"
import { Bell, Check, Clock, Filter, Info, MessageSquare, Search, X } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Import sample notifications from the notifications component
const initialNotifications = [
  {
    id: "1",
    title: "Yangi bron",
    message: "John Smith 101-xonani 15-18 aprel kunlariga band qildi",
    time: "10 daqiqa oldin",
    read: false,
    type: "booking",
  },
  {
    id: "2",
    title: "Ro'yxatdan o'tish eslatmasi",
    message: "Sarah Johnson bugun soat 14:00 da ro'yxatdan o'tadi",
    time: "1 soat oldin",
    read: false,
    type: "reminder",
  },
  {
    id: "3",
    title: "Texnik xizmat murojaati",
    message: "205-xonada konditsioner bilan muammo mavjud",
    time: "3 soat oldin",
    read: true,
    type: "maintenance",
  },
  {
    id: "4",
    title: "To'lov qabul qilindi",
    message: "#B-1001 bron uchun $349.99 to'lov qabul qilindi",
    time: "5 soat oldin",
    read: true,
    type: "payment",
  },
  {
    id: "5",
    title: "Tozalash yangilanishi",
    message: "310-xona tozalandi va tayyor",
    time: "Kecha",
    read: true,
    type: "housekeeping",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const getNotificationIcon = (type: string) => {
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

  const getNotificationTypeLabel = (type: string) => {
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
      default:
        return type
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter !== "all" && notification.type !== filter) return false
    if (search && !notification.title.toLowerCase().includes(search.toLowerCase()) && 
        !notification.message.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bildirishnomalar</h1>
          <p className="text-muted-foreground">
            Barcha bildirishnomalarni ko'rish va boshqarish
          </p>
        </div>
        <Button onClick={markAllAsRead} variant="outline">
          Barchasini o'qilgan deb belgilash
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrlash</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Qidirish..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                <SelectItem value="booking">Bronlar</SelectItem>
                <SelectItem value="reminder">Eslatmalar</SelectItem>
                <SelectItem value="maintenance">Texnik xizmat</SelectItem>
                <SelectItem value="payment">To'lovlar</SelectItem>
                <SelectItem value="housekeeping">Tozalash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
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
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
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
            ))}
            {filteredNotifications.length === 0 && (
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