import Link from "next/link"
import { Home, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GuestsTable } from "@/components/guests-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GuestsPage() {
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
            <Link href="/bookings" className="text-sm font-medium underline-offset-4 hover:underline">
              Bronlar
            </Link>
            <Link href="/rooms" className="text-sm font-medium underline-offset-4 hover:underline">
              Xonalar
            </Link>
            <Link href="/guests" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Mehmonlar
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mehmonlar</h1>
            <p className="text-muted-foreground">Mehmonxona mehmonlari ma'lumotlarini boshqaring</p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Mehmon qo'shish
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Mehmonlarni qidirish..." className="w-full pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Holat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha holatlar</SelectItem>
              <SelectItem value="active">Faol</SelectItem>
              <SelectItem value="checked-out">Chiqib ketgan</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="recent">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Saralash" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Eng so'nggi</SelectItem>
              <SelectItem value="name-asc">Ism (A-Z)</SelectItem>
              <SelectItem value="name-desc">Ism (Z-A)</SelectItem>
              <SelectItem value="visits">Ko'p tashrif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <GuestsTable />
      </main>
    </div>
  )
}

