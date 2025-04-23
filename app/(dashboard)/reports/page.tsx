"use client"

import { useState, useEffect } from "react"
import { CalendarRange, BarChart, DollarSign, Users, Home, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ReportData {
  totalRevenue: number
  occupancyRate: number
  averageRoomRate: number
  totalBookings: number
  totalGuests: number
  revenueByRoomType: {
    type: string
    revenue: number
    bookings: number
  }[]
  monthlyStats: {
    month: string
    revenue: number
    occupancy: number
    bookings: number
  }[]
}

export default function Reports() {
  const [data, setData] = useState<ReportData>({
    totalRevenue: 0,
    occupancyRate: 0,
    averageRoomRate: 0,
    totalBookings: 0,
    totalGuests: 0,
    revenueByRoomType: [],
    monthlyStats: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("month")

  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true)
        setError(null)

        // Get bookings data
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("*")

        if (bookingsError) throw bookingsError

        // Get rooms data
        const { data: rooms, error: roomsError } = await supabase
          .from("rooms")
          .select("*")

        if (roomsError) throw roomsError

        // Calculate basic stats
        const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0
        const totalBookings = bookings?.length || 0
        const totalGuests = bookings?.reduce((sum, booking) => sum + booking.guests_count, 0) || 0
        const averageRoomRate = totalBookings > 0 ? totalRevenue / totalBookings : 0

        // Calculate occupancy rate
        const totalRooms = rooms?.length || 0
        const occupiedRooms = rooms?.filter(room => room.status === "occupied").length || 0
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

        // Calculate revenue by room type
        const revenueByRoomType = rooms?.reduce((acc, room) => {
          const roomBookings = bookings?.filter(booking => booking.room_id === room.id) || []
          const existingType = acc.find((item: { type: string }) => item.type === room.type)
          
          if (existingType) {
            existingType.revenue += roomBookings.reduce((sum, booking) => sum + booking.total_amount, 0)
            existingType.bookings += roomBookings.length
          } else {
            acc.push({
              type: room.type,
              revenue: roomBookings.reduce((sum, booking) => sum + booking.total_amount, 0),
              bookings: roomBookings.length
            })
          }
          
          return acc
        }, [] as { type: string; revenue: number; bookings: number }[]) || []

        // Calculate monthly stats
        const monthlyStats = bookings?.reduce((acc, booking) => {
          const date = new Date(booking.check_in)
          const month = date.toLocaleString('default', { month: 'short' })
          const year = date.getFullYear()
          const monthKey = `${month} ${year}`
          
          const existingMonth = acc.find((item: { month: string }) => item.month === monthKey) 
          
          if (existingMonth) {
            existingMonth.revenue += booking.total_amount
            existingMonth.bookings += 1
            
            // Calculate occupancy for this month
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
            const daysInMonth = monthEnd.getDate()
            
            // Count occupied rooms for each day in the month
            const monthBookings = bookings?.filter(b => {
              const checkIn = new Date(b.check_in)
              const checkOut = new Date(b.check_out)
              return checkIn <= monthEnd && checkOut >= monthStart
            }) || []
            
            const totalRooms = rooms?.length || 0
            const occupiedDays = monthBookings.reduce((sum, b) => {
              const start = Math.max(new Date(b.check_in).getTime(), monthStart.getTime())
              const end = Math.min(new Date(b.check_out).getTime(), monthEnd.getTime())
              const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
              return sum + days
            }, 0)
            
            existingMonth.occupancy = Math.round((occupiedDays / (totalRooms * daysInMonth)) * 100)
          } else {
            acc.push({
              month: monthKey,
              revenue: booking.total_amount,
              bookings: 1,
              occupancy: 0 // Will be calculated in the next iteration
            })
          }
          
          return acc
        }, [] as { month: string; revenue: number; occupancy: number; bookings: number }[]) || []
        // Sort monthly stats by date
        monthlyStats.sort((a: { month: string }, b: { month: string }) => { 
          const [monthA, yearA] = a.month.split(' ')
          const [monthB, yearB] = b.month.split(' ')
          const dateA = new Date(`${monthA} 1, ${yearA}`)
          const dateB = new Date(`${monthB} 1, ${yearB}`)
          return dateA.getTime() - dateB.getTime()
        })

        setData({
          totalRevenue,
          occupancyRate,
          averageRoomRate,
          totalBookings,
          totalGuests,
          revenueByRoomType,
          monthlyStats
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
        console.error("Reports error:", error)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [timeRange])

  return (
    <div className="flex-1">
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Hisobotlar</h1>
            <p className="text-muted-foreground">Mehmonxona statistikasi va moliyaviy hisobotlar</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <CalendarRange className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Vaqt oralig'ini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">So'nggi hafta</SelectItem>
                <SelectItem value="month">So'nggi oy</SelectItem>
                <SelectItem value="quarter">So'nggi chorak</SelectItem>
                <SelectItem value="year">So'nggi yil</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart className="h-4 w-4" />
              PDF ga yuklab olish
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Xatolik</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()} 
              className="mt-2"
            >
              Qayta urinish
            </Button>
          </Alert>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover-effect">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="w-1/3 h-4 bg-muted animate-pulse rounded"></div>
                  <div className="p-2 bg-muted rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="w-1/4 h-8 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="w-2/3 h-4 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          !error && (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Umumiy daromad</CardTitle>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.totalRevenue.toLocaleString()} UZS</div>
                    <p className="text-sm text-muted-foreground mt-1">Tanlangan davr uchun</p>
                  </CardContent>
                </Card>

                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Band bo'lish darajasi</CardTitle>
                    <div className="p-2 bg-green-50 rounded-full dark:bg-green-900/20">
                      <Home className="h-5 w-5 text-green-600 dark:text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.occupancyRate}%</div>
                    <p className="text-sm text-muted-foreground mt-1">O'rtacha band bo'lish</p>
                  </CardContent>
                </Card>

                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">O'rtacha xona narxi</CardTitle>
                    <div className="p-2 bg-blue-50 rounded-full dark:bg-blue-900/20">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.averageRoomRate.toLocaleString()} UZS</div>
                    <p className="text-sm text-muted-foreground mt-1">Kunlik o'rtacha narx</p>
                  </CardContent>
                </Card>

                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Jami mehmonlar</CardTitle>
                    <div className="p-2 bg-amber-50 rounded-full dark:bg-amber-900/20">
                      <Users className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.totalGuests}</div>
                    <p className="text-sm text-muted-foreground mt-1">Tanlangan davr uchun</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Xona turlari bo'yicha daromad</CardTitle>
                    <CardDescription>Xona turlari bo'yicha daromad va bronlar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Xona turi</TableHead>
                          <TableHead>Daromad</TableHead>
                          <TableHead>Bronlar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.revenueByRoomType.map((type) => (
                          <TableRow key={type.type}>
                            <TableCell className="font-medium">{type.type}</TableCell>
                            <TableCell>{type.revenue.toLocaleString()} UZS</TableCell>
                            <TableCell>{type.bookings}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Oylik statistika</CardTitle>
                    <CardDescription>Oylik daromad va band bo'lish darajasi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Oy</TableHead>
                          <TableHead>Daromad</TableHead>
                          <TableHead>Band bo'lish</TableHead>
                          <TableHead>Bronlar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.monthlyStats.map((stat) => (
                          <TableRow key={stat.month}>
                            <TableCell className="font-medium">{stat.month}</TableCell>
                            <TableCell>{stat.revenue.toLocaleString()} UZS</TableCell>
                            <TableCell>{stat.occupancy}%</TableCell>
                            <TableCell>{stat.bookings}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </>
          )
        )}
      </main>
    </div>
  )
} 