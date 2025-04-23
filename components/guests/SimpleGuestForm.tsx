"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/app/lib/supabase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Simple schema with only essential fields, no document_number
const simpleGuestSchema = z.object({
  first_name: z.string().min(1, "Ism kiritilishi shart"),
  last_name: z.string().min(1, "Familiya kiritilishi shart"),
  email: z.string().email("Noto'g'ri email formati"),
  phone: z.string().min(1, "Telefon raqami kiritilishi shart").nullable().optional(),
  is_vip: z.boolean().default(false),
})

type SimpleGuestFormValues = z.infer<typeof simpleGuestSchema>

interface SimpleGuestFormProps {
  onSuccess?: () => void
}

export function SimpleGuestForm({ onSuccess }: SimpleGuestFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<SimpleGuestFormValues>({
    resolver: zodResolver(simpleGuestSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      is_vip: false,
    },
  })

  async function onSubmit(data: SimpleGuestFormValues) {
    try {
      setLoading(true)
      
      const guestData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        is_vip: data.is_vip,
      }

      // Direct insert with Supabase
      const { data: newGuest, error } = await supabase
        .from("guests")
        .insert([guestData])
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || "Mehmon qo'shishda xatolik yuz berdi")
      }

      toast({
        title: "Muvaffaqiyatli",
        description: "Yangi mehmon muvaffaqiyatli qo'shildi",
      })

      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error("Mehmon qo'shishda xatolik:", error)
      toast({
        title: "Xatolik",
        description: error instanceof Error ? error.message : "Mehmon qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ism</FormLabel>
                <FormControl>
                  <Input placeholder="Ismni kiriting" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Familiya</FormLabel>
                <FormControl>
                  <Input placeholder="Familiyani kiriting" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Emailni kiriting" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon raqami</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Telefon raqamini kiriting" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_vip"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>VIP mehmon</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Bu mehmon VIP mehmon sifatida belgilansin
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saqlanmoqda..." : "Mehmon qo'shish"}
        </Button>
      </form>
    </Form>
  )
} 