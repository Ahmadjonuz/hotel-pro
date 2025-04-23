"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, CreditCard, Edit, Mail, MapPin, Phone, Star, Trash, User, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { guestsService, type Guest } from "@/services/guests-service"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { ClientFormattedCurrency } from "@/components/ui/client-formatted-currency"

export default function GuestProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Fetch guest data
  useEffect(() => {
    const fetchGuestData = async () => {
      setLoading(true)
      try {
        const guestId = typeof params.id === "string" ? params.id : params.id[0]
        const { data, error } = await guestsService.getGuestById(guestId)
        
        if (error) {
          console.error("Mehmon ma'lumotlarini yuklashda xatolik:", error)
          toast({
            title: "Xatolik",
            description: "Mehmon ma'lumotlarini yuklashda xatolik yuz berdi",
            variant: "destructive",
          })
          return
        }
        
        setGuest(data)
        
        // Now fetch bookings
        fetchGuestBookings(guestId)
      } catch (err) {
        console.error("Kutilmagan xatolik:", err)
        toast({
          title: "Xatolik",
          description: "Kutilmagan xatolik yuz berdi",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchGuestData()
  }, [params.id, toast])
  
  // Fetch bookings for the guest
  const fetchGuestBookings = async (guestId: string) => {
    setLoadingBookings(true)
    try {
      // Mehmonning bronlarini yuklash uchun haqiqiy servis methodingizni sozlang
      // Bu shunchaki namuna - haqiqiy bron yuklash logikangizni qo'llang
      const bookingsResponse = await fetch(`/api/bookings?guest_id=${guestId}`)
      
      if (!bookingsResponse.ok) {
        console.error("Bronlar ma'lumotlarini yuklashda xatolik")
        return
      }
      
      const bookingsData = await bookingsResponse.json()
      setBookings(bookingsData.data || [])
    } catch (err) {
      console.error("Bronlarni yuklashda xatolik:", err)
    } finally {
      setLoadingBookings(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const handleSendEmail = () => {
    if (!guest?.email) return
    
    // Haqiqiy email yuborish logikasini shu yerga yozing
    toast({
      title: "Email yuborildi",
      description: `${guest.email} manziliga email yuborildi`,
    })
  }
  
  const handleDeleteGuest = async () => {
    if (!guest) return
    
    try {
      const { success, error } = await guestsService.deleteGuest(guest.id)
      
      if (error) {
        console.error("Mehmonni o'chirishda xatolik:", error)
        toast({
          title: "Xatolik",
          description: error.message || "Mehmonni o'chirishda xatolik yuz berdi",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Muvaffaqiyatli",
        description: "Mehmon muvaffaqiyatli o'chirildi",
      })
      
      // Navigate back to guests list
      router.push("/guests")
    } catch (err) {
      console.error("Mehmonni o'chirishda kutilmagan xatolik:", err)
      toast({
        title: "Xatolik",
        description: "Kutilmagan xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <Link
            href="/guests"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Mehmonlar ro'yxatiga qaytish
          </Link>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-6">
            <Card>
              <CardHeader className="relative pb-2">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-24 w-24 rounded-full mb-2" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24 mb-1" />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <Link
            href="/guests"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Mehmonlar ro'yxatiga qaytish
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Mehmon topilmadi</CardTitle>
            <CardDescription>So'ralgan mehmon ma'lumotlari mavjud emas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <p className="text-center mb-4">Bu mehmon tizimda mavjud emas yoki o'chirilgan bo'lishi mumkin.</p>
            <Button asChild>
              <Link href="/guests">Mehmonlar ro'yxatiga qaytish</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <Link
            href="/guests"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Mehmonlar ro'yxatiga qaytish
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-6">
            <Card>
              <CardHeader className="relative pb-2">
                <div className="absolute right-6 top-6 flex gap-2">
                  <Link href={`/guests/${guest.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-2">
                    <AvatarFallback className="bg-rose-100 text-rose-800 text-2xl">
                      {getInitials(`${guest.first_name} ${guest.last_name}`)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{guest.first_name} {guest.last_name}</CardTitle>
                  {guest.is_vip && (
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <Star className="h-3 w-3 mr-1 fill-amber-500" />
                        VIP Mehmon
                      </Badge>
                    </div>
                  )}
                  <CardDescription className="mt-1">Mehmon ID: {guest.id}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">{guest.email || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Telefon</div>
                      <div className="text-sm text-muted-foreground">{guest.phone || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Manzil</div>
                      <div className="text-sm text-muted-foreground">{guest.address || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Hujjat</div>
                      <div className="text-sm text-muted-foreground">
                        {guest.document_type ? `${guest.document_type}: ${guest.document_number}` : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleSendEmail} disabled={!guest.email}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email yuborish
                </Button>
                <Link href={`/bookings/new?guest_id=${guest.id}`}>
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Yangi bron qo'shish
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sodiqlik dasturi</CardTitle>
                <CardDescription>Mehmon sodiqlik ballari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Status</div>
                    <Badge className="bg-rose-100 text-rose-800">
                      {guest.loyalty_points > 1000 ? "Oltin a'zo" : "Standart a'zo"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Ballar</div>
                      <div>{guest.loyalty_points} ball</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full"
                        style={{ width: `${Math.min((guest.loyalty_points / 2000) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {guest.loyalty_points}/2000 ball Platinum darajasiga
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Ballarni ishlatish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-2/3 space-y-6">
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="bookings">Bronlar</TabsTrigger>
                <TabsTrigger value="notes">Qaydlar</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bronlash tarixi</CardTitle>
                    <CardDescription>O'tgan va kelgusi bronlar</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loadingBookings ? (
                      <div className="p-6 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Bronlar yuklanmoqda...</p>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-muted-foreground">Mehmonning bronlari mavjud emas</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bron ID</TableHead>
                            <TableHead>Sanalar</TableHead>
                            <TableHead>Xona</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Summa</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">{booking.id}</TableCell>
                              <TableCell>
                                {booking.check_in_date} - {booking.check_out_date}
                              </TableCell>
                              <TableCell>
                                {booking.room_number} ({booking.room_type})
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`
                                  ${booking.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                  ${booking.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                  ${booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                `}>
                                  {booking.status === 'completed' ? 'Yakunlangan' : 
                                   booking.status === 'upcoming' ? 'Kutilmoqda' : 
                                   booking.status === 'cancelled' ? 'Bekor qilingan' : booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <ClientFormattedCurrency amount={booking.total_amount} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end py-4">
                    <Link href={`/bookings/new?guest_id=${guest.id}`}>
                      <Button>
                        <Calendar className="mr-2 h-4 w-4" />
                        Yangi bron qo'shish
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Qaydlar va izohlar</CardTitle>
                    <CardDescription>Mehmon haqidagi qo'shimcha ma'lumotlar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {guest.notes ? (
                        <div className="p-4 bg-muted rounded-md">
                          <p className="text-sm">{guest.notes}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center">Qaydlar mavjud emas</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mehmonni o'chirish</DialogTitle>
            <DialogDescription>
              Mehmonni o'chirish barcha tegishli ma'lumotlarni ham o'chiradi. Bu amalni ortga qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-lg font-medium">
              {guest.first_name} {guest.last_name}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Bu mehmonni o'chirishni xohlaysizmi?
            </p>
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

