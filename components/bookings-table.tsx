"use client"

import { useState, useMemo, memo, useCallback } from "react"
import { CheckCircle2, Clock, DoorClosed, DoorOpen, MoreHorizontal, Pencil, Plus, Trash2, XCircle, Edit, Trash } from "lucide-react"
import { ColumnDef, Row } from "@tanstack/react-table"

import { TableSkeleton } from "@/components/loading-skeleton"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCachedData } from "@/hooks/use-cached-data"
import { bookingsService } from "@/services/bookings-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookingForm } from "@/components/booking-form"

interface Booking {
  id: string
  guest_id: string
  room_id: string
  check_in: string
  check_out: string
  status: 'checked-in' | 'checked-out' | 'confirmed' | 'cancelled' | 'pending'
  total_amount: number
  payment_status: 'pending' | 'paid' | 'refunded'
  special_requests: string | null
  // Display-only fields
  guestName: string
  roomNumber: string
  totalAmount: string
}

interface BookingRowProps {
  booking: Booking
  onEdit: (booking: Booking) => void
  onDelete: (booking: Booking) => void
}

interface StatusBadgeProps {
  status: Booking['status']
}

interface BookingActionsProps {
  onEdit: () => void
  onDelete: () => void
}

// Namunali bron ma'lumotlari
const bookings: Booking[] = [
  {
    id: "B-1001",
    guest_id: "G-1001",
    room_id: "R-101",
    guestName: "John Smith",
    roomNumber: "101",
    check_in: "2023-04-15",
    check_out: "2023-04-18",
    status: "checked-in",
    totalAmount: "$349.99",
    total_amount: 349.99,
    payment_status: "paid",
    special_requests: null,
  },
  {
    id: "B-1002",
    guest_id: "G-1002",
    room_id: "R-205",
    guestName: "Sarah Johnson",
    roomNumber: "205",
    check_in: "2023-04-16",
    check_out: "2023-04-20",
    status: "confirmed",
    totalAmount: "$599.99",
    total_amount: 599.99,
    payment_status: "paid",
    special_requests: null,
  },
  {
    id: "B-1003",
    guest_id: "G-1003",
    room_id: "R-310",
    guestName: "Michael Brown",
    roomNumber: "310",
    check_in: "2023-04-10",
    check_out: "2023-04-15",
    status: "checked-out",
    totalAmount: "$749.99",
    total_amount: 749.99,
    payment_status: "paid",
    special_requests: null,
  },
  {
    id: "B-1004",
    guest_id: "G-1004",
    room_id: "R-402",
    guestName: "Emily Davis",
    roomNumber: "402",
    check_in: "2023-04-18",
    check_out: "2023-04-22",
    status: "confirmed",
    totalAmount: "$499.99",
    total_amount: 499.99,
    payment_status: "paid",
    special_requests: null,
  },
  {
    id: "B-1005",
    guest_id: "G-1005",
    room_id: "R-115",
    guestName: "Robert Wilson",
    roomNumber: "115",
    check_in: "2023-04-12",
    check_out: "2023-04-14",
    status: "cancelled",
    totalAmount: "$199.99",
    total_amount: 199.99,
    payment_status: "refunded",
    special_requests: null,
  },
]

const BookingRow = memo(({ booking, onEdit, onDelete }: BookingRowProps) => {
  const cells = [
    booking.id,
    booking.guestName,
    booking.roomNumber,
    new Date(booking.check_in).toLocaleDateString('uz-UZ'),
    new Date(booking.check_out).toLocaleDateString('uz-UZ'),
    <StatusBadge key="status" status={booking.status} />,
    booking.totalAmount,
    <BookingActions key="actions" onEdit={() => onEdit(booking)} onDelete={() => onDelete(booking)} />
  ]

  return (
    <>
      {cells.map((cell, i) => (
        <TableCell key={i}>{cell}</TableCell>
      ))}
    </>
  )
});

BookingRow.displayName = 'BookingRow';

