"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, Check, Clock, Filter, Plus, Search, PenToolIcon as Tool, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

// Sample maintenance requests data
const maintenanceRequests = [
  {
    id: "MR001",
    room: "101",
    issue: "Konditsioner ishlamayapti",
    priority: "yuqori",
    status: "kutilmoqda",
    reportedBy: "mehmon",
    reportedAt: "2024-04-03T10:00:00",
  },
  {
    id: "MR002",
    room: "203",
    issue: "Suv tizimida muammo",
    priority: "o'rta",
    status: "jarayonda",
    reportedBy: "xodim",
    reportedAt: "2024-04-03T09:30:00",
  },
  {
    id: "MR003",
    room: "305",
    issue: "Televizor signal olmayapti",
    priority: "past",
    status: "yakunlandi",
    reportedBy: "qabul",
    reportedAt: "2024-04-03T09:00:00",
  },
]

const priorityColors = {
  yuqori: "destructive",
  "o'rta": "secondary",
  past: "default",
} as const

const statusColors = {
  kutilmoqda: "destructive",
  jarayonda: "secondary",
  yakunlandi: "default",
} as const

export default function MaintenancePage() {
  const [requests, setRequests] = useState(maintenanceRequests)

  const handleNewRequest = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const newRequest = {
      id: `MR${(requests.length + 1).toString().padStart(3, "0")}`,
      room: formData.get("room") as string,
      issue: formData.get("issue") as string,
      priority: formData.get("priority") as string,
      status: "kutilmoqda",
      reportedBy: formData.get("reportedBy") as string,
      reportedAt: new Date().toISOString(),
    }

    setRequests([newRequest, ...requests])
    toast({
      title: "Murojaat yaratildi",
      description: `Xona ${newRequest.room} uchun yangi murojaat yaratildi.`,
    })
  }

  return (
    <div className="flex-1">
      <div className="flex flex-col gap-5 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Texnik xizmat</h1>
            <p className="text-muted-foreground">
              Texnik xizmat murojaatlarini boshqaring
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <form className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Murojaatlarni qidirish..."
                    className="w-full appearance-none bg-background pl-8"
                  />
                </div>
              </form>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter murojaatlar</span>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yangi murojaat
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yangi texnik xizmat murojaati</DialogTitle>
                    <DialogDescription>
                      Yangi texnik xizmat murojaati yaratish uchun quyidagi formani to'ldiring
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleNewRequest}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="room" className="text-right">
                          Xona
                        </Label>
                        <Input
                          id="room"
                          name="room"
                          placeholder="101"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="issue" className="text-right">
                          Muammo
                        </Label>
                        <Input
                          id="issue"
                          name="issue"
                          placeholder="Muammoni tasvirlang"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                          Muhimlik
                        </Label>
                        <Select name="priority" defaultValue="o'rta">
                          <SelectTrigger id="priority" className="col-span-3">
                            <SelectValue placeholder="Muhimlik darajasini tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yuqori">Yuqori</SelectItem>
                            <SelectItem value="o'rta">O'rta</SelectItem>
                            <SelectItem value="past">Past</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reportedBy" className="text-right">
                          Kim tomonidan
                        </Label>
                        <Select name="reportedBy" defaultValue="qabul">
                          <SelectTrigger id="reportedBy" className="col-span-3">
                            <SelectValue placeholder="Xabar beruvchini tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qabul">Qabul</SelectItem>
                            <SelectItem value="xodim">Xodim</SelectItem>
                            <SelectItem value="mehmon">Mehmon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                          Qo'shimcha
                        </Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          placeholder="Qo'shimcha ma'lumotlar"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Murojaat yaratish</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Xona</TableHead>
                    <TableHead className="max-w-[500px]">Muammo</TableHead>
                    <TableHead>Muhimlik</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead>Kim tomonidan</TableHead>
                    <TableHead>Vaqt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>{request.room}</TableCell>
                      <TableCell className="max-w-[500px]">{request.issue}</TableCell>
                      <TableCell>
                        <Badge variant={priorityColors[request.priority as keyof typeof priorityColors]}>
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[request.status as keyof typeof statusColors]}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.reportedBy}</TableCell>
                      <TableCell>
                        {new Date(request.reportedAt).toLocaleString("uz-UZ", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="flex flex-col gap-4 md:w-[300px]">
            <Card>
              <CardHeader>
                <CardTitle>Statistika</CardTitle>
                <CardDescription>Joriy texnik xizmat holati</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Kutilayotgan</span>
                  <Badge variant="destructive">
                    {requests.filter((r) => r.status === "kutilmoqda").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Jarayonda</span>
                  <Badge variant="secondary">
                    {requests.filter((r) => r.status === "jarayonda").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Yakunlangan</span>
                  <Badge variant="default">
                    {requests.filter((r) => r.status === "yakunlandi").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tezkor harakatlar</CardTitle>
                <CardDescription>Ko'p ishlatiladigan amallar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Tool className="mr-2 h-4 w-4" />
                  Texnik biriktirish
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="mr-2 h-4 w-4" />
                  Ehtiyot qismlar buyurtmasi
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Jiddiy muammo haqida xabar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Texnik xizmatni rejalashtirish
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

