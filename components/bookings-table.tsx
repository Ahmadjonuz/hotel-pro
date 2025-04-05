"use client"

import { useState, useMemo, memo, useCallback, useRef } from "react"
import { CheckCircle2, Clock, DoorClosed, DoorOpen, MoreHorizontal, Pencil, Trash2, XCircle } from "lucide-react"
import { useVirtualizer } from '@tanstack/react-virtual'

import { TableSkeleton } from "@/components/loading-skeleton"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useCachedData } from "@/hooks/use-cached-data"
import { bookingsService } from "@/services/bookings-service"

interface Booking {
  id: string
  guestName: string
  roomNumber: string
  checkIn: string
  checkOut: string
  status: 'checked-in' | 'checked-out' | 'confirmed' | 'cancelled' | 'pending'
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
    guestName: "John Smith",
    roomNumber: "101",
    checkIn: "2023-04-15",
    checkOut: "2023-04-18",
    status: "checked-in",
    totalAmount: "$349.99",
  },
  {
    id: "B-1002",
    guestName: "Sarah Johnson",
    roomNumber: "205",
    checkIn: "2023-04-16",
    checkOut: "2023-04-20",
    status: "confirmed",
    totalAmount: "$599.99",
  },
  {
    id: "B-1003",
    guestName: "Michael Brown",
    roomNumber: "310",
    checkIn: "2023-04-10",
    checkOut: "2023-04-15",
    status: "checked-out",
    totalAmount: "$749.99",
  },
  {
    id: "B-1004",
    guestName: "Emily Davis",
    roomNumber: "402",
    checkIn: "2023-04-18",
    checkOut: "2023-04-22",
    status: "confirmed",
    totalAmount: "$499.99",
  },
  {
    id: "B-1005",
    guestName: "Robert Wilson",
    roomNumber: "115",
    checkIn: "2023-04-12",
    checkOut: "2023-04-14",
    status: "cancelled",
    totalAmount: "$199.99",
  },
]

const BookingRow = memo(({ booking, onEdit, onDelete }: BookingRowProps) => {
  const cells = [
    booking.id,
    booking.guestName,
    booking.roomNumber,
    booking.checkIn,
    booking.checkOut,
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
  const { data: bookingsData, loading, error } = useCachedData<Booking[]>(
    async () => {
      try {
        const { data, error } = await bookingsService.getAllBookings();
        if (error) throw error;
        
        // API ma'lumotlarini Booking interfeysiga moslashtirish
        return (data || []).map((booking: any) => {
          // Mehmon ismini olish
          const guestName = booking.guests 
            ? `${booking.guests.first_name} ${booking.guests.last_name}`
            : "Noma'lum mehmon";
            
          // Xona raqamini olish
          const roomNumber = booking.rooms?.room_number || "Noma'lum";
          
          // Summani formatlash
          const totalAmount = new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS"
          }).format(booking.total_amount || 0);
          
          return {
            id: booking.id,
            guestName,
            roomNumber,
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            status: booking.status,
            totalAmount
          };
        });
      } catch (err) {
        console.error("Bronlarni yuklashda xatolik:", err);
        throw err;
      }
    },
    { key: "bookings", ttl: 5 * 60 * 1000 } // 5 daqiqalik kesh
  );

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: bookingsData?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // Taxminiy qator balandligi
    overscan: 5 // Ko'rinadigan qismdan tashqarida renderlash uchun qatorlar soni
  });

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleEdit = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    // Tahrirlash logikasi
  }, []);

  const handleDelete = useCallback((booking: Booking) => {
    // O'chirish logikasi
    console.log("Bron o'chirilmoqda:", booking.id);
  }, []);

  if (loading) return <TableSkeleton />;
  if (error) return <div>Xatolik yuz berdi: {error.message}</div>;
  if (!bookingsData?.length) return <div>Bronlar topilmadi</div>;

  return (
    <div ref={parentRef} className="relative overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Mehmon</TableHead>
            <TableHead>Xona</TableHead>
            <TableHead>Kirish</TableHead>
            <TableHead>Chiqish</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead>Summa</TableHead>
            <TableHead className="w-[100px]">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const booking = bookingsData[virtualRow.index];
            return (
              <TableRow
                key={booking.id}
                data-index={virtualRow.index}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <BookingRow
                  booking={booking}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
