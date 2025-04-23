"use client"

import React, { useState, useEffect } from "react"
import {
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  Search,
  XCircle,
  ArrowUpRight,
  CalendarRange,
  Users,
  UserRound,
  ArrowLeft,
  Calendar,
  Loader2,
  X,
  Sparkles,
  CheckSquare,
  MoreHorizontal,
  FileText,
  Edit,
  Trash
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TaskForm } from "@/components/housekeeping/TaskForm"
import { housekeepingStaff } from "@/data/housekeeping-staff"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { housekeepingService } from "@/services/housekeeping-service"
import { StaffForm } from "@/components/housekeeping/StaffForm"
import type { HousekeepingTask, TaskStats, StaffHistory } from "@/types/housekeeping"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { HousekeepingStaff, TaskResponse } from "@/types/housekeeping"
import { AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ApiResponse<T> {
  data: T
  error?: {
    message: string
  }
}

type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled"

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staff, setStaff] = useState<HousekeepingStaff[]>([])
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<HousekeepingTask["priority"] | "all">("all")
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedStaffHistory, setSelectedStaffHistory] = useState<StaffHistory>({
    staff: {
      id: "",
      name: "",
      job_position: "",
      status: "available",
      max_daily_tasks: 10,
      created_at: "",
      updated_at: ""
    },
    tasks: []
  })
  const [historyDateRange, setHistoryDateRange] = useState<"today" | "week" | "month" | "all">("week")
  const [isNewStaffDialogOpen, setIsNewStaffDialogOpen] = useState(false)
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  })

  useEffect(() => {
    fetchTasks()
    fetchStaff()
  }, [])

  useEffect(() => {
    if (tasks.length > 0) {
      setStats(housekeepingService.calculateTaskStats(tasks))
    }
  }, [tasks])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await housekeepingService.getTasks()
      
      if (error) {
        setError(error.message)
        return
      }
      
      if (!data) {
        setError("No tasks data received")
        return
      }
      
      setTasks(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(message)
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    try {
      const { data, error } = await housekeepingService.getStaff()
      
      if (error) {
        toast({
          title: "Error fetching staff",
          description: error.message,
          variant: "destructive",
        })
        return
      }
      
      if (data) {
        setStaff(data.map(member => ({
          ...member,
          assignedRooms: 0,
          completedToday: 0
        })))
      }
    } catch (error) {
      console.error("Error fetching staff:", error)
    }
  }

  const assignTasks = async () => {
    if (!selectedStaffId || selectedTasks.length === 0) {
      toast({
        title: "Xatolik",
        description: "Xodim va vazifalarni tanlang",
        variant: "destructive",
      })
      return
    }
    
    try {
      const updatePromises = selectedTasks.map(taskId => 
        housekeepingService.updateTask(taskId, {
          assigned_to: selectedStaffId,
          status: "in_progress"
        })
      )
      
      const results = await Promise.all(updatePromises)
      const errors = results.filter(r => r.error)
      
      if (errors.length > 0) {
        toast({
          title: "Xatolik",
          description: "Vazifalarni tayinlashda xatolik yuz berdi",
          variant: "destructive",
        })
        return
      }
      
      await fetchTasks()
      setSelectedTasks([])
      setIsAssignDialogOpen(false)
      
      toast({
        title: "Muvaffaqiyatli",
        description: "Vazifalar xodimga biriktirildi",
      })
    } catch (error) {
      console.error("Error assigning tasks:", error)
      toast({
        title: "Xatolik",
        description: "Vazifalarni tayinlashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredTaskIds = getFilteredTasks().map(task => task.id)
      setSelectedTasks(filteredTaskIds)
    } else {
      setSelectedTasks([])
    }
  }

  const handleTaskSelect = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId])
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId))
    }
  }

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const matchesSearch = (task.room_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (task.notes?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  }

  const completeTask = async (taskId: string) => {
    try {
      const { error } = await housekeepingService.updateTask(taskId, {
        status: "completed",
        completed_at: new Date().toISOString()
      })
      
      if (error) {
        toast({
          title: "Xatolik",
          description: "Vazifani bajarishda xatolik yuz berdi",
          variant: "destructive",
        })
        return
      }
      
      await fetchTasks()
      
      toast({
        title: "Muvaffaqiyatli",
        description: "Vazifa bajarildi",
      })
    } catch (error) {
      console.error("Error completing task:", error)
      toast({
        title: "Xatolik",
        description: "Vazifani bajarishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await housekeepingService.deleteTask(taskId)
      
      if (error) {
        toast({
          title: "Xatolik",
          description: "Vazifani o'chirishda xatolik yuz berdi",
          variant: "destructive",
        })
        return
      }
      
      await fetchTasks()
      
      toast({
        title: "Muvaffaqiyatli",
        description: "Vazifa o'chirildi",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Xatolik",
        description: "Vazifani o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const viewStaffHistory = async (staffMember: HousekeepingStaff) => {
    try {
      const { data, error } = await housekeepingService.getStaffTasks(staffMember.id)
      
      if (error) {
        toast({
          title: "Xatolik",
          description: "Xodim tarixini yuklashda xatolik yuz berdi",
          variant: "destructive",
        })
        return
      }
      
      setSelectedStaffHistory({
        staff: staffMember,
        tasks: data || []
      })
      setIsHistoryDialogOpen(true)
    } catch (error) {
      console.error("Error viewing staff history:", error)
      toast({
        title: "Xatolik",
        description: "Xodim tarixini yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Kutilmoqda
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <RefreshCw className="mr-1 h-3 w-3" />
            Jarayonda
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Tugallangan
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Bekor qilingan
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">Noma'lum</Badge>
        )
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Past</Badge>
      case "medium":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">O'rta</Badge>
      case "high":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Yuqori</Badge>
      case "urgent":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Shoshilinch</Badge>
      default:
        return <Badge variant="outline">Noma'lum</Badge>
    }
  }

  const getStaffName = (staffId: string | null) => {
    if (!staffId) return 'Biriktirilmagan'
    const staffMember = staff.find(member => member.id === staffId)
    return staffMember ? staffMember.name : 'Noma\'lum'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStaffStats = (tasks: any[]) => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === "completed").length
    const inProgress = tasks.filter(t => t.status === "in_progress").length
    const pending = tasks.filter(t => t.status === "pending").length
    const completionRate = total ? Math.round((completed / total) * 100) : 0
    
    return { total, completed, inProgress, pending, completionRate }
  }

  const handleStaffSelect = (member: HousekeepingStaff) => {
    setSelectedStaffId(member.id)
    fetchStaffTasks(member.id)
  }

  const handleStaffSubmit = async (data: {
    name: string
    job_position: string
    status: "available" | "busy" | "off" | "on_break"
    max_daily_tasks: number
    phone?: string
    email?: string
    shift_start?: string
    shift_end?: string
    days_off?: string[]
    specialization?: string[]
    performance_rating?: number
  }) => {
    try {
      const response = await housekeepingService.createStaff({
        ...data,
        job_position: data.job_position || "",
        max_daily_tasks: data.max_daily_tasks || 10,
        status: "available"
      })
      if (response.error) {
        throw new Error(response.error.message)
      }
      setIsNewStaffDialogOpen(false)
      fetchStaff()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create staff member",
        variant: "destructive"
      })
    }
  }

  const fetchStaffTasks = async (staffId: string) => {
    try {
      const response = await fetch(`/api/housekeeping/staff/${staffId}/tasks`)
      const result: ApiResponse<{ staff: HousekeepingStaff; tasks: HousekeepingTask[] }> = await response.json()
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      if (!result.data.staff) {
        throw new Error("Staff data not found")
      }
      
      setSelectedStaffHistory({
        staff: result.data.staff,
        tasks: result.data.tasks
      })
    } catch (error) {
      toast({
        title: "Error fetching tasks",
        description: error instanceof Error ? error.message : "Failed to fetch staff tasks",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`border-r bg-background transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium">Tozalash xizmati</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8"
            >
              <XCircle className="h-4 w-4" />
              <span className="sr-only">Yopish</span>
            </Button>
          </div>
          
          <div className="space-y-6 flex-1 overflow-auto">
            {/* Filters Section */}
            <div>
              <h4 className="text-sm font-medium mb-3">Vazifa holati</h4>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${statusFilter === "all" ? "bg-muted" : ""}`}
                  onClick={() => setStatusFilter("all")}
                >
                  <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                  Barchasi
                  <span className="ml-auto bg-muted rounded-full px-2 text-xs">
                    {tasks.length}
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${statusFilter === "pending" ? "bg-muted" : ""}`}
                  onClick={() => setStatusFilter("pending")}
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                  Kutilmoqda
                  <span className="ml-auto bg-muted rounded-full px-2 text-xs">
                    {tasks.filter(t => t.status === "pending").length}
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${statusFilter === "in_progress" ? "bg-muted" : ""}`}
                  onClick={() => setStatusFilter("in_progress")}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  Jarayonda
                  <span className="ml-auto bg-muted rounded-full px-2 text-xs">
                    {tasks.filter(t => t.status === "in_progress").length}
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${statusFilter === "completed" ? "bg-muted" : ""}`}
                  onClick={() => setStatusFilter("completed")}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Tugallangan
                  <span className="ml-auto bg-muted rounded-full px-2 text-xs">
                    {tasks.filter(t => t.status === "completed").length}
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${statusFilter === "cancelled" ? "bg-muted" : ""}`}
                  onClick={() => setStatusFilter("cancelled")}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Bekor qilingan
                  <span className="ml-auto bg-muted rounded-full px-2 text-xs">
                    {tasks.filter(t => t.status === "cancelled").length}
                  </span>
                </Button>
              </div>
            </div>
            
            {/* Priority Filter */}
            <div>
              <h4 className="text-sm font-medium mb-3">Muhimlik darajasi</h4>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${priorityFilter === "all" ? "bg-muted" : ""}`}
                  onClick={() => setPriorityFilter("all")}
                >
                  <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                  Barchasi
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${priorityFilter === "urgent" ? "bg-muted" : ""}`}
                  onClick={() => setPriorityFilter("urgent")}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Shoshilinch
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${priorityFilter === "high" ? "bg-muted" : ""}`}
                  onClick={() => setPriorityFilter("high")}
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                  Yuqori
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${priorityFilter === "medium" ? "bg-muted" : ""}`}
                  onClick={() => setPriorityFilter("medium")}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  O'rta
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${priorityFilter === "low" ? "bg-muted" : ""}`}
                  onClick={() => setPriorityFilter("low")}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-500 mr-2"></span>
                  Past
                </Button>
              </div>
            </div>
            
            {/* Active Staff */}
            <div>
              <h4 className="text-sm font-medium mb-3">Faol xodimlar</h4>
              <div className="space-y-3">
                {staff.filter(s => s.status === "available" || s.status === "busy").map(person => (
                  <div key={person.id} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${person.status === "available" ? "bg-green-500" : "bg-amber-500"}`}></div>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={`/placeholders/avatars/${person.name.replace(/\s/g, "").toLowerCase()}.png`} />
                      <AvatarFallback className="text-xs">
                        {person.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm truncate">{person.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="py-4 border-t mt-auto">
            <Button className="w-full" onClick={() => setIsNewTaskDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yangi vazifa
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tozalash</h1>
            <p className="text-muted-foreground">
              Tozalash vazifalarini boshqaring
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami vazifalar</CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  Barcha tozalash vazifalari
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bajarilgan</CardTitle>
                <CheckSquare className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "completed").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Bugun bajarilgan vazifalar
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kutilmoqda</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Kutilayotgan vazifalar
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jarayonda</CardTitle>
                <RefreshCw className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "in_progress").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Hozir bajarilayotgan vazifalar
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-2">
                <CardTitle>Tozalash vazifalari</CardTitle>
                <CardDescription>
                  Barcha tozalash vazifalarini ko'rish va boshqarish
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIsNewTaskDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi vazifa
                </Button>
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
                    <Select value={statusFilter} onValueChange={(value: TaskStatus | "all") => setStatusFilter(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Holat bo'yicha" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Barcha holatlar</SelectItem>
                        <SelectItem value="pending">Kutilmoqda</SelectItem>
                        <SelectItem value="in_progress">Jarayonda</SelectItem>
                        <SelectItem value="completed">Bajarilgan</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setStatusFilter("all")
                        setSearchTerm("")
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Xona</TableHead>
                        <TableHead className="min-w-[150px]">Vazifa turi</TableHead>
                        <TableHead className="min-w-[150px]">Sana</TableHead>
                        <TableHead className="min-w-[120px]">Holat</TableHead>
                        <TableHead className="min-w-[120px]">Xodim</TableHead>
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
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-destructive">
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : getFilteredTasks().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Hech qanday vazifa topilmadi
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredTasks().map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div className="font-medium">
                                Xona {task.room_number}
                              </div>
                            </TableCell>
                            <TableCell>{task.task_type}</TableCell>
                            <TableCell>
                              {task.scheduled_start ? format(new Date(task.scheduled_start as string), "PPP") : "Tayinlanmagan"}
                            </TableCell>
                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                            <TableCell>{task.assigned_to || "Tayinlanmagan"}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Link href={`/housekeeping/${task.id}`} className="flex items-center w-full">
                                      <FileText className="h-4 w-4 mr-2" />
                                      Ko'rish
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Link href={`/housekeeping/${task.id}/edit`} className="flex items-center w-full">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Tahrirlash
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => deleteTask(task.id)}
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
                Jami: {getFilteredTasks().length} ta vazifa ({tasks.length} dan)
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={`/placeholders/avatars/${selectedStaffHistory.staff?.name.replace(/\s/g, "").toLowerCase()}.png`}
                />
                <AvatarFallback>
                  {selectedStaffHistory.staff?.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedStaffHistory.staff?.name}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  {selectedStaffHistory.staff?.job_position}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">Vaqt oralig'i:</div>
              <Select value={historyDateRange} onValueChange={(value: "today" | "week" | "month" | "all") => setHistoryDateRange(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Bugun</SelectItem>
                  <SelectItem value="week">Oxirgi hafta</SelectItem>
                  <SelectItem value="month">Oxirgi oy</SelectItem>
                  <SelectItem value="all">Barcha vaqt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Statistics Cards */}
            {(() => {
              const stats = getStaffStats(selectedStaffHistory.tasks)
              return (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Jami vazifalar</CardTitle>
                      <CardDescription className="text-2xl font-bold">{stats.total}</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Bajarilgan</CardTitle>
                      <CardDescription className="text-2xl font-bold text-green-600">{stats.completed}</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Jarayonda</CardTitle>
                      <CardDescription className="text-2xl font-bold text-blue-600">{stats.inProgress}</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Bajarilish darajasi</CardTitle>
                      <CardDescription className="text-2xl font-bold">{Math.round((stats.completed / stats.total) * 100) || 0}%</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress value={Math.round((stats.completed / stats.total) * 100) || 0} className="h-2" />
                    </CardContent>
                  </Card>
                </div>
              )
            })()}

            {/* Tasks Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vazifalar tarixi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Xona</TableHead>
                        <TableHead>Holat</TableHead>
                        <TableHead>Muhimlik</TableHead>
                        <TableHead>Sana</TableHead>
                        <TableHead>Izohlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStaffHistory.tasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            Bu davrda vazifalar topilmadi
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedStaffHistory.tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div className="font-medium">{task.room_number}</div>
                            </TableCell>
                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                            <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                            <TableCell>{formatDate(task.created_at)}</TableCell>
                            <TableCell>
                              {task.notes ? task.notes.substring(0, 30) + (task.notes.length > 30 ? "..." : "") : "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
