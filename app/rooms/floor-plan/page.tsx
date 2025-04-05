"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Info, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Sample floor plan data
const floors = [
  {
    id: 1,
    name: "First Floor",
    rooms: [
      { id: "101", type: "standard", status: "occupied", guest: "John Smith" },
      { id: "102", type: "standard", status: "available" },
      { id: "103", type: "standard", status: "available" },
      { id: "104", type: "deluxe", status: "cleaning" },
      { id: "105", type: "deluxe", status: "occupied", guest: "Sarah Johnson" },
      { id: "106", type: "standard", status: "maintenance" },
      { id: "107", type: "standard", status: "available" },
      { id: "108", type: "suite", status: "occupied", guest: "Michael Brown" },
      { id: "109", type: "standard", status: "available" },
      { id: "110", type: "standard", status: "available" },
    ],
  },
  {
    id: 2,
    name: "Second Floor",
    rooms: [
      { id: "201", type: "deluxe", status: "occupied", guest: "Emily Davis" },
      { id: "202", type: "deluxe", status: "available" },
      { id: "203", type: "deluxe", status: "available" },
      { id: "204", type: "suite", status: "cleaning" },
      { id: "205", type: "suite", status: "occupied", guest: "Robert Wilson" },
      { id: "206", type: "deluxe", status: "available" },
      { id: "207", type: "deluxe", status: "available" },
      { id: "208", type: "deluxe", status: "maintenance" },
      { id: "209", type: "deluxe", status: "available" },
      { id: "210", type: "suite", status: "available" },
    ],
  },
  {
    id: 3,
    name: "Third Floor",
    rooms: [
      { id: "301", type: "suite", status: "occupied", guest: "Jennifer Lee" },
      { id: "302", type: "suite", status: "available" },
      { id: "303", type: "executive", status: "available" },
      { id: "304", type: "executive", status: "occupied", guest: "David Miller" },
      { id: "305", type: "suite", status: "cleaning" },
      { id: "306", type: "suite", status: "available" },
      { id: "307", type: "executive", status: "available" },
      { id: "308", type: "executive", status: "available" },
    ],
  },
]

export default function FloorPlanPage() {
  const [selectedFloor, setSelectedFloor] = useState("1")
  const [selectedView, setSelectedView] = useState("status")

  const floor = floors.find((f) => f.id.toString() === selectedFloor)

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-200 text-green-800"
      case "occupied":
        return "bg-blue-100 border-blue-200 text-blue-800"
      case "cleaning":
        return "bg-amber-100 border-amber-200 text-amber-800"
      case "maintenance":
        return "bg-red-100 border-red-200 text-red-800"
      default:
        return "bg-gray-100 border-gray-200 text-gray-800"
    }
  }

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case "standard":
        return "bg-gray-100 border-gray-200 text-gray-800"
      case "deluxe":
        return "bg-blue-100 border-blue-200 text-blue-800"
      case "suite":
        return "bg-purple-100 border-purple-200 text-purple-800"
      case "executive":
        return "bg-rose-100 border-rose-200 text-rose-800"
      default:
        return "bg-gray-100 border-gray-200 text-gray-800"
    }
  }

  const getStatusSummary = () => {
    if (!floor) return { available: 0, occupied: 0, cleaning: 0, maintenance: 0 }

    return floor.rooms.reduce(
      (acc, room) => {
        acc[room.status] = (acc[room.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  const statusSummary = getStatusSummary()

  return (
    <div className="flex-1">
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <Link
            href="/rooms"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rooms
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Room Floor Plan</h1>
          <p className="text-muted-foreground">Visual layout of rooms by floor</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-3/4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Floor Plan</CardTitle>
                    <CardDescription>
                      {floor?.name} - {floor?.rooms.length} rooms
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {floors.map((floor) => (
                          <SelectItem key={floor.id} value={floor.id.toString()}>
                            {floor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedView} onValueChange={setSelectedView}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="status">Status View</SelectItem>
                        <SelectItem value="type">Room Type View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative border rounded-lg p-6 bg-muted/20">
                  {/* Elevator and stairs */}
                  <div className="absolute top-6 left-6 flex gap-2">
                    <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center text-xs font-medium">
                      Elevator
                    </div>
                    <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center text-xs font-medium">
                      Stairs
                    </div>
                  </div>

                  {/* Corridor */}
                  <div className="mx-auto my-8 h-16 bg-muted/50 rounded-md flex items-center justify-center text-sm font-medium text-muted-foreground">
                    Corridor
                  </div>

                  {/* Rooms */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
                    {floor?.rooms.map((room) => (
                      <TooltipProvider key={room.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "h-24 rounded-md border-2 p-2 flex flex-col cursor-pointer hover:shadow-md transition-shadow",
                                selectedView === "status"
                                  ? getRoomStatusColor(room.status)
                                  : getRoomTypeColor(room.type),
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold">{room.id}</span>
                                {room.status === "maintenance" && <Info className="h-4 w-4" />}
                                {room.status === "cleaning" && <Check className="h-4 w-4" />}
                              </div>
                              <div className="mt-auto text-xs">
                                {selectedView === "status" ? (
                                  <Badge variant="outline" className="bg-background/50">
                                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-background/50">
                                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-medium">Room {room.id}</p>
                              <p>Type: {room.type.charAt(0).toUpperCase() + room.type.slice(1)}</p>
                              <p>Status: {room.status.charAt(0).toUpperCase() + room.status.slice(1)}</p>
                              {room.guest && <p>Guest: {room.guest}</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-1/4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Status</CardTitle>
                <CardDescription>Current status summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                      <span>Available</span>
                    </div>
                    <span className="font-medium">{statusSummary.available || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-2" />
                      <span>Occupied</span>
                    </div>
                    <span className="font-medium">{statusSummary.occupied || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-amber-500 mr-2" />
                      <span>Cleaning</span>
                    </div>
                    <span className="font-medium">{statusSummary.cleaning || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                      <span>Maintenance</span>
                    </div>
                    <span className="font-medium">{statusSummary.maintenance || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Room management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Check className="mr-2 h-4 w-4" />
                  Mark Room as Clean
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Info className="mr-2 h-4 w-4" />
                  Report Maintenance Issue
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Room Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Room Types</CardTitle>
                <CardDescription>Room type distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-gray-500 mr-2" />
                      <span>Standard</span>
                    </div>
                    <span className="font-medium">{floor?.rooms.filter((r) => r.type === "standard").length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-2" />
                      <span>Deluxe</span>
                    </div>
                    <span className="font-medium">{floor?.rooms.filter((r) => r.type === "deluxe").length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-500 mr-2" />
                      <span>Suite</span>
                    </div>
                    <span className="font-medium">{floor?.rooms.filter((r) => r.type === "suite").length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-rose-500 mr-2" />
                      <span>Executive</span>
                    </div>
                    <span className="font-medium">
                      {floor?.rooms.filter((r) => r.type === "executive").length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

