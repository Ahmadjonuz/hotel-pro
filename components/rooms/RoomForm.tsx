"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { roomsService } from "@/services/rooms-service"

const roomFormSchema = z.object({
  room_number: z.string().min(1, "Xona raqami kiritilishi shart"),
  type: z.string().min(1, "Xona turi tanlanishi shart"),
  status: z.string().min(1, "Holat tanlanishi shart"),
  price_per_night: z.string().min(1, "Narx kiritilishi shart"),
  capacity: z.string().min(1, "Sig'im kiritilishi shart"),
  amenities: z.string().optional(),
  description: z.string().nullable().optional(),
})

type RoomFormValues = z.infer<typeof roomFormSchema>

interface RoomFormProps {
  initialData?: any
  onSuccess?: () => void
}

export function RoomForm({ initialData, onSuccess }: RoomFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: initialData || {
      room_number: "",
      type: "",
      status: "available",
      price_per_night: "",
      capacity: "",
      amenities: "",
      description: null,
    },
  })

  async function onSubmit(data: RoomFormValues) {
    try {
      setLoading(true)
      
      const roomData = {
        ...data,
        price_per_night: Number(data.price_per_night),
        capacity: Number(data.capacity),
        amenities: data.amenities ? data.amenities.split(",").map((item) => item.trim()) : [],
        description: data.description || null,
      }

      if (initialData) {
        await roomsService.updateRoom(initialData.id, roomData)
      } else {
        await roomsService.createRoom(roomData)
      }

      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error("Xona qo'shishda xatolik:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="room_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xona raqami</FormLabel>
              <FormControl>
                <Input placeholder="Xona raqamini kiriting" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xona turi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Xona turini tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="standard">Standart</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="suite">Lyuks</SelectItem>
                  <SelectItem value="executive">Biznes</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="available">Bo'sh</SelectItem>
                  <SelectItem value="occupied">Band</SelectItem>
                  <SelectItem value="maintenance">Texnik xizmatda</SelectItem>
                  <SelectItem value="cleaning">Tozalanmoqda</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price_per_night"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bir kecha narxi</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Narxni kiriting" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sig'im</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Sig'imni kiriting" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qulayliklar</FormLabel>
              <FormControl>
                <Input placeholder="Qulayliklarni vergul bilan ajrating" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tavsif</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Xona haqida qisqacha ma'lumot" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saqlanmoqda..." : initialData ? "O'zgartirishlarni saqlash" : "Xona qo'shish"}
        </Button>
      </form>
    </Form>
  )
} 