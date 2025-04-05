"use client"

import { useState } from "react"
import { Building, Globe, Hotel, Mail, Phone, Save, User, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Sozlamalar</h2>
        <p className="text-muted-foreground">
          Mehmonxona sozlamalarini boshqaring
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Umumiy</TabsTrigger>
          <TabsTrigger value="notifications">Bildirishnomalar</TabsTrigger>
          <TabsTrigger value="security">Xavfsizlik</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mehmonxona ma'lumotlari</CardTitle>
              <CardDescription>Mehmonxona tafsilotlarini yangilang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hotel-name">Mehmonxona nomi</Label>
                <div className="flex items-center space-x-2">
                  <Hotel className="h-4 w-4 text-muted-foreground" />
                  <Input id="hotel-name" defaultValue="Grand Hotel & Spa" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Elektron pochta</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" defaultValue="info@grandhotel.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon raqami</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Manzil</Label>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Input id="address" defaultValue="123 Main Street" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Tavsif</Label>
                <Textarea
                  id="description"
                  rows={4}
                  defaultValue="Shahar markazida joylashgan hashamatli mehmonxona, yuqori darajadagi qulayliklar va ajoyib xizmat taklif etadi."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kirish/Chiqish sozlamalari</CardTitle>
              <CardDescription>Mehmonxonangizning kirish va chiqish vaqtlarini sozlang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check-in-time">Kirish vaqti</Label>
                  <Select defaultValue="14:00">
                    <SelectTrigger id="check-in-time">
                      <SelectValue placeholder="Vaqtni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="13:00">13:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-out-time">Chiqish vaqti</Label>
                  <Select defaultValue="11:00">
                    <SelectTrigger id="check-out-time">
                      <SelectValue placeholder="Vaqtni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="13:00">13:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hisob-kitob ma'lumotlari</CardTitle>
              <CardDescription>To'lov tafsilotlarini yangilang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Kompaniya nomi</Label>
                <Input id="company-name" defaultValue="Grand Hotel LLC" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-id">Soliq ID / STIR raqami</Label>
                <Input id="tax-id" defaultValue="UZ123456789" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-email">Hisob-kitob elektron pochtasi</Label>
                <Input id="billing-email" type="email" defaultValue="billing@grandhotel.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-address">Hisob-kitob manzili</Label>
                <Textarea
                  id="billing-address"
                  rows={3}
                  defaultValue="Toshkent shahri, Mirobod tumani, Amir Temur ko'chasi, 15-uy"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bildirishnoma sozlamalari</CardTitle>
              <CardDescription>Bildirishnomalarni qanday olishni sozlang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="booking-notification" className="font-medium">
                      Bron qilish bildirishnomalari
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Yangi bronlar uchun bildirishnomalar oling
                    </p>
                  </div>
                  <Switch id="booking-notification" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment-notification" className="font-medium">
                      To'lov bildirishnomalari
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      To'lovlar uchun elektron pochta xabarlarini oling
                    </p>
                  </div>
                  <Switch id="payment-notification" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-updates" className="font-medium">
                      Tizim yangilanishlari
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Tizim yangilanishlari va texnik xizmat ko'rsatish haqida xabarlar oling
                    </p>
                  </div>
                  <Switch id="system-updates" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rol boshqaruvi</CardTitle>
              <CardDescription>Foydalanuvchi rollarini va ruxsatlarini sozlang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mavjud rollar</Label>
                <div className="rounded-md border">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div>
                      <p className="font-medium">Administrator</p>
                      <p className="text-sm text-muted-foreground">To'liq tizim ruxsati</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ruxsatlarni tahrirlash
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b">
                    <div>
                      <p className="font-medium">Menejer</p>
                      <p className="text-sm text-muted-foreground">Bronlar, xonalar va hisobotlarni boshqarish</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ruxsatlarni tahrirlash
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Qabul xodimi</p>
                      <p className="text-sm text-muted-foreground">Kirish, chiqish va bronlarni boshqarish</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ruxsatlarni tahrirlash
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

