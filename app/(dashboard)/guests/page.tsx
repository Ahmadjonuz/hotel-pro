"use client"

import { useState, useEffect } from "react"
import { Plus, Search, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Globe2, FileText, X, Trash, MoreHorizontal, Edit } from "lucide-react"
import { guestsService } from "@/services/guests-service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { SimpleGuestForm } from "@/components/guests/SimpleGuestForm"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [nationalityFilter, setNationalityFilter] = useState("all")
  const [idTypeFilter, setIdTypeFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("last_name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [guestToDelete, setGuestToDelete] = useState<any>(null)

  useEffect(() => {
    fetchGuests()
  }, [sortBy, sortDirection])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchGuests()
      } else {
        fetchGuests()
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  async function fetchGuests() {
    try {
      setLoading(true)
      const { data, error } = await guestsService.getAllGuests(sortBy, sortDirection)

      if (error) throw error

      setGuests(data || [])
    } catch (error) {
      console.error("Mehmonlarni yuklashda xatolik:", error)
      toast({
        title: "Xatolik",
        description: "Mehmonlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function searchGuests() {
    try {
      setSearching(true)
      const { data, error } = await guestsService.searchGuests(searchTerm)

      if (error) throw error

      setGuests(data || [])
    } catch (error) {
      console.error("Mehmonlarni qidirishda xatolik:", error)
      toast({
        title: "Xatolik",
        description: "Mehmonlarni qidirishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  // Qidiruv va filtrlar asosida mehmonlarni filtrlash
  const filteredGuests = guests.filter((guest) => {
    // Nationality filtering
    const matchesNationality = nationalityFilter === "all" || 
      (guest.nationality && guest.nationality === nationalityFilter)

    // ID type filtering
    const matchesIdType = idTypeFilter === "all" || 
      (guest.id_type && guest.id_type === idTypeFilter)

    return matchesNationality && matchesIdType
  })

  // Get unique nationalities for filter
  const nationalities = Array.from(new Set(guests
    .map(guest => guest.nationality)
    .filter(Boolean)
    .sort()
  ))

  async function handleDeleteGuest() {
    try {
      if (!guestToDelete) return
      
      const { success, error } = await guestsService.deleteGuest(guestToDelete.id)
      
      if (error) throw error
      
      toast({
        title: "Muvaffaqiyatli",
        description: "Mehmon muvaffaqiyatli o'chirildi",
      })
      
      // Close dialog and refresh list
      setIsDeleteDialogOpen(false)
      setGuestToDelete(null)
      fetchGuests()
    } catch (error) {
      console.error("Mehmonni o'chirishda xatolik:", error)
      toast({
        title: "Xatolik",
        description: "Mehmonni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex-1">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mehmonlar</h1>
          <p className="text-muted-foreground">
            Mehmonlar ro'yxatini boshqaring
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <CardTitle>Mehmonlar ro'yxati</CardTitle>
              <CardDescription>
                Barcha mehmonlarni ko'rish va boshqarish
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Yangi mehmon
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Yangi mehmon qo'shish</DialogTitle>
                    <DialogDescription>
                      Mehmon ma'lumotlarini kiriting
                    </DialogDescription>
                  </DialogHeader>
                  <SimpleGuestForm onSuccess={() => {
                    fetchGuests()
                    toast({
                      title: "Muvaffaqiyatli",
                      description: "Yangi mehmon qo'shildi",
                    })
                  }} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Qidirish..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="icon" onClick={fetchGuests}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Ism</TableHead>
                      <TableHead className="min-w-[150px]">Email</TableHead>
                      <TableHead className="min-w-[120px]">Telefon</TableHead>
                      <TableHead className="min-w-[120px]">Millati</TableHead>
                      <TableHead className="min-w-[120px]">Pasport</TableHead>
                      <TableHead className="min-w-[100px] text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredGuests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Hech qanday mehmon topilmadi
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGuests.map((guest: { id: string; first_name: string; last_name: string; email: string; phone: string; nationality: string; passport_number: string }) => (
                        <TableRow key={guest.id}> 
                          <TableCell>
                            <div className="font-medium">
                              {guest.first_name} {guest.last_name}
                            </div>
                          </TableCell>
                          <TableCell>{guest.email}</TableCell>
                          <TableCell>{guest.phone}</TableCell>
                          <TableCell>{guest.nationality}</TableCell>
                          <TableCell>{guest.passport_number}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link href={`/guests/${guest.id}`} className="flex items-center w-full">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Ko'rish
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link href={`/guests/${guest.id}/edit`} className="flex items-center w-full">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Tahrirlash
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setGuestToDelete(guest);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  O'chirish
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Jami: {filteredGuests.length} ta mehmon ({guests.length} dan)
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mehmonni o'chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham bu mehmonni o'chirmoqchimisiz? Bu amalning ortga qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {guestToDelete && (
              <p className="text-center font-medium">
                {guestToDelete.first_name} {guestToDelete.last_name}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={handleDeleteGuest}>
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  )
} 