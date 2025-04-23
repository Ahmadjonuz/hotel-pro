"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import type { MaintenanceTask } from "@/types/supabase"

const formSchema = z.object({
  title: z.string().min(1, "Sarlavha kiritilishi shart"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  room_id: z.string().optional(),
  assigned_to: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface MaintenanceFormProps {
  task?: MaintenanceTask
  onSuccess?: () => void
}

export function MaintenanceForm({ task, onSuccess }: MaintenanceFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "pending",
      room_id: task?.room_id || "",
      assigned_to: task?.assigned_to || "",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true)
      
      if (task) {
        // Update existing task
        const { data: updatedData, error } = await supabase
          .from("maintenance_tasks")
          .update({
            title: data.title,
            description: data.description,
            status: data.status,
            room_id: data.room_id || null,
            assigned_to: data.assigned_to || null
          })
          .eq("id", task.id)
          .select()
        
        if (error) {
          console.error("Update error:", error)
          throw error
        }
        
        toast({
          title: "Vazifa muvaffaqiyatli yangilandi",
        })
      } else {
        // Create new task
        const { data: newData, error } = await supabase
          .from("maintenance_tasks")
          .insert([{
            title: data.title,
            description: data.description,
            status: data.status,
            room_id: data.room_id || null,
            assigned_to: data.assigned_to || null
          }])
          .select()
        
        if (error) {
          console.error("Insert error:", error)
          throw error
        }
        
        toast({
          title: "Yangi vazifa muvaffaqiyatli qo'shildi",
        })
      }

      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Error saving task:", error)
      toast({
        title: "Xatolik yuz berdi",
        description: error instanceof Error ? error.message : "Vazifani saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          {task ? "Vazifani tahrirlash" : "Yangi vazifa"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Vazifani tahrirlash" : "Yangi vazifa"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Vazifa ma'lumotlarini tahrirlang"
              : "Yangi texnik xizmat vazifasini qo'shing"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sarlavha</FormLabel>
                  <FormControl>
                    <Input placeholder="Vazifa sarlavhasi" {...field} />
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
                      placeholder="Vazifa haqida qo'shimcha ma'lumot"
                      className="resize-none"
                      {...field}
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
                        <SelectValue placeholder="Vazifa holatini tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Kutilmoqda</SelectItem>
                      <SelectItem value="in_progress">Jarayonda</SelectItem>
                      <SelectItem value="completed">Bajarildi</SelectItem>
                      <SelectItem value="cancelled">Bekor qilindi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 