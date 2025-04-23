"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { housekeepingService } from "@/services/housekeeping-service"
import { roomsService } from "@/services/rooms-service"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { TaskType, TaskPriority } from "@/types/housekeeping"

const taskSchema = z.object({
  room_id: z.string().min(1, "Xona raqami kiritilishi shart"),
  priority: z.enum(["low", "medium", "high", "urgent"] as const) as z.ZodType<TaskPriority>,
  notes: z.string().optional(),
  scheduled_date: z.string().min(1, "Sana kiritilishi shart"),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  onSuccess?: () => void
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rooms, setRooms] = useState<Array<{ id: string; room_number: string }>>([])

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: "medium",
      scheduled_date: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    async function loadRooms() {
      try {
        const { data, error } = await roomsService.getAllRooms()
        if (error) throw error
        if (data) {
          setRooms(data.map(room => ({
            id: room.id,
            room_number: room.room_number
          })))
        }
      } catch (error) {
        console.error("Error loading rooms:", error)
        toast({
          title: "Xatolik",
          description: "Xonalar ro'yxatini yuklashda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    }
    loadRooms()
  }, [toast])

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true)
      
      // Find the room by room number
      const room = rooms.find(r => r.room_number === data.room_id)
      if (!room) {
        throw new Error("Xona topilmadi")
      }

      const { error } = await housekeepingService.createTask({
        room_number: data.room_id,
        task_type: "room_cleaning" as TaskType,
        status: "pending",
        priority: data.priority,
        assigned_to: undefined,
        notes: data.notes || "",
        scheduled_start: data.scheduled_date,
      })

      if (error) throw error

      toast({
        title: "Muvaffaqiyatli",
        description: "Yangi tozalash vazifasi muvaffaqiyatli yaratildi",
      })

      onSuccess?.()
    } catch (error: any) {
      console.error("Error creating task:", error)
      toast({
        title: "Xatolik",
        description: error.message || "Vazifa yaratishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="room_id">Xona raqami</Label>
        <Select
          onValueChange={(value) => form.setValue("room_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Xonani tanlang" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.room_number}>
                {room.room_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.room_id && (
          <p className="text-sm text-red-500">{form.formState.errors.room_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Ahamiyati</Label>
        <Select
          onValueChange={(value) => form.setValue("priority", value as TaskFormData["priority"])}
          defaultValue="medium"
        >
          <SelectTrigger>
            <SelectValue placeholder="Ahamiyatni tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent">Shoshilinch</SelectItem>
            <SelectItem value="high">Yuqori</SelectItem>
            <SelectItem value="medium">O'rta</SelectItem>
            <SelectItem value="low">Past</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.priority && (
          <p className="text-sm text-red-500">{form.formState.errors.priority.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduled_date">Sana</Label>
        <FormField
          control={form.control}
          name="scheduled_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                    disabled={(date: Date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.scheduled_date && (
          <p className="text-sm text-red-500">{form.formState.errors.scheduled_date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Qo'shimcha ma'lumotlar</Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          placeholder="Qo'shimcha ma'lumotlar..."
        />
        {form.formState.errors.notes && (
          <p className="text-sm text-red-500">{form.formState.errors.notes.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Yaratilmoqda..." : "Vazifa yaratish"}
      </Button>
    </form>
  )
} 