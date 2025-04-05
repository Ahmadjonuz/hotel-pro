"use client"

import { useState } from "react"
import { Bell, Check, Clock, Info, MessageSquare, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

// Sample notification data
const sampleNotifications = [
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

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(sampleNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-rose-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Bildirishnomalar</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={markAllAsRead}
            >
              Barchasini o'qilgan deb belgilash
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-3 cursor-default ${!notification.read ? "bg-muted/50" : ""}`}
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex w-full justify-between">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">{notification.message}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{notification.time}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                          <span className="sr-only">O'qilgan deb belgilash</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">O'chirish</span>
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">Bildirishnomalar yo'q</div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer justify-center">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <a href="/notifications">Barcha bildirishnomalarni ko'rish</a>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

