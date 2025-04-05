import Link from "next/link"
import { Home, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookingsTable } from "@/components/bookings-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BookingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6 text-rose-600" />
            <span className="text-xl">HotelPro</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-medium underline-offset-4 hover:underline">
              Boshqaruv paneli
            </Link>
            <Link href="/bookings" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Bronlar
            </Link>
            <Link href="/rooms" className="text-sm font-medium underline-offset-4 hover:underline">
              Xonalar
            </Link>
            <Link href="/guests" className="text-sm font-medium underline-offset-4 hover:underline">
              Mehmonlar
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bronlar</h1>
            <p className="text-muted-foreground">Barcha mehmonxona bronlarini bir joyda boshqaring</p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Yangi bron
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Bronlarni qidirish..." className="w-full pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Holat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha holatlar</SelectItem>
              <SelectItem value="confirmed">Tasdiqlangan</SelectItem>
              <SelectItem value="checked-in">Ro'yxatdan o'tgan</SelectItem>
              <SelectItem value="checked-out">Chiqib ketgan</SelectItem>
              <SelectItem value="cancelled">Bekor qilingan</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="30">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Vaqt oralig'i" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">So'nggi 7 kun</SelectItem>
              <SelectItem value="30">So'nggi 30 kun</SelectItem>
              <SelectItem value="90">So'nggi 90 kun</SelectItem>
              <SelectItem value="all">Barcha vaqt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <BookingsTable />
      </main>
    </div>
  )
}

