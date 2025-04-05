"use client"

import { useState } from "react"
import { BedDouble, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Sample available rooms
const availableRooms = [
  {
    id: "101",
    type: "Standard",
    price: 99.99,
    features: ["Queen Bed", "City View", '32" TV'],
  },
  {
    id: "103",
    type: "Standard",
    price: 99.99,
    features: ["Queen Bed", "Garden View", '32" TV'],
  },
  {
    id: "201",
    type: "Deluxe",
    price: 149.99,
    features: ["King Bed", "City View", '42" TV', "Mini Bar"],
  },
  {
    id: "301",
    type: "Suite",
    price: 249.99,
    features: ["King Bed", "Separate Living Area", '55" TV', "Jacuzzi"],
  },
]

export function RoomSelector() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">4 rooms available for the selected dates</div>

      <RadioGroup value={selectedRoom || ""} onValueChange={setSelectedRoom}>
        <div className="space-y-4">
          {availableRooms.map((room) => (
            <div
              key={room.id}
              className={`flex items-start space-x-4 rounded-lg border p-4 ${
                selectedRoom === room.id ? "border-rose-600 bg-rose-50" : ""
              }`}
            >
              <RadioGroupItem value={room.id} id={`room-${room.id}`} className="mt-1" />
              <Label htmlFor={`room-${room.id}`} className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BedDouble className="h-5 w-5 text-muted-foreground" />
                    <div className="font-medium">Room {room.id}</div>
                    <Badge variant="outline">{room.type}</Badge>
                  </div>
                  <div className="font-semibold">
                    ${room.price.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">/night</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {room.features.map((feature) => (
                    <div key={feature} className="flex items-center text-sm text-muted-foreground">
                      <Check className="mr-1 h-3 w-3" />
                      {feature}
                    </div>
                  ))}
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

