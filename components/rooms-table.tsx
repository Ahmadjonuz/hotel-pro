"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, MoreHorizontal, Edit, Trash, Search } from "lucide-react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/loading-skeleton"
import { useCachedData } from "@/hooks/use-cached-data"
import { roomsService, type Room } from "@/services/rooms-service"
import { RoomForm } from "@/components/room-form"

export function RoomsTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const { data: rooms, loading, error, refetch } = useCachedData<Room[]>(
    async () => {
      try {
        const { data, error } = await roomsService.getAllRooms()
        if (error) throw error
        return data || []
      } catch (err) {
        console.error("Xonalarni yuklashda xatolik:", err)
        throw err
      }
    },
    { key: "rooms", ttl: 5 * 60 * 1000 }
  )

  const handleEdit = useCallback((room: Room) => {
    setSelectedRoom(room)
    setIsFormOpen(true)
  }, [])

  const handleDelete = useCallback(async (room: Room) => {
    if (window.confirm("Bu xonani o'chirishni xohlaysizmi?")) {
      try {
        const { error } = await roomsService.deleteRoom(room.id)
        if (error) throw error
        refetch()
      } catch (err) {
        console.error("Xonani o'chirishda xatolik:", err)
        // TODO: Show error toast
      }
    }
  }, [refetch])

  const handleFormClose = useCallback(() => {
    setSelectedRoom(null)
    setIsFormOpen(false)
  }, [])

  const handleFormSuccess = useCallback(() => {
    handleFormClose()
    refetch()
  }, [handleFormClose, refetch])

  const columns = useMemo<ColumnDef<Room>[]>(() => [
    {
      accessorKey: "room_number",
      header: "Xona raqami",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("room_number")}</Badge>,
    },
    {
      accessorKey: "type",
      header: "Turi",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        const labels = {
          standard: "Standart",
          deluxe: "Deluxe",
          suite: "Lyuks",
        }
        return labels[type as keyof typeof labels] || type
      },
    },
    {
      accessorKey: "capacity",
      header: "Sig'imi",
    },
    {
      accessorKey: "price_per_night",
      header: "Narxi",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price_per_night"))
        const formatted = new Intl.NumberFormat("uz-UZ", {
          style: "currency",
          currency: "UZS",
        }).format(amount)
        return formatted
      },
    },
    {
      accessorKey: "status",
      header: "Holat",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variants: Record<string, "default" | "destructive" | "outline"> = {
          available: "default",
          occupied: "outline",
          maintenance: "destructive",
        }
        const labels = {
          available: "Bo'sh",
          occupied: "Band",
          maintenance: "Ta'mirda",
        }
        return (
          <Badge variant={variants[status] || "default"}>
            {labels[status as keyof typeof labels] || status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const room = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Amallar menyusi</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(room)}>
                <Edit className="mr-2 h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(room)}>
                <Trash className="mr-2 h-4 w-4" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [handleEdit, handleDelete])

  const table = useReactTable({
    data: rooms || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

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
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Xona raqami bo'yicha qidirish..."
            value={(table.getColumn("room_number")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("room_number")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Yangi xona qo'shish
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Xonalar topilmadi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRoom ? "Xonani tahrirlash" : "Yangi xona qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <RoomForm
            room={selectedRoom || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 