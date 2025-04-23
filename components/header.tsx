"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Search, User, ChevronDown, Settings, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications"

export function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (user !== null && user.id) {
        // Fetch user profile data
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        
        if (!error && data) {
          setProfile(data)
        }
      }
    }
    
    fetchProfile()
  }, [user])

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

  // Get page title based on pathname
  const getPageTitle = () => {
    const path = pathname.split("/")[1]
    if (!path) return "Bosh sahifa"

    const titles: { [key: string]: string } = {
      dashboard: "Boshqaruv paneli",
      bookings: "Bronlar",
      rooms: "Xonalar",
      guests: "Mehmonlar",
      maintenance: "Texnik xizmat",
      housekeeping: "Tozalash xizmati",
      staff: "Xodimlar",
      settings: "Sozlamalar",
      billing: "Hisob-kitob",
    }

    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const query = formData.get("search") as string

    if (query.trim()) {
      toast({
        title: "Qidiruv boshlandi",
        description: `"${query}" so'rovi bo'yicha qidirilmoqda`,
      })
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <div className="flex flex-1 items-center gap-4">
        <form onSubmit={handleSearch} className="relative hidden md:flex">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            type="search" 
            name="search" 
            placeholder="Qidirish..." 
            className="w-64 rounded-full bg-muted/40 border-0 pl-9 focus-visible:ring-primary/20" 
          />
        </form>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationCenter />
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Link href="/support">
            <HelpCircle className="h-5 w-5" />
          </Link>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1.5 pr-2.5">
              <Avatar className="h-7 w-7">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">
                {profile?.full_name || user?.email || "User"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Sozlamalar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <span className="text-sm">Chiqish</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

