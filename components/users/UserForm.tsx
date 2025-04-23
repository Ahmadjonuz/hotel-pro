"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { userService, type UserProfile, type UserRole } from "@/services/user-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"

const userSchema = z.object({
  email: z.string().email("Noto'g'ri email format"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak")
    .optional()
    .refine(val => {
      // If creating a new user, password is required
      return val !== undefined && val.length > 0;
    }, {
      message: "Yangi foydalanuvchi uchun parol kiritish majburiy",
      path: ["password"]
    }),
  full_name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
  phone: z.string().min(9, "Telefon raqam kamida 9 ta raqamdan iborat bo'lishi kerak"),
  role: z.enum(["admin", "manager", "receptionist"] as const)
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormProps {
  user?: UserProfile | null
  onSuccess: () => void
  onCancel: () => void
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      role: user?.role || "receptionist"
    }
  })

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true)
    try {
      if (user) {
        // Update existing user
        const { error } = await userService.updateUserProfile(user.id, {
          full_name: data.full_name,
          phone: data.phone,
          role: data.role
        })
        if (error) {
          console.error("Error updating user:", error);
          throw error;
        }
        toast({
          title: "Muvaffaqiyatli",
          description: "Foydalanuvchi ma'lumotlari yangilandi",
        })
      } else {
        // Create new user - ensure password is provided
        if (!data.password) {
          toast({
            title: "Xatolik",
            description: "Yangi foydalanuvchi uchun parol kiritish majburiy",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        const { error } = await userService.createUser(data.email, data.password, {
          full_name: data.full_name,
          phone: data.phone,
          role: data.role
        })
        if (error) {
          console.error("Error creating user:", error);
          throw error;
        }
        toast({
          title: "Muvaffaqiyatli",
          description: "Yangi foydalanuvchi qo'shildi",
        })
      }
      onSuccess()
    } catch (error: any) {
      console.error("Form submission error:", error);
      let errorMessage = "Xatolik yuz berdi";
      
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = error.message;
        } else if ('error' in error && typeof error.error === 'object' && 'message' in error.error) {
          errorMessage = error.error.message;
        }
      }
      
      toast({
        title: "Xatolik",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!user && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email manzili" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!user && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parol</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Parol" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>F.I.O</FormLabel>
              <FormControl>
                <Input placeholder="To'liq ism" {...field} />
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
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input placeholder="+998901234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Rolni tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Menejer</SelectItem>
                  <SelectItem value="receptionist">Qabul xodimi</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saqlanmoqda..." : user ? "Saqlash" : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 