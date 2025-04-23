"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@hotel.com")
  const [password, setPassword] = useState("admin2125")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Reset any previous session
      await supabase.auth.signOut()
      
      // Try login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(`Xatolik yuz berdi: ${error.message}`)
        console.error("Login error:", error)
        return
      }

      if (!data.session) {
        toast.error("Sessiya ma'lumotlari topilmadi")
        console.error("No session data")
        return
      }

      // Explicitly set cookies
      document.cookie = `sb-access-token=${data.session.access_token};path=/;max-age=86400;SameSite=Lax`
      document.cookie = `sb-refresh-token=${data.session.refresh_token};path=/;max-age=86400;SameSite=Lax`
      
      toast.success("Tizimga muvaffaqiyatli kirdingiz!")
      
      // Hard redirect
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 500)
    } catch (error: any) {
      toast.error(`Kutilmagan xatolik: ${error.message}`)
      console.error("Login exception:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tizimga kirish</CardTitle>
          <CardDescription>Tizimga kirish uchun ma'lumotlaringizni kiriting</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@hotel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Kirish..." : "Kirish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 