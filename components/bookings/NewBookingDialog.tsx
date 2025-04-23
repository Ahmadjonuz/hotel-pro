"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

const bookingSchema = z.object({
  guest_id: z.string().min(1, "Mehmon tanlanishi kerak"),
  room_id: z.string().min(1, "Xona tanlanishi kerak"),
  check_in: z.date(),
  check_out: z.date(),
  status: z.enum(["pending", "confirmed"]),
  total_amount: z.number().min(0, "Summa musbat bo'lishi kerak"),
  payment_status: z.enum(["pending", "paid"]),
  special_requests: z.string().optional(),
})

type BookingFormValues = z.infer<typeof bookingSchema>

interface NewBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NewBookingDialog({ open, onOpenChange, onSuccess }: NewBookingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [guests, setGuests] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      status: "pending",
      payment_status: "pending",
      total_amount: 0,
    }
  })

  useEffect(() => {
    if (open) {
      fetchGuests()
      fetchRooms()
    }
  }, [open])

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("id, first_name, last_name, email, phone, is_vip")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Mehmonlarni yuklashda xatolik:", error)
      toast({
        title: "Xatolik",
        description: "Mehmonlar ro'yxatini yuklab bo'lmadi",
        variant: "destructive",
      })
    } else {
      setGuests(data || [])
    }
  }

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("status", "available")
      .order("room_number", { ascending: true })
    
    if (error) {
      console.error("Xonalarni yuklashda xatolik:", error)
      toast({
        title: "Xatolik",
        description: "Bo'sh xonalar ro'yxatini yuklab bo'lmadi",
        variant: "destructive",
      })
    } else {
      setRooms(data || [])
    }
  }

  const onSubmit = async (data: BookingFormValues) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("bookings")
        .insert([{
          ...data,
          check_in: data.check_in.toISOString(),
          check_out: data.check_out.toISOString(),
        }])

      if (error) throw error

      toast({
        title: "Muvaffaqiyatli",
        description: "Bron muvaffaqiyatli yaratildi",
      })

      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Bron yaratishda xatolik:", error)
      toast({
        title: "Xatolik",
        description: "Bronni yaratib bo'lmadi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Yangi bron qo'shish</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guest_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mehmon</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Kirish sanasi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
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
                            date < new Date() || date > form.getValues("check_out")
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Chiqish sanasi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
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
                            date <= form.getValues("check_in") || date < new Date()
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
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Umumiy summa</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holat</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Holatni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Kutilmoqda</SelectItem>
                      <SelectItem value="confirmed">Tasdiqlangan</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="To'lov holatini tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Kutilmoqda</SelectItem>
                      <SelectItem value="paid">To'langan</SelectItem>
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
                    <Textarea
                      placeholder="Maxsus so'rovlarni kiriting..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saqlanmoqda..." : "Bron qo'shish"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 