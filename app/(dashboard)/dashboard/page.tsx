"use client"

import { useState, useEffect } from "react"
import { CalendarRange, Users, Home, AlertCircle, BarChart, ArrowUpRight, DollarSign, Wrench, Bell, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Room {
  id: string
  number: string
  type: string
  status: "available" | "occupied" | "maintenance" | "cleaning"
  price: number
  created_at: string
}

interface DashboardStats {
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  occupancyRate: number
  maintenanceRooms: number
  cleaningRooms: number
  totalRevenue: number
  todayCheckIns: number
  todayCheckOuts: number
  pendingMaintenance: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    maintenanceRooms: 0,
    cleaningRooms: 0,
    totalRevenue: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    pendingMaintenance: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("today")

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)
        
        // Get rooms data
        const { data: rooms, error: roomsError } = await supabase
          .from("rooms")
          .select("*")

        if (roomsError) throw roomsError

        // Get today's bookings
        const today = new Date().toISOString().split('T')[0]
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("*")
          .or(`check_in.eq.${today},check_out.eq.${today}`)

        if (bookingsError) throw bookingsError

        // Get maintenance requests
        const { data: maintenance, error: maintenanceError } = await supabase
          .from("maintenance_requests")
          .select("*")
          .eq("status", "pending")

        if (maintenanceError) throw maintenanceError

        // Calculate stats
        const totalRooms = rooms?.length || 0
        const availableRooms = rooms?.filter(room => room.status === "available").length || 0
        const occupiedRooms = rooms?.filter(room => room.status === "occupied").length || 0
        const maintenanceRooms = rooms?.filter(room => room.status === "maintenance").length || 0
        const cleaningRooms = rooms?.filter(room => room.status === "cleaning").length || 0
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

        // Calculate today's check-ins and check-outs
        const todayCheckIns = bookings?.filter(booking => booking.check_in === today).length || 0
        const todayCheckOuts = bookings?.filter(booking => booking.check_out === today).length || 0

        setStats({
          totalRooms,
          availableRooms,
          occupiedRooms,
          occupancyRate,
          maintenanceRooms,
          cleaningRooms,
          totalRevenue: 0, // TODO: Calculate actual revenue
          todayCheckIns,
          todayCheckOuts,
          pendingMaintenance: maintenance?.length || 0
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
        console.error("Dashboard error:", error)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    const roomsSubscription = supabase
      .channel('rooms-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'rooms' 
        }, 
        () => {
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      roomsSubscription.unsubscribe()
    }
  }, [timeRange])

  return (
    <div className="flex-1">
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Boshqaruv paneli</h1>
            <p className="text-muted-foreground">Mehmonxona statistikasi va holatini kuzating</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <CalendarRange className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Vaqt oralig'ini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Bugun</SelectItem>
                <SelectItem value="week">So'nggi hafta</SelectItem>
                <SelectItem value="month">So'nggi oy</SelectItem>
                <SelectItem value="year">So'nggi yil</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/reports">
              <Button variant="default" size="sm" className="gap-2">
                <BarChart className="h-4 w-4" />
                Hisobotlar
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
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
                    <CardTitle className="text-sm font-medium">Jami xonalar</CardTitle>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalRooms}</div>
                    <p className="text-sm text-muted-foreground mt-1">Barcha mavjud xonalar</p>
                  </CardContent>
                </Card>
                
                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Bo'sh xonalar</CardTitle>
                    <div className="p-2 bg-green-50 rounded-full dark:bg-green-900/20">
                      <CalendarRange className="h-5 w-5 text-green-600 dark:text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold">{stats.availableRooms}</div>
                      <div className="text-sm text-green-600 dark:text-green-500 font-medium">
                        {stats.totalRooms > 0 ? Math.round((stats.availableRooms / stats.totalRooms) * 100) : 0}%
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Bron qilish uchun tayyor</p>
                  </CardContent>
                </Card>
                
                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Band xonalar</CardTitle>
                    <div className="p-2 bg-amber-50 rounded-full dark:bg-amber-900/20">
                      <Users className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold">{stats.occupiedRooms}</div>
                      <div className="text-sm text-amber-600 dark:text-amber-500 font-medium">
                        {stats.occupancyRate}%
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Hozirda foydalanilmoqda</p>
                  </CardContent>
                </Card>

                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Daromad</CardTitle>
                    <div className="p-2 bg-blue-50 rounded-full dark:bg-blue-900/20">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()} UZS</div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Bugungi daromad</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Texnik xizmat</CardTitle>
                    <div className="p-2 bg-red-50 rounded-full dark:bg-red-900/20">
                      <Wrench className="h-5 w-5 text-red-600 dark:text-red-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold">{stats.maintenanceRooms}</div>
                      <div className="text-sm text-red-600 dark:text-red-500 font-medium">
                        {stats.pendingMaintenance} so'rov
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Xizmat ko'rsatilmoqda</p>
                  </CardContent>
                </Card>

                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Tozalash</CardTitle>
                    <div className="p-2 bg-purple-50 rounded-full dark:bg-purple-900/20">
                      <Bell className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold">{stats.cleaningRooms}</div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Tozalash kerak bo'lgan xonalar</p>
                  </CardContent>
                </Card>

                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Kirishlar</CardTitle>
                    <div className="p-2 bg-green-50 rounded-full dark:bg-green-900/20">
                      <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold">{stats.todayCheckIns}</div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Bugungi kutilayotgan mehmonlar</p>
                  </CardContent>
                </Card>

                <Card className="hover-effect">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Chiqishlar</CardTitle>
                    <div className="p-2 bg-amber-50 rounded-full dark:bg-amber-900/20">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold">{stats.todayCheckOuts}</div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Bugungi chiqishlar</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-5">
                <Card className="hover-effect md:col-span-2">
                  <CardHeader>
                    <CardTitle>Xonalar holati</CardTitle>
                    <CardDescription>Joriy band va bo'sh xonalar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Band xonalar</span>
                          <span className="text-sm font-medium flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                            {stats.occupiedRooms} ({stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{
                              width: `${
                                stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Bo'sh xonalar</span>
                          <span className="text-sm font-medium flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            {stats.availableRooms} ({stats.totalRooms > 0 ? Math.round((stats.availableRooms / stats.totalRooms) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${
                                stats.totalRooms > 0 ? Math.round((stats.availableRooms / stats.totalRooms) * 100) : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Texnik xizmat</span>
                          <span className="text-sm font-medium flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            {stats.maintenanceRooms} ({stats.totalRooms > 0 ? Math.round((stats.maintenanceRooms / stats.totalRooms) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${
                                stats.totalRooms > 0 ? Math.round((stats.maintenanceRooms / stats.totalRooms) * 100) : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Tozalash</span>
                          <span className="text-sm font-medium flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                            {stats.cleaningRooms} ({stats.totalRooms > 0 ? Math.round((stats.cleaningRooms / stats.totalRooms) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{
                              width: `${
                                stats.totalRooms > 0 ? Math.round((stats.cleaningRooms / stats.totalRooms) * 100) : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover-effect md:col-span-3">
                  <CardHeader>
                    <CardTitle>Bugungi kelishlar</CardTitle>
                    <CardDescription>Kutilayotgan mehmonlar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Alisher Karimov</p>
                          <p className="text-sm text-muted-foreground">Standart xona, 2 kishi</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">14:00</p>
                          <p className="text-xs text-muted-foreground">Xona #101</p>
                          <Badge variant="outline" className="mt-1">Kutilmoqda</Badge>
                        </div>
                      </div>
                      <div className="rounded-lg border p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Malika Saidova</p>
                          <p className="text-sm text-muted-foreground">Deluxe xona, 1 kishi</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">16:30</p>
                          <p className="text-xs text-muted-foreground">Xona #205</p>
                          <Badge variant="outline" className="mt-1">Kutilmoqda</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/bookings" className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        Barcha kelishlarni ko'rish
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </>
          )
        )}
      </main>
    </div>
  )
}

