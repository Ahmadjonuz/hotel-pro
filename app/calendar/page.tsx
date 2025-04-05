"use client"

import { useState } from "react"
import {
  format,
  startOfToday,
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Namuna bron ma'lumotlari
const bookings = [
  {
    id: "B-1001",
    guestName: "John Smith",
    roomNumber: "101",
    checkIn: new Date(2023, 3, 15),
    checkOut: new Date(2023, 3, 18),
    status: "checked-in",
  },
  {
    id: "B-1002",
    guestName: "Sarah Johnson",
    roomNumber: "205",
    checkIn: new Date(2023, 3, 16),
    checkOut: new Date(2023, 3, 20),
    status: "confirmed",
  },
  {
    id: "B-1003",
    guestName: "Michael Brown",
    roomNumber: "310",
    checkIn: new Date(2023, 3, 10),
    checkOut: new Date(2023, 3, 15),
    status: "checked-out",
  },
  {
    id: "B-1004",
    guestName: "Emily Davis",
    roomNumber: "402",
    checkIn: new Date(2023, 3, 18),
    checkOut: new Date(2023, 3, 22),
    status: "confirmed",
  },
  {
    id: "B-1005",
    guestName: "Robert Wilson",
    roomNumber: "115",
    checkIn: new Date(2023, 3, 12),
    checkOut: new Date(2023, 3, 14),
    status: "cancelled",
  },
]

export default function CalendarPage() {
  const today = startOfToday()
  const [currentMonth, setCurrentMonth] = useState(today)
  const [selectedDay, setSelectedDay] = useState(today)

  const firstDayOfMonth = startOfMonth(currentMonth)
  const lastDayOfMonth = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth })

  const previousMonth = () => {
    const firstDayOfPreviousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    setCurrentMonth(firstDayOfPreviousMonth)
  }

  const nextMonth = () => {
    const firstDayOfNextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    setCurrentMonth(firstDayOfNextMonth)
  }

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(
      (booking) =>
        isSameDay(booking.checkIn, day) ||
        isSameDay(booking.checkOut, day) ||
        (booking.checkIn < day && booking.checkOut > day),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-amber-500"
      case "checked-in":
        return "bg-green-500"
      case "checked-out":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex-1">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Bronlash taqvimi</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(today)}>
              Bugun
            </Button>
            <Button variant="default" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Yangi bron
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Select defaultValue="month">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Ko'rinish" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Kun</SelectItem>
                    <SelectItem value="week">Hafta</SelectItem>
                    <SelectItem value="month">Oy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="grid grid-cols-7 border-b">
                {["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"].map((day) => (
                  <div key={day} className="py-2 text-center text-sm font-medium">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-fr">
                {Array.from({ length: firstDayOfMonth.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="border-b border-r p-2 h-24 md:h-32" />
                ))}
                {daysInMonth.map((day) => {
                  const dayBookings = getBookingsForDay(day)
                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "border-b border-r p-2 h-24 md:h-32 relative",
                        !isSameMonth(day, currentMonth) && "bg-muted/50",
                        isSameDay(day, selectedDay) && "bg-muted",
                        "hover:bg-muted/50 cursor-pointer",
                      )}
                      onClick={() => setSelectedDay(day)}
                    >
                      <div
                        className={cn(
                          "h-7 w-7 flex items-center justify-center rounded-full text-sm",
                          isToday(day) && "bg-rose-600 text-white font-medium",
                        )}
                      >
                        {format(day, "d")}
                      </div>
                      <ScrollArea className="h-[calc(100%-28px)] mt-1">
                        <div className="space-y-1">
                          {dayBookings.map((booking) => (
                            <TooltipProvider key={booking.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-xs p-1 rounded bg-muted/80">
                                    <div className={cn("h-2 w-2 rounded-full", getStatusColor(booking.status))} />
                                    <span className="truncate">{booking.guestName}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-sm">
                                    <p className="font-medium">{booking.guestName}</p>
                                    <p>{booking.roomNumber}-xona</p>
                                    <p>
                                      {format(booking.checkIn, "d MMM")} - {format(booking.checkOut, "d MMM")}
                                    </p>
                                    <p>
                                      {booking.status === "confirmed" && "Tasdiqlangan"}
                                      {booking.status === "checked-in" && "Joylashgan"}
                                      {booking.status === "checked-out" && "Chiqib ketgan"}
                                      {booking.status === "cancelled" && "Bekor qilingan"}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tanlangan kun</CardTitle>
              <CardDescription>{format(selectedDay, "d MMMM yyyy")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Bronlar</h3>
                  {getBookingsForDay(selectedDay).length > 0 ? (
                    <div className="space-y-2">
                      {getBookingsForDay(selectedDay).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-2 rounded bg-muted">
                          <div>
                            <p className="font-medium">{booking.guestName}</p>
                            <p className="text-sm text-muted-foreground">{booking.roomNumber}-xona</p>
                          </div>
                          <div className="text-sm text-right">
                            <p>
                              {format(booking.checkIn, "d MMM")} - {format(booking.checkOut, "d MMM")}
                            </p>
                            <p className="text-muted-foreground">
                              {booking.status === "confirmed" && "Tasdiqlangan"}
                              {booking.status === "checked-in" && "Joylashgan"}
                              {booking.status === "checked-out" && "Chiqib ketgan"}
                              {booking.status === "cancelled" && "Bekor qilingan"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Bu kunga bronlar yo'q</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Statistika</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-2 rounded bg-muted">
                      <p className="text-sm text-muted-foreground">Kelishlar</p>
                      <p className="text-2xl font-bold">
                        {bookings.filter((b) => isSameDay(b.checkIn, selectedDay)).length}
                      </p>
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <p className="text-sm text-muted-foreground">Ketishlar</p>
                      <p className="text-2xl font-bold">
                        {bookings.filter((b) => isSameDay(b.checkOut, selectedDay)).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

