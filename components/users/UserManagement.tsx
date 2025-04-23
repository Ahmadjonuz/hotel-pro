"use client"

import { useState, useEffect } from "react"
import { Plus, MoreHorizontal, Edit, Trash } from "lucide-react"
import { userService, type UserProfile, type UserRole } from "@/services/user-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/loading-skeleton"
import { toast } from "@/components/ui/use-toast"
import { UserForm } from "./UserForm"

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data, error } = await userService.isCurrentUserAdmin()
      if (error) {
        console.error("Error checking admin role:", error)
        return
      }
      setIsAdmin(data)
    }

    checkAdminRole()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await userService.getAllUsers()
    if (error) {
      setError(error.error.message)
      toast({
        title: "Xatolik",
        description: "Foydalanuvchilar ro'yxatini yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = async (user: UserProfile) => {
    if (!isAdmin) {
      toast({
        title: "Xatolik",
        description: "Faqat administrator foydalanuvchilarni o'chira oladi",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Haqiqatan ham bu foydalanuvchini o'chirmoqchimisiz?")) {
      return
    }

    try {
      setLoading(true);
      const { error } = await userService.deleteUser(user.id)
      
      if (error) {
        let errorMessage = "Foydalanuvchini o'chirishda xatolik yuz berdi";
        
        // Extract actual error message if available
        if (error && typeof error === 'object') {
          if ('message' in error) {
            errorMessage = (error as { message: string }).message;
          } else if ('error' in error && typeof error.error === 'object' && 'message' in error.error) {
            errorMessage = (error.error as { message: string }).message;
          }
        }
        
        console.error("User deletion error:", error);
        
        toast({
          title: "Xatolik",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Muvaffaqiyatli",
          description: "Foydalanuvchi o'chirildi",
        });
        fetchUsers();
      }
    } catch (err) {
      console.error("Unexpected error during user deletion:", err);
      toast({
        title: "Xatolik",
        description: "Foydalanuvchini o'chirishda kutilmagan xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedUser(null)
    fetchUsers()
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedUser(null)
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Administrator
          </Badge>
        )
      case "manager":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Menejer
          </Badge>
        )
      case "receptionist":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Qabul xodimi
          </Badge>
        )
    }
  }

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <TableSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, sahifani yangilang yoki keyinroq urinib ko'ring.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Ism yoki telefon raqami bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        {isAdmin && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Yangi foydalanuvchi qo'shish
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>F.I.O</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Qo'shilgan sana</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Foydalanuvchilar topilmadi.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name || "—"}</TableCell>
                  <TableCell>{user.phone || "—"}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString("uz-UZ")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Amallar menyusi</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Tahrirlash
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(user)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            O'chirish
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 