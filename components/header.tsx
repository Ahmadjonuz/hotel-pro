"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { NotificationCenter } from "@/components/notifications"
import { toast } from "@/components/ui/use-toast"

export function Header() {
  const pathname = usePathname()

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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center gap-4">
        <form onSubmit={handleSearch} className="relative hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" name="search" placeholder="Qidirish..." className="w-64 pl-8" />
        </form>
      </div>
      <div className="flex items-center gap-2">
        <NotificationCenter />
      </div>
    </header>
  )
}