const StatusBadge = memo(({ status }: StatusBadgeProps) => {
  const statusConfig = useMemo(() => ({
    'checked-in': { label: "Ro'yxatdan o'tgan", icon: DoorOpen, variant: 'secondary' as const },
    'checked-out': { label: "Chiqib ketgan", icon: DoorClosed, variant: 'default' as const },
    'confirmed': { label: "Tasdiqlangan", icon: CheckCircle2, variant: 'secondary' as const },
    'cancelled': { label: "Bekor qilingan", icon: XCircle, variant: 'destructive' as const },
    'pending': { label: "Kutilmoqda", icon: Clock, variant: 'outline' as const },
  }), []);

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

const BookingActions = memo(({ onEdit, onDelete }: BookingActionsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={onEdit}>
        <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onDelete}>
        <Trash2 className="mr-2 h-4 w-4" /> O'chirish
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));

BookingActions.displayName = 'BookingActions';

export function BookingsTable() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const { data: bookingsData, loading, error, refetch } = useCachedData<Booking[]>(
    async () => {
      try {
        const { data, error } = await bookingsService.getAllBookings()
        if (error) throw error
        
        return (data || []).map((booking: any) => {
          const guestName = booking.guests 
            ? `${booking.guests.first_name} ${booking.guests.last_name}`
            : "Noma'lum mehmon"
            
          const roomNumber = booking.rooms?.room_number || "Noma'lum"
          
          const totalAmount = new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS"
          }).format(booking.total_amount || 0)
          
          return {
            id: booking.id,
            guest_id: booking.guest_id,
            room_id: booking.room_id,
            check_in: booking.check_in,
            check_out: booking.check_out,
            status: booking.status,
            total_amount: booking.total_amount,
            payment_status: booking.payment_status,
            special_requests: booking.special_requests,
            // Display-only fields
            guestName,
            roomNumber,
            totalAmount
          }
        })
      } catch (err) {
        console.error("Bronlarni yuklashda xatolik:", err)
        throw err
      }
    },
    { key: "bookings", ttl: 5 * 60 * 1000 }
  )

  const handleEdit = useCallback((booking: Booking) => {
    setSelectedBooking(booking)
    setIsFormOpen(true)
  }, [])

  const handleDelete = useCallback(async (booking: Booking) => {
    if (window.confirm("Bu bronni o'chirishni xohlaysizmi?")) {
      try {
        const { error } = await bookingsService.deleteBooking(booking.id)
        if (error) throw error
        refetch()
      } catch (err) {
        console.error("Bronni o'chirishda xatolik:", err)
        // TODO: Show error toast
      }
    }
  }, [refetch])

  const handleFormClose = useCallback(() => {
    setSelectedBooking(null)
    setIsFormOpen(false)
  }, [])

  const handleFormSuccess = useCallback(() => {
    handleFormClose()
    refetch()
  }, [handleFormClose, refetch])

  const columns = useMemo<ColumnDef<Booking>[]>(() => [
    {
      accessorKey: "guestName",
      header: "Mehmon",
    },
    {
      accessorKey: "roomNumber",
      header: "Xona",
    },
    {
      accessorKey: "check_in",
      header: "Kirish sanasi",
      cell: ({ row }: { row: Row<Booking> }) => new Date(row.getValue("check_in")).toLocaleDateString('uz-UZ'),
    },
    {
      accessorKey: "check_out",
      header: "Chiqish sanasi",
      cell: ({ row }: { row: Row<Booking> }) => new Date(row.getValue("check_out")).toLocaleDateString('uz-UZ'),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: Row<Booking> }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "totalAmount",
      header: "Summa",
    },
    {
      id: "actions",
      cell: ({ row }: { row: Row<Booking> }) => {
        const booking = row.original
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Amallar menyusi</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(booking)}>
                <Edit className="mr-2 h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(booking)}>
                <Trash className="mr-2 h-4 w-4" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [handleEdit, handleDelete])

  if (loading) {
    return <TableSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, sahifani yangilang yoki keyinroq urinib ko'ring.
        </AlertDescription>
      </Alert>
    )
  }

  if (!bookingsData?.length) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Yangi bron qo'shish
          </Button>
        </div>
        <Alert>
          <AlertDescription>
            Hozircha bronlar mavjud emas.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Yangi bron qo'shish
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bron ID</TableHead>
              <TableHead>Mehmon</TableHead>
              <TableHead>Xona</TableHead>
              <TableHead>Kirish</TableHead>
              <TableHead>Chiqish</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookingsData.map((booking) => (
              <TableRow key={booking.id}>
                <BookingRow
                  booking={booking}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBooking ? "Bronni tahrirlash" : "Yangi bron qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <BookingForm
            booking={selectedBooking ? {
              id: selectedBooking.id,
              guest_id: selectedBooking.guest_id,
              room_id: selectedBooking.room_id,
              check_in: selectedBooking.check_in,
              check_out: selectedBooking.check_out,
              status: selectedBooking.status,
              total_amount: selectedBooking.total_amount,
              payment_status: selectedBooking.payment_status,
              special_requests: selectedBooking.special_requests,
            } : undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
