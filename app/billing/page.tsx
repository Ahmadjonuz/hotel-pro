"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState } from "react"
import { CreditCard, Download, FileText, Plus, Receipt, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Namuna hisob-faktura ma'lumotlari
const invoices = [
  {
    id: "INV-001",
    date: "2023-04-15",
    customer: "John Smith",
    amount: "$349.99",
    status: "paid",
  },
  {
    id: "INV-002",
    date: "2023-04-16",
    customer: "Sarah Johnson",
    amount: "$599.99",
    status: "pending",
  },
  {
    id: "INV-003",
    date: "2023-04-10",
    customer: "Michael Brown",
    amount: "$749.99",
    status: "paid",
  },
  {
    id: "INV-004",
    date: "2023-04-18",
    customer: "Emily Davis",
    amount: "$499.99",
    status: "overdue",
  },
  {
    id: "INV-005",
    date: "2023-04-12",
    customer: "Robert Wilson",
    amount: "$199.99",
    status: "paid",
  },
]

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">To'langan</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Kutilmoqda
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Muddati o'tgan
          </Badge>
        )
      default:
        return null
    }
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1">
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hisob-kitob va fakturalar</h1>
            <p className="text-muted-foreground">Mehmonxonangizning moliyaviy operatsiyalarini boshqaring</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline">
              <Receipt className="mr-2 h-4 w-4" />
              Hisobotlarni ko'rish
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Faktura yaratish
            </Button>
          </div>
        </div>

        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="invoices">Fakturalar</TabsTrigger>
            <TabsTrigger value="payments">To'lovlar</TabsTrigger>
            <TabsTrigger value="settings">Sozlamalar</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>So'nggi fakturalar</CardTitle>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Fakturalarni qidirish..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faktura</TableHead>
                      <TableHead>Sana</TableHead>
                      <TableHead>Mijoz</TableHead>
                      <TableHead>Summa</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Ko'rish
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Yuklab olish
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInvoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Qidiruv bo'yicha fakturalar topilmadi.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">
                  {invoices.length} tadan {filteredInvoices.length} ta faktura ko'rsatilmoqda
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Oldingi
                  </Button>
                  <Button variant="outline" size="sm">
                    Keyingi
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fakturalar xulosasi</CardTitle>
                <CardDescription>Fakturalar holati bo'yicha umumiy ma'lumot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                    <div className="text-3xl font-bold text-green-600">$1,899.96</div>
                    <div className="text-sm text-muted-foreground">Jami to'langan</div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                    <div className="text-3xl font-bold text-amber-600">$599.99</div>
                    <div className="text-sm text-muted-foreground">Kutilmoqda</div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                    <div className="text-3xl font-bold text-red-600">$499.99</div>
                    <div className="text-sm text-muted-foreground">Muddati o'tgan</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>To'lov usullari</CardTitle>
                <CardDescription>To'lov kartalarini boshqaring</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">Visa •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Muddati: 12/24</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    O'chirish
                  </Button>
                </div>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi karta qo'shish
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>To'lov tarixi</CardTitle>
                <CardDescription>So'nggi to'lovlar</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sana</TableHead>
                      <TableHead>Summa</TableHead>
                      <TableHead>Usul</TableHead>
                      <TableHead>Holat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2023-04-15</TableCell>
                      <TableCell>$349.99</TableCell>
                      <TableCell>Visa •••• 4242</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Muvaffaqiyatli</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hisob-kitob sozlamalari</CardTitle>
                <CardDescription>Hisob-kitob va faktura parametrlarini sozlang</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label>Faktura prefiksi</Label>
                  <Input placeholder="INV-" />
                </div>
                <div className="grid gap-2">
                  <Label>Faktura eslatmasi</Label>
                  <Textarea placeholder="Fakturaga qo'shiladigan standart eslatma..." />
                </div>
                <div className="grid gap-2">
                  <Label>To'lov muddati</Label>
                  <Select defaultValue="15">
                    <SelectTrigger>
                      <SelectValue placeholder="To'lov muddatini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 kun</SelectItem>
                      <SelectItem value="15">15 kun</SelectItem>
                      <SelectItem value="30">30 kun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Saqlash</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

