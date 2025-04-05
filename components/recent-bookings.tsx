import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Sample recent bookings data
const recentBookings = [
  {
    id: "B-1001",
    guestName: "John Smith",
    roomNumber: "101",
    checkIn: "Today",
    status: "Checked In",
  },
  {
    id: "B-1002",
    guestName: "Sarah Johnson",
    roomNumber: "205",
    checkIn: "Tomorrow",
    status: "Confirmed",
  },
  {
    id: "B-1003",
    guestName: "Michael Brown",
    roomNumber: "310",
    checkIn: "Yesterday",
    status: "Checked Out",
  },
  {
    id: "B-1004",
    guestName: "Emily Davis",
    roomNumber: "402",
    checkIn: "Apr 18",
    status: "Confirmed",
  },
]

export default function RecentBookings() {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return (
          <Badge variant="outline" className="ml-auto bg-amber-50 text-amber-700 border-amber-200">
            Confirmed
          </Badge>
        )
      case "Checked In":
        return (
          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
            Checked In
          </Badge>
        )
      case "Checked Out":
        return (
          <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200">
            Checked Out
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {recentBookings.map((booking) => (
        <div key={booking.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-rose-100 text-rose-800">{getInitials(booking.guestName)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{booking.guestName}</p>
            <p className="text-sm text-muted-foreground">
              Room {booking.roomNumber} • {booking.checkIn}
            </p>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      ))}
    </div>
  )
}

