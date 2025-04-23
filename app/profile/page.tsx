"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { User, Phone, Mail, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const profileSchema = z.object({
  full_name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
  phone: z.string().min(9, "Telefon raqam kamida 9 ta raqamdan iborat bo'lishi kerak").optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
    }
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (user !== null && user.id) {
        setLoading(true)
        // Fetch user profile data
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        
        if (!error && data) {
          setProfile(data)
          form.reset({
            full_name: data.full_name || "",
            phone: data.phone || "",
          })
        }
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [user, form])

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')
        .map((part: string) => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    
    return user?.email ? user.email.substring(0, 2).toUpperCase() : "JD"
  }

  // Get role display name
  const getRoleDisplay = (role: string) => {
    const roles: { [key: string]: string } = {
      admin: "Administrator",
      manager: "Menejer",
      receptionist: "Qabul xodimi"
    }
    return roles[role] || role
  }

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
        })
        .eq("id", user.id)
      
      if (error) throw error

      // Update local state
      setProfile({
        ...profile,
        full_name: data.full_name,
        phone: data.phone,
      })

      toast({
        title: "Muvaffaqiyatli",
        description: "Profil ma'lumotlari yangilandi",
      })
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "Profil yangilanmadi",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profil yuklanmoqda...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Mening profilim</CardTitle>
            <CardDescription>
              Profil ma'lumotlarini ko'rish va tahrirlash
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-28 w-28">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                    {getRoleDisplay(profile?.role || "user")}
                  </Badge>
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>F.I.O</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <User className="mr-2 h-4 w-4 text-muted-foreground mt-3" />
                                <Input placeholder="To'liq ism" {...field} />
                              </div>
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
                              <div className="flex">
                                <Phone className="mr-2 h-4 w-4 text-muted-foreground mt-3" />
                                <Input placeholder="+998901234567" {...field} value={field.value || ""} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={updating}>
                        {updating ? "Saqlanmoqda..." : "Saqlash"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Xavfsizlik</CardTitle>
            <CardDescription>
              Hisobingiz xavfsizligi bilan bog'liq sozlamalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Parolni o'zgartirish</div>
                    <div className="text-sm text-muted-foreground">Hisobingiz parolini yangilash</div>
                  </div>
                </div>
                <Button variant="outline">O'zgartirish</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 