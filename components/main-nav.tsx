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
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function MainNav() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [open, setOpen] = useState(false)

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
      href: "/maintenance",
      label: "Texnik xizmat",
      icon: <Tool className="h-5 w-5" />,
      active: pathname === "/maintenance",
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
        <SheetContent side="left" className="p-0 w-[240px]">
          <nav className="flex flex-col h-full">
            <div className="flex items-center h-16 px-6 border-b">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                <Home className="h-6 w-6 text-rose-600" />
                <span className="text-xl">HotelPro</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 px-3 py-4">
              <div className="space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                      route.active ? "bg-muted font-medium text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {route.icon}
                    {route.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-rose-100 text-rose-800">JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Hotel Manager</p>
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
                      Toggle Theme
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <nav className="hidden lg:flex flex-col h-screen w-[240px] border-r">
        <div className="flex items-center h-16 px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6 text-rose-600" />
            <span className="text-xl">HotelPro</span>
          </Link>
        </div>
        <div className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                  route.active ? "bg-muted font-medium text-primary" : "text-muted-foreground"
                }`}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-rose-100 text-rose-800">JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Hotel Manager</p>
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
                  Toggle Theme
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  )
}

