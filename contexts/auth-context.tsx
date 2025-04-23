"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        toast({
          title: "Xatolik yuz berdi",
          description: error.message,
          variant: "destructive",
        })
        return { error }
      }
      
      if (data?.user) {
        setUser(data.user)
        setSession(data.session)
        toast({
          title: "Xush kelibsiz!",
          description: `${data.user.email} sifatida tizimga kirdingiz`,
        })
      }
      
      return { error: null }
    } catch (error: any) {
      toast({
        title: "Xatolik yuz berdi",
        description: "Kutilmagan xatolik yuz berdi",
        variant: "destructive",
      })
      return { error: error.message || "Kutilmagan xatolik yuz berdi" }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })
      
      if (error) {
        toast({
          title: "Ro'yxatdan o'tishda xatolik",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi",
          description: "Iltimos, hisobingizni tasdiqlash uchun emailingizni tekshiring.",
        })
      }
      
      return { error }
    } catch (error: any) {
      toast({
        title: "Ro'yxatdan o'tishda xatolik",
        description: "Kutilmagan xatolik yuz berdi",
        variant: "destructive",
      })
      return { error: error.message || "Kutilmagan xatolik yuz berdi" }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        setSession(null)
        toast({
          title: "Tizimdan chiqdingiz",
          description: "Siz muvaffaqiyatli tizimdan chiqdingiz",
        })
      } else {
        toast({
          title: "Xatolik yuz berdi",
          description: error.message,
          variant: "destructive",
        })
      }
      return { error }
    } catch (error: any) {
      toast({
        title: "Xatolik yuz berdi",
        description: "Kutilmagan xatolik yuz berdi",
        variant: "destructive",
      })
      return { error: error.message || "Kutilmagan xatolik yuz berdi" }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) {
        toast({
          title: "Parolni tiklashda xatolik",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Parolni tiklash xati yuborildi",
          description: "Iltimos, parolni tiklash havolasi uchun emailingizni tekshiring.",
        })
      }
      
      return { error }
    } catch (error: any) {
      toast({
        title: "Parolni tiklashda xatolik",
        description: "Kutilmagan xatolik yuz berdi",
        variant: "destructive",
      })
      return { error: error.message || "Kutilmagan xatolik yuz berdi" }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

