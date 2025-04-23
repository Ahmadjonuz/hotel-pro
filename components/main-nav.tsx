"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart,
  BedDouble,
  CalendarRange,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
  X,
  Check,
  PenToolIcon as Tool,
  Hotel,
  Bell,
  HelpCircle,
  User
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { NotificationCenter } from "@/components/notifications"

export function MainNav() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [open, setOpen] = useState(false)
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

  const handleLogout = async () => {
    await signOut()
  }

  const routes = [
    {
      href: "/dashboard",
      label: "Boshqaruv paneli",
      icon: <Home className="h-5 w-5" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/bookings",
      label: "Bronlar",
      icon: <CalendarRange className="h-5 w-5" />,
      active: pathname === "/bookings" || pathname.startsWith("/bookings/"),
      badge: 3
    },
    {
      href: "/rooms",
      label: "Xonalar",
      icon: <BedDouble className="h-5 w-5" />,
      active: pathname === "/rooms" || pathname.startsWith("/rooms/"),
    },
    {
      href: "/guests",
      label: "Mehmonlar",
      icon: <Users className="h-5 w-5" />,
      active: pathname === "/guests" || pathname.startsWith("/guests/"),
    },
    {
      href: "/calendar",
      label: "Taqvim",
      icon: <CalendarRange className="h-5 w-5" />,
      active: pathname === "/calendar",
    },
    {
      href: "/housekeeping",
      label: "Tozalash xizmati",
      icon: <Check className="h-5 w-5" />,
      active: pathname === "/housekeeping",
    },
    {
      href: "/billing",
      label: "Hisob-kitob",
      icon: <CreditCard className="h-5 w-5" />,
      active: pathname === "/billing",
    },
    {
      href: "/reports",
      label: "Hisobotlar",
      icon: <BarChart className="h-5 w-5" />,
      active: pathname === "/reports",
    },
    {
      href: "/settings",
      label: "Sozlamalar",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/settings" || pathname.startsWith("/settings/"),
    },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <nav className="flex flex-col h-full">
            <div className="flex items-center h-16 px-6 border-b bg-primary/5">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                <Hotel className="h-6 w-6 text-primary" />
                <span className="text-xl">HotelPro</span>
              </Link>
              <NotificationCenter />
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 px-3 py-6">
              <div className="space-y-0.5">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-primary/10 ${
                      route.active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${route.active ? "text-primary" : "text-muted-foreground"}`}>
                        {route.icon}
                      </div>
                      {route.label}
                    </div>
                    {route.badge && (
                      <Badge variant="secondary" className="ml-auto">{route.badge}</Badge>
                    )}
                  </Link>
                ))}
              </div>
              
              <div className="mt-8 mb-4">
                <p className="px-3 text-xs uppercase font-medium text-muted-foreground mb-2">Yordam</p>
                <Link 
                  href="/support" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-primary/10 text-muted-foreground"
                >
                  <HelpCircle className="h-5 w-5" />
                  Yordam Markazi
                </Link>
              </div>
            </div>
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-primary/10 text-primary">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{profile?.full_name || user?.email || "User"}</p>
                  <p className="text-xs text-muted-foreground">{profile?.role === 'admin' ? 'Administrator' : profile?.role === 'manager' ? 'Hotel Manager' : 'Receptionist'}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                      Mavzuni almashtirish
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Chiqish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <nav className="hidden lg:flex flex-col h-screen w-[280px] border-r bg-card">
        <div className="flex items-center h-16 px-6 border-b bg-primary/5">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Hotel className="h-6 w-6 text-primary" />
            <span className="text-xl">HotelPro</span>
          </Link>
          <NotificationCenter />
        </div>
        <div className="flex-1 px-3 py-6 overflow-auto">
          <div className="space-y-0.5">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-primary/10 ${
                  route.active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${route.active ? "text-primary" : "text-muted-foreground"}`}>
                    {route.icon}
                  </div>
                  {route.label}
                </div>
                {route.badge && (
                  <Badge variant="secondary" className="ml-auto">{route.badge}</Badge>
                )}
              </Link>
            ))}
          </div>
          
          <div className="mt-8 mb-4">
            <p className="px-3 text-xs uppercase font-medium text-muted-foreground mb-2">Yordam</p>
            <Link 
              href="/support" 
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-primary/10 text-muted-foreground"
            >
              <HelpCircle className="h-5 w-5" />
              Yordam Markazi
            </Link>
          </div>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-primary/10 text-primary">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{profile?.full_name || user?.email || "User"}</p>
              <p className="text-xs text-muted-foreground">{profile?.role === 'admin' ? 'Administrator' : profile?.role === 'manager' ? 'Hotel Manager' : 'Receptionist'}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  Mavzuni almashtirish
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  )
}

