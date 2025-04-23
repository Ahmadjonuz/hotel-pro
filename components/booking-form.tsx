"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { bookingsService } from "@/services/bookings-service"
import { guestsService, type Guest } from "@/services/guests-service"
import { roomsService, type Room } from "@/services/rooms-service"
import { cn } from "@/lib/utils"

const bookingFormSchema = z.object({
  guest_id: z.string().uuid(),
  room_id: z.string().uuid(),
  check_in: z.date(),
  check_out: z.date(),
  status: z.enum(["pending", "confirmed", "checked-in", "checked-out", "cancelled"]),
  total_amount: z.number().positive(),
  payment_status: z.enum(["pending", "paid", "refunded"]),
  special_requests: z.string().optional().default(""),
})

type BookingFormValues = z.infer<typeof bookingFormSchema>

interface BookingFormProps {
  booking?: {
    id: string
    guest_id: string
    room_id: string
    check_in: string
    check_out: string
    status: BookingFormValues['status']
    total_amount: number
    payment_status: BookingFormValues['payment_status']
    special_requests: string | null
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function BookingForm({ booking, onSuccess, onCancel }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  const defaultValues: Partial<BookingFormValues> = {
    status: "pending",
    payment_status: "pending",
    special_requests: "",
  }

  if (booking) {
    Object.assign(defaultValues, {
      ...booking,
      check_in: new Date(booking.check_in),
      check_out: new Date(booking.check_out),
      special_requests: booking.special_requests || "",
    })
  }

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [guestsResponse, roomsResponse] = await Promise.all([
          guestsService.getAllGuests(),
          roomsService.getAllRooms(),
        ])

        if (guestsResponse.error) throw guestsResponse.error
        if (roomsResponse.error) throw roomsResponse.error

        setGuests(guestsResponse.data || [])
        setRooms(roomsResponse.data || [])
      } catch (error) {
        console.error("Error loading form data:", error)
      }
    }

    loadData()
  }, [])

  async function onSubmit(data: BookingFormValues) {
    setIsLoading(true)
    try {
      const formattedData = {
        ...data,
        check_in: format(data.check_in, "yyyy-MM-dd"),
        check_out: format(data.check_out, "yyyy-MM-dd"),
        special_requests: data.special_requests || null,
      }

      if (booking) {
        await bookingsService.updateBooking(booking.id, formattedData)
      } else {
        await bookingsService.createBooking(formattedData)
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error saving booking:", error)
      // TODO: Show error toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="guest_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mehmon</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Mehmonni tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.first_name} {guest.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="room_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xona</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Xonani tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.room_number} - {room.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="check_in"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kirish sanasi</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Sanani tanlang</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || (form.getValues("check_out") && date > form.getValues("check_out"))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="check_out"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chiqish sanasi</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Sanani tanlang</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < form.getValues("check_in") || date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Holat</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Holatni tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="confirmed">Tasdiqlangan</SelectItem>
                  <SelectItem value="checked-in">Ro'yxatdan o'tgan</SelectItem>
                  <SelectItem value="checked-out">Chiqib ketgan</SelectItem>
                  <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Umumiy summa</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To'lov holati</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="To'lov holatini tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="paid">To'langan</SelectItem>
                  <SelectItem value="refunded">Qaytarilgan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="special_requests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maxsus so'rovlar</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Maxsus so'rovlarni kiriting" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Bekor qilish
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saqlanmoqda..." : booking ? "Yangilash" : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 