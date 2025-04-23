"use client"
import { Check, Coffee, MoreHorizontal, Pencil, Trash2, Wifi, Tv, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"

// Sample room data with UZS prices
const rooms = [
  {
    id: "101",
    type: "Standard",
    capacity: 2,
    price: 1300000, // ~$100
    status: "available",
    amenities: ["wifi", "tv", "coffee"],
    description: "Comfortable room with a queen-sized bed and city view.",
  },
  {
    id: "102",
    type: "Standard",
    capacity: 2,
    price: 1300000, // ~$100
    status: "occupied",
    amenities: ["wifi", "tv", "coffee"],
    description: "Comfortable room with a queen-sized bed and garden view.",
  },
  {
    id: "201",
    type: "Deluxe",
    capacity: 3,
    price: 1950000, // ~$150
    status: "available",
    amenities: ["wifi", "tv", "coffee", "minibar"],
    description: "Spacious room with a king-sized bed and premium amenities.",
  },
  {
    id: "202",
    type: "Deluxe",
    capacity: 3,
    price: 1950000, // ~$150
    status: "cleaning",
    amenities: ["wifi", "tv", "coffee", "minibar"],
    description: "Spacious room with a king-sized bed and premium amenities.",
  },
  {
    id: "301",
    type: "Suite",
    capacity: 4,
    price: 3250000, // ~$250
    status: "maintenance",
    amenities: ["wifi", "tv", "coffee", "minibar", "jacuzzi"],
    description: "Luxury suite with separate living area and panoramic views.",
  },
  {
    id: "302",
    type: "Suite",
    capacity: 4,
    price: 3250000, // ~$250
    status: "available",
    amenities: ["wifi", "tv", "coffee", "minibar", "jacuzzi"],
    description: "Luxury suite with separate living area and panoramic views.",
  },
]

export function RoomsGrid() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Bo'sh</Badge>
      case "occupied":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Band
          </Badge>
        )
      case "cleaning":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Tozalanmoqda
          </Badge>
        )
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Texnik xizmatda
          </Badge>
        )
      default:
        return null
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "tv":
        return <Tv className="h-4 w-4" />
      case "coffee":
        return <Coffee className="h-4 w-4" />
      default:
        return <Check className="h-4 w-4" />
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <Card key={room.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Room {room.id}</CardTitle>
                <CardDescription>{room.type} Room</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center gap-2 mb-3">
              {getStatusBadge(room.status)}
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-sm">{room.capacity} Guests</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{room.description}</p>
            <div className="flex gap-2 mb-2">
              {room.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  {getAmenityIcon(amenity)}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-3">
            <div className="font-semibold">
              {formatCurrency(room.price)}
              <span className="text-sm font-normal text-muted-foreground">/tun</span>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

