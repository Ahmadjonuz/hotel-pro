"use client"

import { useState, useEffect } from "react"
import { Plus, Search, BedDouble, Home, Users, Loader2, Filter, ArrowUpRight, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { RoomForm } from "@/components/rooms/RoomForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableSkeleton } from "@/components/loading-skeleton"
import { formatCurrency } from "@/lib/utils"
import { ClientFormattedCurrency } from "@/components/ui/client-formatted-currency"

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState("grid")

  useEffect(() => {
    fetchRooms()
  }, [])

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

  // Qidiruv va filtrlar asosida xonalarni filtrlash
  const filteredRooms = rooms.filter((room) => {
    // Search term filtering
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === "" || 
      room.room_number.toLowerCase().includes(searchTermLower) ||
      (room.description && room.description.toLowerCase().includes(searchTermLower))

    // Type filtering
    const matchesType = typeFilter === "all" || room.type === typeFilter

    // Status filtering
    const matchesStatus = statusFilter === "all" || room.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Room statistics
  const stats = {
    total: rooms.length,
    available: rooms.filter(room => room.status === 'available').length,
    occupied: rooms.filter(room => room.status === 'occupied').length,
    maintenance: rooms.filter(room => room.status === 'maintenance').length,
    cleaning: rooms.filter(room => room.status === 'cleaning').length
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Bo'sh</Badge>
      case "occupied":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Band</Badge>
      case "cleaning":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Tozalanmoqda</Badge>
      case "maintenance":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Texnik xizmatda</Badge>
      default:
        return null
    }
  }

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case "standard": return "Standart"
      case "deluxe": return "Deluxe"
      case "suite": return "Lyuks"
      case "executive": return "Biznes"
      default: return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  return (
    <div className="flex-1">
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Xonalar</h1>
            <p className="text-muted-foreground">Mehmonxona xonalarini boshqaring</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Xona qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yangi xona qo'shish</DialogTitle>
              </DialogHeader>
              <RoomForm
                onSuccess={() => {
                  setIsAddDialogOpen(false)
                  fetchRooms()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Jami xonalar</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <Home className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground mt-1">Barcha xonalar</p>
            </CardContent>
          </Card>
          
          <Card className="hover-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bo'sh xonalar</CardTitle>
              <div className="p-2 bg-green-50 rounded-full dark:bg-green-900/20">
                <BedDouble className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold">{stats.available}</div>
                <div className="text-sm text-green-600 dark:text-green-500 font-medium">
                  {stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Bron qilish uchun tayyor</p>
            </CardContent>
          </Card>
          
          <Card className="hover-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Band xonalar</CardTitle>
              <div className="p-2 bg-blue-50 rounded-full dark:bg-blue-900/20">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold">{stats.occupied}</div>
                <div className="text-sm text-blue-600 dark:text-blue-500 font-medium">
                  {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Hozirda foydalanilmoqda</p>
            </CardContent>
          </Card>
          
          <Card className="hover-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Xizmatdagi xonalar</CardTitle>
              <div className="p-2 bg-amber-50 rounded-full dark:bg-amber-900/20">
                <span className="flex items-center justify-center h-5 w-5 text-amber-600 dark:text-amber-500 font-semibold">
                  {stats.maintenance + stats.cleaning}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.maintenance + stats.cleaning}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.maintenance} ta xizmatda, {stats.cleaning} ta tozalanmoqda
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Xonalar boshqaruvi</CardTitle>
                <CardDescription>Barcha xonalarni boshqarish va nazorat qilish</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                  <TabsList className="grid grid-cols-2 h-8 w-[120px]">
                    <TabsTrigger value="grid" className="px-2 text-xs">Katalog</TabsTrigger>
                    <TabsTrigger value="list" className="px-2 text-xs">Ro'yxat</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Xona raqami, turi yoki tavsifi bo'yicha qidirish..."
                  className="w-full pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
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
                  <SelectTrigger className="w-[140px]">
                    <BedDouble className="h-4 w-4 mr-2" />
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setSearchTerm("")
                    setTypeFilter("all")
                    setStatusFilter("all")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-24">
                <Loader2 className="inline-block h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Xonalar yuklanmoqda...</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-16 border border-dashed rounded-lg">
                <BedDouble className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-lg font-medium">Xonalar topilmadi</p>
                <p className="text-muted-foreground mb-4">Qidiruv yoki filtrlarni o'zgartiring</p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("")
                  setTypeFilter("all")
                  setStatusFilter("all")
                }} className="mt-2">
                  Filtrlarni tozalash
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden hover-effect">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium">{room.room_number}-xona</h3>
                          <p className="text-sm text-muted-foreground">
                            {getRoomTypeLabel(room.type)}
                          </p>
                        </div>
                        {getStatusBadge(room.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{room.description || "Tavsif mavjud emas"}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-primary/5 text-primary/90 hover:bg-primary/10">
                            Sig'imi: {room.capacity} kishi
                          </Badge>
                          <Badge variant="outline" className="bg-primary/5 text-primary/90 hover:bg-primary/10">
                            {room.floor || 1}-qavat
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t pt-3">
                      <div className="font-semibold">
                        <ClientFormattedCurrency amount={Number(room.price_per_night)} />
                        <span className="text-sm font-normal text-muted-foreground">/tun</span>
                      </div>
                      <Link href={`/rooms/${room.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          Batafsil
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Xona</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Turi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Holati</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sig'imi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Narxi</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Harakatlar</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {filteredRooms.map((room) => (
                      <tr key={room.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium">{room.room_number}</div>
                          <div className="text-xs text-muted-foreground">{room.floor || 1}-qavat</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getRoomTypeLabel(room.type)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(room.status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {room.capacity} kishi
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <ClientFormattedCurrency amount={Number(room.price_per_night)} />
                          <span className="text-xs text-muted-foreground">/tun</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <Link href={`/rooms/${room.id}`}>
                            <Button variant="outline" size="sm">
                              Batafsil
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t py-3">
            <div className="text-sm text-muted-foreground">
              Jami: <strong>{filteredRooms.length}</strong> ta xona
            </div>
            <Button variant="outline" size="sm">
              Barcha xonalarni ko'rish
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

