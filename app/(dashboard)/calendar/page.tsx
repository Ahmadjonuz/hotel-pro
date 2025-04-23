"use client"

import { useState, useEffect } from "react"
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
import { NewBookingDialog } from "@/components/bookings/NewBookingDialog"

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
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false)

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
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border dark:border-slate-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Bronlash taqvimi</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Mehmonlar va xonalar</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => setCurrentMonth(today)} 
              variant="outline" 
              className="text-xs h-9 px-3"
            >
              Bugun
            </Button>
            <div className="flex items-center rounded-md border border-input h-9">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={previousMonth} 
                className="h-full px-2 rounded-none border-r border-input"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-3 font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={nextMonth} 
                className="h-full px-2 rounded-none border-l border-input"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Select defaultValue="month">
              <SelectTrigger className="w-[100px] h-9 text-xs">
                <SelectValue placeholder="Ko'rinish" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Kun</SelectItem>
                <SelectItem value="week">Hafta</SelectItem>
                <SelectItem value="month">Oy</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => setIsNewBookingOpen(true)}
              className="ml-auto sm:ml-0 bg-rose-600 hover:bg-rose-700 h-9"
            >
              <Plus className="mr-2 h-4 w-4" />
              Yangi bron
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 text-center py-2 bg-slate-50 dark:bg-slate-800/50">
          {["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((day, i) => (
            <div key={day} className="py-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {day}
              </span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr bg-white dark:bg-slate-900 divide-x divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: firstDayOfMonth.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] p-1 bg-slate-50/50 dark:bg-slate-800/20" />
          ))}
          
          {daysInMonth.map((day) => {
            const dayBookings = getBookingsForDay(day)
            const isSelected = isSameDay(day, selectedDay)
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[100px] p-1 relative transition-all",
                  !isSameMonth(day, currentMonth) && "bg-slate-50/50 dark:bg-slate-800/20",
                  isSelected && "ring-2 ring-inset ring-slate-400 dark:ring-slate-600 bg-white dark:bg-slate-900",
                  "hover:bg-white dark:hover:bg-slate-900 cursor-pointer",
                )}
                onClick={() => setSelectedDay(day)}
              >
                <div className="flex justify-between items-start">
                  <div
                    className={cn(
                      "flex items-center justify-center h-6 w-6 text-xs font-medium rounded-full mt-1 ml-1",
                      isToday(day) && "bg-rose-600 text-white",
                      isSelected && !isToday(day) && "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  
                  {dayBookings.length > 0 && (
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center mt-1 mr-1">
                      {dayBookings.length}
                    </span>
                  )}
                </div>
                
                <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto pr-1 no-scrollbar">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <TooltipProvider key={booking.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={cn(
                              "flex items-center text-[10px] p-1 rounded border-l-2 bg-white dark:bg-slate-800",
                              booking.status === "confirmed" && "border-amber-500",
                              booking.status === "checked-in" && "border-green-500",
                              booking.status === "checked-out" && "border-blue-500",
                              booking.status === "cancelled" && "border-red-500",
                            )}
                          >
                            <span className="truncate">{booking.guestName}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-0 overflow-hidden">
                          <div className="p-3">
                            <div className="font-medium">{booking.guestName}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              <div>Xona: {booking.roomNumber}</div>
                              <div>
                                {format(booking.checkIn, "d MMM")} - {format(booking.checkOut, "d MMM")}
                              </div>
                            </div>
                          </div>
                          <div 
                            className={cn(
                              "px-3 py-2 text-xs text-white",
                              booking.status === "confirmed" && "bg-amber-500",
                              booking.status === "checked-in" && "bg-green-500",
                              booking.status === "checked-out" && "bg-blue-500",
                              booking.status === "cancelled" && "bg-red-500",
                            )}
                          >
                            {booking.status === "confirmed" && "Tasdiqlangan"}
                            {booking.status === "checked-in" && "Joylashgan"}
                            {booking.status === "checked-out" && "Chiqib ketgan"}
                            {booking.status === "cancelled" && "Bekor qilingan"}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  
                  {dayBookings.length > 3 && (
                    <div className="text-[10px] text-center text-slate-500 dark:text-slate-400 pt-1">
                      +{dayBookings.length - 3} bron
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Selected day details */}
      <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border dark:border-slate-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="font-medium">{format(selectedDay, "d MMMM yyyy")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {getBookingsForDay(selectedDay).length} ta bron
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => setIsNewBookingOpen(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Yangi bron
            </Button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {getBookingsForDay(selectedDay).length > 0 ? (
            getBookingsForDay(selectedDay).map((booking) => (
              <div key={booking.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div 
                      className={cn(
                        "w-1 self-stretch rounded-full",
                        getStatusColor(booking.status)
                      )} 
                    />
                    <div>
                      <div className="font-medium">{booking.guestName}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <div className="flex items-center gap-2">
                          <span>Xona {booking.roomNumber}</span>
                          <span>•</span>
                          <span>
                            {booking.status === "confirmed" && "Tasdiqlangan"}
                            {booking.status === "checked-in" && "Joylashgan"}
                            {booking.status === "checked-out" && "Chiqib ketgan"}
                            {booking.status === "cancelled" && "Bekor qilingan"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      {format(booking.checkIn, "d MMM")} - {format(booking.checkOut, "d MMM")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <p>Bu kunda bronlar yo'q</p>
            </div>
          )}
        </div>
      </div>
      
      <NewBookingDialog
        open={isNewBookingOpen}
        onOpenChange={setIsNewBookingOpen}
        onSuccess={() => {
          // Refresh bookings after a new one is added
          // If you implement real data fetching, you can call that function here
        }}
      />
    </div>
  )
} 