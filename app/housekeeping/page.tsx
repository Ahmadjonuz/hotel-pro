"use client"

import { useState } from "react"
import { Check, CheckCircle2, Clock, Filter, Plus, RefreshCw, Search, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

// Namuna xona tozalash ma'lumotlari
const housekeepingTasks = [
  {
    id: "HK-001",
    roomNumber: "101",
    roomType: "Standart",
    status: "pending",
    priority: "normal",
    assignedTo: "Maria Garcia",
    checkoutTime: "11:00",
    notes: "Oddiy tozalash",
  },
  {
    id: "HK-002",
    roomNumber: "205",
    roomType: "Deluxe",
    status: "in-progress",
    priority: "high",
    assignedTo: "James Wilson",
    checkoutTime: "10:30",
    notes: "VIP mehmon soat 14:00 da keladi",
  },
  {
    id: "HK-003",
    roomNumber: "310",
    roomType: "Suite",
    status: "completed",
    priority: "normal",
    assignedTo: "Maria Garcia",
    checkoutTime: "12:00 PM",
    notes: "Deep cleaning required",
  },
  {
    id: "HK-004",
    roomNumber: "402",
    roomType: "Executive",
    status: "pending",
    priority: "urgent",
    assignedTo: "Unassigned",
    checkoutTime: "10:00 AM",
    notes: "Early check-in requested for 1 PM",
  },
  {
    id: "HK-005",
    roomNumber: "115",
    roomType: "Standard",
    status: "completed",
    priority: "normal",
    assignedTo: "James Wilson",
    checkoutTime: "11:00 AM",
    notes: "",
  },
  {
    id: "HK-006",
    roomNumber: "208",
    roomType: "Deluxe",
    status: "in-progress",
    priority: "normal",
    assignedTo: "Maria Garcia",
    checkoutTime: "11:30 AM",
    notes: "",
  },
  {
    id: "HK-007",
    roomNumber: "301",
    roomType: "Suite",
    status: "pending",
    priority: "high",
    assignedTo: "Unassigned",
    checkoutTime: "12:00 PM",
    notes: "Additional towels requested",
  },
]

// Namuna xodimlar ma'lumotlari
const housekeepingStaff = [
  {
    id: "S-001",
    name: "Maria Garcia",
    position: "Farrosh",
    status: "active",
    assignedRooms: 3,
    completedToday: 2,
  },
  {
    id: "S-002",
    name: "James Wilson",
    position: "Housekeeper",
    status: "active",
    assignedRooms: 2,
    completedToday: 1,
  },
  {
    id: "S-003",
    name: "Sarah Johnson",
    position: "Supervisor",
    status: "active",
    assignedRooms: 0,
    completedToday: 0,
  },
  {
    id: "S-004",
    name: "Robert Brown",
    position: "Housekeeper",
    status: "break",
    assignedRooms: 0,
    completedToday: 3,
  },
]

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState(housekeepingTasks)
  const [staff] = useState(housekeepingStaff)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || task.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map((task) => task.id))
    }
  }

  const handleAssignTasks = () => {
    if (selectedTasks.length === 0) {
      toast({
        title: "Vazifalar tanlanmagan",
        description: "Iltimos, kamida bitta vazifani tanlang.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Vazifalar tayinlandi",
      description: `${selectedTasks.length} ta vazifa muvaffaqiyatli tayinlandi.`,
    })

    // Tanlovni tiklash
    setSelectedTasks([])
  }

  const handleMarkAsComplete = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "completed" } : task)))

    toast({
      title: "Vazifa bajarildi",
      description: `${tasks.find((t) => t.id === taskId)?.roomNumber}-xona tozalandi deb belgilandi.`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Kutilmoqda
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Jarayonda
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Bajarildi
          </Badge>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Shoshilinch
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Yuqori
          </Badge>
        )
      case "normal":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            O'rta
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Xona tozalash</h1>
          <p className="text-muted-foreground">Xonalarni tozalash va tartibga solish vazifalarini boshqaring</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yangi vazifa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami xonalar</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M3 21h18" />
              <path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4" />
              <path d="M5 21V7" />
              <path d="M19 21V7" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter((t) => t.status === "completed").length} ta tozalangan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faol xodimlar</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.filter((s) => s.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">
              {staff.reduce((acc, s) => acc + s.completedToday, 0)} ta vazifa bajarilgan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kutilayotgan vazifalar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter((t) => t.priority === "urgent").length} ta shoshilinch
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jarayondagi vazifalar</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "in-progress").length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter((t) => t.status === "in-progress" && t.priority === "high").length} ta yuqori muhim
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Vazifalar</TabsTrigger>
          <TabsTrigger value="staff">Xodimlar</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Xona raqami yoki xodim nomi bo'yicha qidirish..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Holat bo'yicha filtrlash" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                <SelectItem value="pending">Kutilmoqda</SelectItem>
                <SelectItem value="in-progress">Jarayonda</SelectItem>
                <SelectItem value="completed">Bajarildi</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button onClick={handleAssignTasks} disabled={selectedTasks.length === 0}>
              Tayinlash
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Xona</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Muhimlik</TableHead>
                  <TableHead>Xodim</TableHead>
                  <TableHead>Chiqish vaqti</TableHead>
                  <TableHead>Izohlar</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => handleSelectTask(task.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{task.roomNumber}</div>
                      <div className="text-sm text-muted-foreground">{task.roomType}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{task.assignedTo}</div>
                    </TableCell>
                    <TableCell>{task.checkoutTime}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{task.notes}</div>
                    </TableCell>
                    <TableCell>
                      {task.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsComplete(task.id)}
                          className="hover:bg-green-50 hover:text-green-600"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="staff" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Xodim</TableHead>
                  <TableHead>Lavozim</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Tayinlangan xonalar</TableHead>
                  <TableHead>Bugun bajarilgan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.id}</div>
                    </TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          member.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }
                      >
                        {member.status === "active" ? "Faol" : "Tanaffusda"}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.assignedRooms}</TableCell>
                    <TableCell>{member.completedToday}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

