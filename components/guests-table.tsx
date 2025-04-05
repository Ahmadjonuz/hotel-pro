"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2, User, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Namuna mehmon ma'lumotlari
const guests = [
  {
    id: "G-1001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    visits: 3,
    lastStay: "2023-04-15",
    status: "active",
    isVip: true,
  },
  {
    id: "G-1002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 987-6543",
    visits: 1,
    lastStay: "2023-04-16",
    status: "active",
    isVip: false,
  },
  {
    id: "G-1003",
    name: "Michael Brown",
    email: "michael.b@example.com",
    phone: "+1 (555) 456-7890",
    visits: 5,
    lastStay: "2023-04-10",
    status: "checked-out",
    isVip: true,
  },
  {
    id: "G-1004",
    name: "Emily Davis",
    email: "emily.d@example.com",
    phone: "+1 (555) 234-5678",
    visits: 2,
    lastStay: "2023-04-18",
    status: "active",
    isVip: false,
  },
  {
    id: "G-1005",
    name: "Robert Wilson",
    email: "robert.w@example.com",
    phone: "+1 (555) 876-5432",
    visits: 4,
    lastStay: "2023-04-12",
    status: "checked-out",
    isVip: false,
  },
]

export function GuestsTable() {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Mehmon</TableHead>
            <TableHead>Aloqa</TableHead>
            <TableHead>Tashriflar</TableHead>
            <TableHead>So'nggi tashrif</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-rose-100 text-rose-800">{getInitials(guest.name)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <div className="font-medium flex items-center">
                  {guest.name}
                  {guest.isVip && (
                    <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                      <Star className="h-3 w-3 mr-1 fill-amber-500" />
                      VIP
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{guest.id}</div>
              </TableCell>
              <TableCell>
                <div>{guest.email}</div>
                <div className="text-sm text-muted-foreground">{guest.phone}</div>
              </TableCell>
              <TableCell>{guest.visits}</TableCell>
              <TableCell>{guest.lastStay}</TableCell>
              <TableCell>
                <Badge variant={guest.status === "active" ? "default" : "secondary"}>
                  {guest.status === "active" ? "Faol" : "Chiqib ketgan"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Menyuni ochish</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profilni ko'rish
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Tahrirlash
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      O'chirish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

