"use client"

import { useState } from "react"
import { 
  Building, 
  Globe, 
  Hotel, 
  Mail, 
  Phone, 
  Save, 
  User, 
  Plus, 
  Settings, 
  Bell, 
  Shield, 
  UserCog, 
  Palette, 
  Languages, 
  CreditCard,
  Database,
  XCircle,
  ArrowLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserManagement } from "@/components/users/UserManagement"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSave = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Muvaffaqiyatli",
        description: "Sozlamalar saqlandi",
      })
    }, 1000)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`border-r bg-background transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium">Sozlamalar</h3>
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
            {/* System Settings */}
            <div>
              <h4 className="text-sm font-medium mb-3">Tizim</h4>
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "general" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("general")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Umumiy
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "notifications" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Bildirishnomalar
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "security" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("security")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Xavfsizlik
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* User Management */}
            <div>
              <h4 className="text-sm font-medium mb-3">Foydalanuvchilar</h4>
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "users" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("users")}
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Foydalanuvchilar boshqaruvi
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "roles" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("roles")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Rollar va ruxsatlar
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Appearance */}
            <div>
              <h4 className="text-sm font-medium mb-3">Ko'rinish</h4>
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "theme" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("theme")}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Tema va ranglar
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "language" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("language")}
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Til sozlamalari
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Business Settings */}
            <div>
              <h4 className="text-sm font-medium mb-3">Biznes</h4>
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "billing" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("billing")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  To'lov va obuna
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "backups" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("backups")}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Zaxira nusxalar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-10">
          <div className="flex items-center mb-6">
            {!sidebarOpen && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSidebarOpen(true)}
                className="mr-4"
              >
                <Settings className="h-4 w-4 mr-2" />
                Sozlamalar menyusi
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Orqaga</span>
              </Button>
              <h1 className="text-2xl font-bold">Tizim Sozlamalari</h1>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Umumiy</TabsTrigger>
              <TabsTrigger value="notifications">Bildirishnomalar</TabsTrigger>
              <TabsTrigger value="security">Xavfsizlik</TabsTrigger>
              <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tizim sozlamalari</CardTitle>
                  <CardDescription>
                    Asosiy tizim sozlamalarini o'zgartiring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="dark-mode">Qorong'i rejim</Label>
                    <Switch id="dark-mode" />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="notifications">Bildirishnomalar</Label>
                    <Switch id="notifications" />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="sound">Ovozli bildirishnomalar</Label>
                    <Switch id="sound" />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto-logout">Avtomatik chiqish (1 soatdan so'ng)</Label>
                    <Switch id="auto-logout" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bildirishnoma sozlamalari</CardTitle>
                  <CardDescription>
                    Bildirishnomalarni sozlang
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="email-notifications">Email bildirishnomalari</Label>
                    <Switch id="email-notifications" />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="push-notifications">Push bildirishnomalari</Label>
                    <Switch id="push-notifications" />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="sms-notifications">SMS bildirishnomalari</Label>
                    <Switch id="sms-notifications" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Xavfsizlik sozlamalari</CardTitle>
                  <CardDescription>
                    Xavfsizlik sozlamalarini o'zgartiring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="two-factor">Ikki bosqichli autentifikatsiya</Label>
                    <Switch id="two-factor" />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="session-timeout">Sessiya muddati</Label>
                    <Switch id="session-timeout" />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="ip-restriction">IP cheklovi</Label>
                    <Switch id="ip-restriction" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Foydalanuvchilar boshqaruvi</CardTitle>
                  <CardDescription>
                    Tizim foydalanuvchilarini boshqaring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserManagement />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Other tabs can be added here */}
            <TabsContent value="roles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rollar va ruxsatlar</CardTitle>
                  <CardDescription>
                    Foydalanuvchi rollarini va ruxsatlarini boshqaring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        Bu funksiya ishlab chiqilmoqda. Tez orada qo'shiladi.
                      </AlertDescription>
                    </Alert>
                    <p className="text-sm text-muted-foreground">Mavjud rollar:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Administrator</strong> - Barcha operatsiyalarni bajarish huquqiga ega</li>
                      <li><strong>Menejer</strong> - Mehmonlar va xonalarni boshqarish huquqiga ega</li>
                      <li><strong>Qabul xodimi</strong> - Mehmonlarni ro'yxatdan o'tkazish va xonalarni ko'rish huquqiga ega</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="theme" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tema va ranglar</CardTitle>
                  <CardDescription>
                    Interfeysning tashqi ko'rinishini sozlang
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Bu funksiya ishlab chiqilmoqda.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="language" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Til sozlamalari</CardTitle>
                  <CardDescription>
                    Interfeys tilini o'zgartiring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Bu funksiya ishlab chiqilmoqda.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>To'lov va obuna</CardTitle>
                  <CardDescription>
                    To'lov va obuna sozlamalarini boshqaring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>
                      Bu funksiya ishlab chiqilmoqda. Tez orada qo'shiladi.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="backups" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Zaxira nusxalar</CardTitle>
                  <CardDescription>
                    Ma'lumotlar zaxira nusxalarini yarating va boshqaring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>
                      Bu funksiya ishlab chiqilmoqda. Tez orada qo'shiladi.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

