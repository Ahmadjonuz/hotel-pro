"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    async function fetchRooms() {
      try {
        const { data, error } = await supabase.from("rooms").select("*")

        if (error) throw error

        setRooms(data || [])
      } catch (error) {
        console.error("Xonalarni yuklashda xatolik:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  // Qidiruv va filtrlar asosida xonalarni filtrlash
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || room.type === typeFilter
    const matchesStatus = statusFilter === "all" || room.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Bo'sh</Badge>
      case "occupied":
        return <Badge className="bg-blue-100 text-blue-800">Band</Badge>
      case "cleaning":
        return <Badge className="bg-amber-100 text-amber-800">Tozalanmoqda</Badge>
      case "maintenance":
        return <Badge className="bg-red-100 text-red-800">Texnik xizmatda</Badge>
      default:
        return null
    }
  }

  return (
    <div className="flex-1">
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Xonalar</h1>
            <p className="text-muted-foreground">Mehmonxona xonalarini boshqaring</p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Xona qo'shish
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Xonalarni qidirish..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Xona turi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha turlar</SelectItem>
              <SelectItem value="standard">Standart</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
              <SelectItem value="suite">Lyuks</SelectItem>
              <SelectItem value="executive">Biznes</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Holat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha holatlar</SelectItem>
              <SelectItem value="available">Bo'sh</SelectItem>
              <SelectItem value="occupied">Band</SelectItem>
              <SelectItem value="maintenance">Texnik xizmatda</SelectItem>
              <SelectItem value="cleaning">Tozalanmoqda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Xonalar yuklanmoqda...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium">Xonalar topilmadi</p>
            <p className="text-muted-foreground">Qidiruv yoki filtrlarni o'zgartiring</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{room.room_number}-xona</h3>
                      <p className="text-sm text-muted-foreground">
                        {room.type.charAt(0).toUpperCase() + room.type.slice(1)} xona
                      </p>
                    </div>
                    {getStatusBadge(room.status)}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground mb-4">{room.description}</p>
                  <div className="flex items-center text-muted-foreground">
                    <span className="text-sm">Sig'imi: {room.capacity} kishi</span>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t pt-3">
                  <div className="font-semibold">
                    {typeof room.price_per_night === "number"
                      ? room.price_per_night.toLocaleString('uz-UZ', { style: 'currency', currency: 'UZS' })
                      : Number.parseFloat(room.price_per_night).toLocaleString('uz-UZ', { style: 'currency', currency: 'UZS' })}
                    <span className="text-sm font-normal text-muted-foreground">/tun</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Batafsil
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

