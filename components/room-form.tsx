"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { roomsService, type Room } from "@/services/rooms-service"
import { formatCurrency } from "@/lib/utils"

const roomFormSchema = z.object({
  room_number: z.string().min(1, "Xona raqami kiritilishi shart"),
  type: z.string(),
  capacity: z.number().min(1, "Sig'imi kamida 1 bo'lishi kerak"),
  price_per_night: z.number().positive("Narx musbat son bo'lishi kerak"),
  status: z.string(),
  amenities: z.array(z.string()).default([]),
  description: z.string().nullable(),
})

type RoomFormValues = z.infer<typeof roomFormSchema>

interface RoomFormProps {
  room?: Room
  onSuccess?: () => void
  onCancel?: () => void
}

export function RoomForm({ room, onSuccess, onCancel }: RoomFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues: Partial<RoomFormValues> = {
    status: "available",
    type: "standard",
    capacity: 2,
    amenities: [],
    description: "",
  }

  if (room) {
    Object.assign(defaultValues, room)
  }

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues,
  })

  async function onSubmit(data: RoomFormValues) {
    setIsLoading(true)
    try {
      if (room) {
        await roomsService.updateRoom(room.id, data)
      } else {
        await roomsService.createRoom(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error saving room:", error)
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
          name="room_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xona raqami</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Masalan: 101" />
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Xona turini tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="standard">Standart</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="suite">Lyuks</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sig'imi</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price_per_night"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bir kunlik narxi</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    placeholder="Narxni kiriting (masalan: 500000)"
                    step="1000"
                    min="0"
                  />
                </FormControl>
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
                  <SelectItem value="available">Bo'sh</SelectItem>
                  <SelectItem value="occupied">Band</SelectItem>
                  <SelectItem value="maintenance">Ta'mirda</SelectItem>
                </SelectContent>
              </Select>
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
                  {...field}
                  value={field.value || ""}
                  placeholder="Xona haqida qo'shimcha ma'lumot..."
                />
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
            {isLoading ? "Saqlanmoqda..." : room ? "Yangilash" : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 