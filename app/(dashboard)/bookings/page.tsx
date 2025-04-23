"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"
import {
  ArrowUpRight,
  BookMarked,
  CalendarIcon,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  Users,
  CalendarCheck,
  UserCheck,
  LogOut,
  CheckSquare,
  Filter,
  Plus,
  Download,
  X,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { NewBookingDialog } from "@/components/bookings/NewBookingDialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { ClientFormattedCurrency } from "@/components/ui/client-formatted-currency"

type Booking = {
  id: string
  guest_id: string
  room_id: string
  check_in: string
  check_out: string
  status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled"
  payment_status: "unpaid" | "partial" | "paid"
  total_amount: number
  created_at: string
  guests?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  rooms?: {
    id: string
    room_number: string
    type: string
    price_per_night: number
  }
}

type BookingDetailsDialogProps = {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: () => void
}

function BookingDetailsDialog({ booking, open, onOpenChange, onStatusChange }: BookingDetailsDialogProps) {
  if (!booking) return null

  const handleStatusChange = async (newStatus: Booking['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', booking.id)

      if (error) throw error

      onStatusChange()
      toast({
        title: "Holat yangilandi",
        description: "Bron holati muvaffaqiyatli yangilandi",
      })
    } catch (error: any) {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bron tafsilotlari</DialogTitle>
          <DialogDescription>#{booking.id}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Mehmon ma'lumotlari</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  {booking.guests?.first_name} {booking.guests?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{booking.guests?.email}</p>
                <p className="text-sm text-muted-foreground">{booking.guests?.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Xona ma'lumotlari</h3>
              <div className="space-y-1">
                <p className="text-sm">Xona {booking.rooms?.room_number}</p>
                <p className="text-sm text-muted-foreground">{booking.rooms?.type}</p>
                <p className="text-sm text-muted-foreground">
                  <ClientFormattedCurrency amount={booking.rooms?.price_per_night} /> / tun
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Bron muddati</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(booking.check_in), "PPP")}
                </span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(booking.check_out), "PPP")}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">To'lov ma'lumotlari</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Umumiy summa</span>
                <span className="font-medium"><ClientFormattedCurrency amount={booking.total_amount} /></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">To'lov holati</span>
                {getPaymentBadge(booking.payment_status)}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Bron holati</h3>
            <div className="flex items-center gap-4">
              {getStatusBadge(booking.status)}
              <Select
                value={booking.status}
                onValueChange={(value: Booking['status']) => handleStatusChange(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Holatni o'zgartirish" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="confirmed">Tasdiqlangan</SelectItem>
                  <SelectItem value="checked_in">Kirgan</SelectItem>
                  <SelectItem value="checked_out">Ketgan</SelectItem>
                  <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getStatusBadge(status: Booking['status']) {
  switch (status) {
    case "pending":
      return <Badge variant="outline">Kutilmoqda</Badge>
    case "confirmed":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Tasdiqlangan</Badge>
    case "checked_in":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Kirgan</Badge>
    case "checked_out":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Ketgan</Badge>
    case "cancelled":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Bekor qilingan</Badge>
  }
}

function getPaymentBadge(status: Booking['payment_status']) {
  switch (status) {
    case "unpaid":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">To'lanmagan</Badge>
    case "partial":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Qisman to'langan</Badge>
    case "paid":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">To'langan</Badge>
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    checkedIn: 0,
    upcoming: 0,
  })
  const [arrivalsToday, setArrivalsToday] = useState(0)
  const [departuresStatistics, setDeparturesStatistics] = useState({
    departuresAmount: 0
  })
  const [confirmedBookings, setConfirmedBookings] = useState(0)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    if (bookings.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const arrivalsCount = bookings.filter(
        (b) => new Date(b.check_in).toDateString() === today.toDateString()
      ).length
      
      const departuresCount = bookings.filter(
        (b) => new Date(b.check_out).toDateString() === today.toDateString()
      ).length
      
      const confirmedCount = bookings.filter((b) => b.status === "confirmed").length
      
      setStats({
        total: bookings.length,
        confirmed: confirmedCount,
        checkedIn: bookings.filter((b) => b.status === "checked_in").length,
        upcoming: bookings.filter(
          (b) => b.status === "confirmed" && new Date(b.check_in) > today
        ).length,
      })
      
      // Calculate additional statistics for display
      setArrivalsToday(arrivalsCount)
      setDeparturesStatistics({
        departuresAmount: departuresCount
      })
      setConfirmedBookings(confirmedCount)
    }
  }, [bookings])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `*, guests:guest_id(id, first_name, last_name, email, phone), rooms:room_id(id, room_number, type, price_per_night)`
        )
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setBookings(data as Booking[])
    } catch (error: any) {
      console.error("Error fetching bookings:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings
    .filter((booking) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const guestName = `${booking.guests?.first_name} ${booking.guests?.last_name}`.toLowerCase()
      const roomNumber = booking.rooms?.room_number.toLowerCase() || ""
      const matchesSearch =
        searchTerm === "" ||
        guestName.includes(searchLower) ||
        roomNumber.includes(searchLower) ||
        booking.id.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter

      // Date filter
      const matchesDate =
        !dateFilter ||
        (new Date(booking.check_in).toDateString() ===
          dateFilter.toDateString() ||
          new Date(booking.check_out).toDateString() ===
            dateFilter.toDateString())

      return matchesSearch && matchesStatus && matchesDate
    })
    .slice(0, 100) // Limit to 100 results for performance

  return (
    <div className="flex-1">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bronlar</h1>
          <p className="text-muted-foreground">
            Mehmonxona bronlarini boshqaring
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami bronlar</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">
                Barcha bronlar
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugungi kelishlar</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {arrivalsToday}
              </div>
              <p className="text-xs text-muted-foreground">
                Bugun kutilayotgan mehmonlar
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugungi ketishlar</CardTitle>
              <LogOut className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {departuresStatistics.departuresAmount}
              </div>
              <p className="text-xs text-muted-foreground">
                Bugun ketadigan mehmonlar
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasdiqlanganlar</CardTitle>
              <CheckSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {confirmedBookings}
              </div>
              <p className="text-xs text-muted-foreground">
                Tasdiqlangan bronlar soni
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <CardTitle>Bronlar ro'yxati</CardTitle>
              <CardDescription>
                Barcha bronlarni ko'rish va boshqarish
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setIsNewBookingOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yangi bron
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Qidirish..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Holat bo'yicha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha holatlar</SelectItem>
                      <SelectItem value="pending">Kutilmoqda</SelectItem>
                      <SelectItem value="confirmed">Tasdiqlangan</SelectItem>
                      <SelectItem value="checked_in">Joylashgan</SelectItem>
                      <SelectItem value="checked_out">Chiqib ketgan</SelectItem>
                      <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, "PPP") : "Sana bo'yicha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFilter}
                        onSelect={setDateFilter}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setStatusFilter("all")
                      setDateFilter(undefined)
                      setSearchTerm("")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Mehmon</TableHead>
                      <TableHead className="min-w-[120px]">Xona</TableHead>
                      <TableHead className="min-w-[150px]">Kelish</TableHead>
                      <TableHead className="min-w-[150px]">Ketish</TableHead>
                      <TableHead className="min-w-[120px]">Holat</TableHead>
                      <TableHead className="min-w-[120px]">To'lov</TableHead>
                      <TableHead className="min-w-[120px] text-right">Summa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-destructive">
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Hech qanday bron topilmadi
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => (
                        <TableRow 
                          key={booking.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <TableCell>
                            <div className="font-medium">
                              {booking.guests?.first_name} {booking.guests?.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.guests?.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{booking.rooms?.room_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.rooms?.type}
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(booking.check_in), "PPP")}</TableCell>
                          <TableCell>{format(new Date(booking.check_out), "PPP")}</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>{getPaymentBadge(booking.payment_status)}</TableCell>
                          <TableCell className="text-right font-medium">
                            <ClientFormattedCurrency amount={booking.total_amount} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Jami: {filteredBookings.length} ta bron ({bookings.length} dan)
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4 mr-1" />
              Jami summa: <ClientFormattedCurrency amount={filteredBookings.reduce((sum, booking) => sum + booking.total_amount, 0)} />
            </div>
          </CardFooter>
        </Card>

        <NewBookingDialog
          open={isNewBookingOpen}
          onOpenChange={setIsNewBookingOpen}
          onSuccess={fetchBookings}
        />

        <BookingDetailsDialog
          booking={selectedBooking}
          open={!!selectedBooking}
          onOpenChange={(open) => !open && setSelectedBooking(null)}
          onStatusChange={fetchBookings}
        />
      </div>
    </div>
  )
} 