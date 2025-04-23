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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { guestsService } from "@/services/guests-service"

const guestFormSchema = z.object({
  first_name: z.string().min(1, "Ism kiritilishi shart"),
  last_name: z.string().min(1, "Familiya kiritilishi shart"),
  email: z.string().email("Noto'g'ri email formati"),
  phone: z.string().min(1, "Telefon raqami kiritilishi shart").nullable().optional(),
  address: z.string().nullable().optional(),
  document_type: z.string().nullable().optional(),
  document_number: z.string().nullable().optional(),
  is_vip: z.boolean().default(false),
  loyalty_points: z.number().default(0),
  notes: z.string().nullable().optional(),
})

type GuestFormValues = z.infer<typeof guestFormSchema>

interface GuestFormProps {
  initialData?: any
  onSuccess?: () => void
}

export function GuestForm({ initialData, onSuccess }: GuestFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: initialData || {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      document_type: "",
      document_number: "",
      is_vip: false,
      loyalty_points: 0,
      notes: "",
    },
  })

  async function onSubmit(data: GuestFormValues) {
    try {
      setLoading(true)
      
      const guestData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        is_vip: data.is_vip,
        loyalty_points: data.loyalty_points,
        notes: data.notes || null,
      }

      let result;
      if (initialData) {
        const { data: updatedData, error } = await supabase
          .from("guests")
          .update(guestData)
          .eq("id", initialData.id)
          .select()
          .single();
        
        result = { data: updatedData, error };
      } else {
        const { data: newData, error } = await supabase
          .from("guests")
          .insert([guestData])
          .select()
          .single();
        
        result = { data: newData, error };
      }

      if (result.error) {
        throw new Error(result.error.message || "Mehmon qo'shishda xatolik yuz berdi")
      }

      if (result.data && (data.document_type || data.document_number)) {
        try {
          const docUpdateData = {
            document_type: data.document_type || null,
            document_number: data.document_number || null
          };
          
          await supabase
            .from("guests")
            .update(docUpdateData)
            .eq("id", result.data.id);
        } catch (docError) {
          console.error("Document fields update failed:", docError);
        }
      }

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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manzil</FormLabel>
              <FormControl>
                <Textarea placeholder="Manzilni kiriting" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hujjat turi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Hujjat turini tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="passport">Pasport</SelectItem>
                  <SelectItem value="id_card">ID karta</SelectItem>
                  <SelectItem value="driver_license">Haydovchilik guvohnomasi</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hujjat raqami</FormLabel>
              <FormControl>
                <Input placeholder="Hujjat raqamini kiriting" {...field} value={field.value || ""} />
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

        <FormField
          control={form.control}
          name="loyalty_points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sodiqlik ballari</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Sodiqlik ballarini kiriting"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saqlanmoqda..." : initialData ? "O'zgartirishlarni saqlash" : "Mehmon qo'shish"}
        </Button>
      </form>
    </Form>
  )
} 