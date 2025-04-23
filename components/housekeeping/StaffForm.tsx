"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import type { HousekeepingStaff, StaffStatus } from "@/types/housekeeping"

const staffStatuses: StaffStatus[] = ['available', 'busy', 'off', 'on_break']
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const specializations = [
  'Room Cleaning',
  'Deep Cleaning',
  'Laundry',
  'Public Areas',
  'Turndown Service',
  'VIP Services',
  'Supervisor',
  'Team Lead'
]

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  job_position: z.string().min(1, "Job position is required"),
  status: z.enum(['available', 'busy', 'off', 'on_break']),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  shift_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  shift_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  days_off: z.array(z.string()).optional(),
  specialization: z.array(z.string()).optional(),
  max_daily_tasks: z.number().min(1).max(50),
  performance_rating: z.number().min(0).max(5).optional()
})

type FormData = z.infer<typeof formSchema>

interface StaffFormProps {
  initialData?: Partial<HousekeepingStaff>
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

export function StaffForm({ initialData, onSubmit, onCancel }: StaffFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      job_position: initialData?.job_position || "",
      status: initialData?.status || "available",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      shift_start: initialData?.shift_start || "",
      shift_end: initialData?.shift_end || "",
      days_off: initialData?.days_off || [],
      specialization: initialData?.specialization || [],
      max_daily_tasks: initialData?.max_daily_tasks || 10,
      performance_rating: initialData?.performance_rating || 0
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Asosiy ma'lumotlar</h3>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ism</FormLabel>
                  <FormControl>
                    <Input placeholder="Xodim ismini kiriting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job_position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lavozim</FormLabel>
                  <FormControl>
                    <Input placeholder="Lavozimni kiriting" {...field} />
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
                      {staffStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === 'available' ? 'Mavjud' :
                           status === 'busy' ? 'Band' :
                           status === 'off' ? 'Dam olish' :
                           'Tanaffusda'}
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
              name="max_daily_tasks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kunlik vazifalar soni</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      max={50}
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Aloqa ma'lumotlari</h3>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefon raqamini kiriting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email manzilini kiriting" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shift_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ish boshlanish vaqti</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="time"
                          placeholder="HH:MM"
                          {...field}
                        />
                        <Clock className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shift_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ish tugash vaqti</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="time"
                          placeholder="HH:MM"
                          {...field}
                        />
                        <Clock className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Qo'shimcha ma'lumotlar</h3>
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="days_off"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dam olish kunlari</FormLabel>
                  <FormControl>
                    <MultiSelect
                      selected={field.value || []}
                      options={daysOfWeek.map(day => ({
                        label: day,
                        value: day
                      }))}
                      onChange={(values) => field.onChange(values)}
                      placeholder="Dam olish kunlarini tanlang"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mutaxassislik</FormLabel>
                  <FormControl>
                    <MultiSelect
                      selected={field.value || []}
                      options={specializations.map(spec => ({
                        label: spec,
                        value: spec
                      }))}
                      onChange={(values) => field.onChange(values)}
                      placeholder="Mutaxassislikni tanlang"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Bekor qilish
          </Button>
          <Button type="submit">
            {initialData ? "O'zgartirish" : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 