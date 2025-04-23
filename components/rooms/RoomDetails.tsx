"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { roomsService } from "@/services/rooms-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BedDouble, Users, Calendar, CreditCard, Wrench, Sparkles, ArrowLeft, Edit, MoreVertical, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { toast } from "sonner"

export function RoomDetails() {
  const { id } = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    async function fetchRoomDetails() {
      try {
        setLoading(true)
        const { data, error } = await roomsService.getRoomDetails(id as string)
        if (error) throw error
        setRoom(data)
      } catch (err) {
        setError("Xona ma'lumotlarini yuklashda xatolik yuz berdi")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRoomDetails()
    }
  }, [id])

  const handleDeleteRoom = async () => {
    try {
      const { error } = await roomsService.deleteRoom(id as string)
      if (error) throw error
      
      toast.success("Xona muvaffaqiyatli o'chirildi")
      router.push("/rooms")
    } catch (err) {
      toast.error("Xonani o'chirishda xatolik yuz berdi")
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-destructive">
        <p>{error}</p>
      </div>
    </div>
  )

  if (!room) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p>Xona topilmadi</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/rooms">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Xona ma'lumotlari</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/rooms/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Tahrirlash
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href={`/rooms/${id}/bookings`} className="flex items-center w-full">
                  Bronlarni ko'rish
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/rooms/${id}/maintenance`} className="flex items-center w-full">
                  Texnik xizmat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/rooms/${id}/housekeeping`} className="flex items-center w-full">
                  Tozalash
                </Link>
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xonani o'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xonani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu xonani o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRoom}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Room Overview Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{room.room_number}-xona</CardTitle>
              <p className="text-muted-foreground mt-1">{room.description}</p>
            </div>
            <Badge 
              variant={room.status === "available" ? "default" : "destructive"}
              className="text-lg px-4 py-1"
            >
              {room.status === "available" ? "Bo'sh" : 
               room.status === "occupied" ? "Band" :
               room.status === "cleaning" ? "Tozalanmoqda" : "Texnik xizmatda"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <BedDouble className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Xona turi</p>
                <p className="font-medium">{room.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sig'im</p>
                <p className="font-medium">{room.capacity} kishi</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bir kecha narxi</p>
                <p className="font-medium">{formatCurrency(room.price_per_night)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Qulayliklar</p>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Bronlar</CardTitle>
        </CardHeader>
        <CardContent>
          {room.bookings?.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Bronlar mavjud emas</p>
          ) : (
            <div className="space-y-4">
              {room.bookings?.map((booking: any) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Mehmon</p>
                      <p className="font-medium">
                        {booking.guests?.first_name} {booking.guests?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.guests?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sana</p>
                      <p className="font-medium">
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Holat</p>
                      <Badge variant={booking.status === "confirmed" ? "default" : "destructive"}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">To'lov holati</p>
                      <Badge variant={booking.payment_status === "paid" ? "default" : "destructive"}>
                        {booking.payment_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance and Housekeeping Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Maintenance Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-primary" />
              <CardTitle>Texnik xizmat so'rovlari</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {room.maintenance_requests?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">So'rovlar mavjud emas</p>
            ) : (
              <div className="space-y-4">
                {room.maintenance_requests?.map((request: any) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{request.issue}</p>
                      <Badge variant={request.status === "completed" ? "default" : "destructive"}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Housekeeping Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Tozalash vazifalari</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {room.housekeeping_tasks?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Vazifalar mavjud emas</p>
            ) : (
              <div className="space-y-4">
                {room.housekeeping_tasks?.map((task: any) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{task.task_type}</p>
                      <Badge variant={task.status === "completed" ? "default" : "destructive"}>
                        {task.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(task.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 