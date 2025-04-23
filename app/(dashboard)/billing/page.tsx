"use client"

import { useState, useEffect } from "react"
import { Plus, CreditCard, Settings, FileText, Download, Trash2, Edit2 } from "lucide-react"
import { billingService, Invoice, PaymentMethod, BillingSettings } from "@/services/billing-service"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { ClientFormattedCurrency } from "@/components/ui/client-formatted-currency"

interface BillingError {
  message: string
  details?: any
  code?: string
}

interface BillingResponse<T> {
  data: T | null
  error: BillingError | null
}

export default function BillingPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("invoices")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const { toast } = useToast()

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id])

  const fetchData = async () => {
    try {
      const [invoicesResponse, paymentMethodsResponse, billingSettingsResponse] = await Promise.all([
        billingService.getAllInvoices(user!.id),
        billingService.getPaymentMethods(user!.id),
        billingService.getBillingSettings(user!.id)
      ]) as [
        BillingResponse<Invoice[]>,
        BillingResponse<PaymentMethod[]>,
        BillingResponse<BillingSettings>
      ]

      if (invoicesResponse.error) {
        throw new Error(invoicesResponse.error.message)
      }
      setInvoices(invoicesResponse.data || [])

      if (paymentMethodsResponse.error) {
        throw new Error(paymentMethodsResponse.error.message)
      }
      setPaymentMethods(paymentMethodsResponse.data || [])

      if (billingSettingsResponse.error) {
        throw new Error(billingSettingsResponse.error.message)
      }
      setBillingSettings(billingSettingsResponse.data || null)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Xatolik",
        description: error instanceof Error ? error.message : "Ma'lumotlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateInvoice(invoiceData: any) {
    try {
      if (!user?.id) {
        throw new Error("Foydalanuvchi tizimga kirmagan")
      }

      const response = await billingService.createInvoice({
        ...invoiceData,
        created_by: user.id
      }) as BillingResponse<Invoice>
      
      if (response.error) {
        throw new Error(response.error.message)
      }
      
      setInvoices([response.data!, ...invoices])
      toast({
        title: "Muvaffaqiyatli",
        description: "Hisob-faktura muvaffaqiyatli yaratildi",
      })
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast({
        title: "Xatolik",
        description: error instanceof Error ? error.message : "Hisob-fakturani yaratishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  async function handleAddPaymentMethod(paymentMethodData: any) {
    try {
      if (!user?.id) {
        throw new Error("Foydalanuvchi tizimga kirmagan")
      }

      const response = await billingService.addPaymentMethod({
        ...paymentMethodData,
        user_id: user.id
      }) as BillingResponse<PaymentMethod>

      if (response.error) {
        throw new Error(response.error.message)
      }

      setPaymentMethods([...paymentMethods, response.data!])
      toast({
        title: "Muvaffaqiyatli",
        description: "To'lov usuli muvaffaqiyatli qo'shildi",
      })
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast({
        title: "Xatolik",
        description: error instanceof Error ? error.message : "To'lov usulini qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  async function handleUpdateSettings(settings: any) {
    try {
      if (!user?.id) {
        throw new Error("Foydalanuvchi tizimga kirmagan")
      }

      const response = await billingService.updateBillingSettings(user.id, settings) as BillingResponse<BillingSettings>
      if (response.error) {
        throw new Error(response.error.message)
      }
      
      setBillingSettings(response.data)
      toast({
        title: "Muvaffaqiyatli",
        description: "To'lov sozlamalari muvaffaqiyatli yangilandi",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Xatolik",
        description: error instanceof Error ? error.message : "To'lov sozlamalarini yangilashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteInvoice(id: string) {
    try {
      const { error } = await billingService.deleteInvoice(id)
      if (error) throw error
      
      setInvoices(invoices.filter(invoice => invoice.id !== id))
      toast({
        title: "Muvaffaqiyatli",
        description: "Hisob-faktura muvaffaqiyatli o'chirildi",
      })
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Xatolik",
        description: "Hisob-fakturani o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  async function handleDeletePaymentMethod(id: string) {
    try {
      const { error } = await billingService.deletePaymentMethod(id)
      if (error) throw error
      
      setPaymentMethods(paymentMethods.filter(method => method.id !== id))
      toast({
        title: "Muvaffaqiyatli",
        description: "To'lov usuli muvaffaqiyatli o'chirildi",
      })
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({
        title: "Xatolik",
        description: "To'lov usulini o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">To'lovlar</h2>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices" onClick={() => setActiveTab("invoices")}>
            <FileText className="mr-2 h-4 w-4" />
            Hisob-fakturalar
          </TabsTrigger>
          <TabsTrigger value="payment-methods" onClick={() => setActiveTab("payment-methods")}>
            <CreditCard className="mr-2 h-4 w-4" />
            To'lov usullari
          </TabsTrigger>
          <TabsTrigger value="settings" onClick={() => setActiveTab("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Sozlamalar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DateRangePicker
                value={dateRange}
                onChange={(range) => setDateRange(range)}
              />
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Yuklab olish
              </Button>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi hisob-faktura
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yangi hisob-faktura yaratish</DialogTitle>
                </DialogHeader>
                <InvoiceForm onSubmit={handleCreateInvoice} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Hisob-faktura #{invoice.invoice_number}</span>
                    <span className={`text-sm font-normal ${
                      invoice.status === 'paid' ? 'text-green-500' :
                      invoice.status === 'unpaid' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {invoice.status === 'paid' ? 'To\'langan' :
                       invoice.status === 'unpaid' ? 'To\'lanmagan' :
                       'Bekor qilingan'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Summa:</span> <ClientFormattedCurrency amount={invoice.amount} />
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">To'lov muddati:</span> {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Mijoz:</span> {invoice.client_name}
                    </p>
                    {invoice.items && invoice.items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Mahsulotlar:</p>
                        <ul className="text-sm space-y-1">
                          {invoice.items.map((item: any) => (
                            <li key={item.id}>
                              {item.description} - {item.quantity} x <ClientFormattedCurrency amount={item.unit_price} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Tahrirlash
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteInvoice(invoice.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    O'chirish
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  To'lov usulini qo'shish
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>To'lov usulini qo'shish</DialogTitle>
                </DialogHeader>
                <PaymentMethodForm onSubmit={handleAddPaymentMethod} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{method.card_type}</span>
                    {method.is_default && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Asosiy
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Karta raqami:</span> •••• {method.last_four}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Amal qilish muddati:</span> {method.expiry_month}/{method.expiry_year}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (!user?.id) {
                        toast({
                          title: "Xatolik",
                          description: "Foydalanuvchi tizimga kirmagan",
                          variant: "destructive",
                        })
                        return
                      }
                      billingService.setDefaultPaymentMethod(method.id, user.id)
                    }}
                    disabled={method.is_default}
                  >
                    Asosiy qilib belgilash
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeletePaymentMethod(method.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    O'chirish
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>To'lov sozlamalari</CardTitle>
            </CardHeader>
            <CardContent>
              <BillingSettingsForm
                settings={billingSettings}
                onSubmit={handleUpdateSettings}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InvoiceForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [items, setItems] = useState([{ description: '', quantity: 1, unit_price: 0 }])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const invoiceData = {
      invoice_number: formData.get('invoice_number'),
      amount: parseFloat(formData.get('amount') as string),
      due_date: formData.get('due_date'),
      client_name: formData.get('client_name'),
      client_email: formData.get('client_email'),
      description: formData.get('description'),
      items: items.map(item => ({
        ...item,
        total: item.quantity * item.unit_price
      }))
    }
    onSubmit(invoiceData)
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invoice_number">Hisob-faktura raqami</Label>
        <Input id="invoice_number" name="invoice_number" placeholder="INV-001" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="due_date">To'lov muddati</Label>
        <Input id="due_date" name="due_date" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client_name">Mijoz ismi</Label>
        <Input id="client_name" name="client_name" placeholder="John Doe" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client_email">Mijoz elektron pochtasi</Label>
        <Input id="client_email" name="client_email" type="email" placeholder="john@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Tavsif</Label>
        <Input id="description" name="description" placeholder="Hisob-faktura tavsifi" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Mahsulotlar</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Mahsulot qo'shish
          </Button>
        </div>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5">
              <Label>Tavsif</Label>
              <Input
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                placeholder="Mahsulot tavsifi"
              />
            </div>
            <div className="col-span-2">
              <Label>Miqdor</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div className="col-span-3">
              <Label>Birlik narxi</Label>
              <Input
                type="number"
                value={item.unit_price}
                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
                placeholder="Masalan: 50000"
              />
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">
        Hisob-faktura yaratish
      </Button>
    </form>
  )
}

function PaymentMethodForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const paymentMethodData = {
      card_type: formData.get('card_type'),
      last_four: (formData.get('card_number') as string).slice(-4),
      expiry_month: parseInt(formData.get('expiry_month') as string),
      expiry_year: parseInt(formData.get('expiry_year') as string),
      is_default: formData.get('is_default') === 'on'
    }
    onSubmit(paymentMethodData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card_type">Karta turi</Label>
        <Select name="card_type" required>
          <SelectTrigger>
            <SelectValue placeholder="Karta turini tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visa">Visa</SelectItem>
            <SelectItem value="mastercard">Mastercard</SelectItem>
            <SelectItem value="amex">American Express</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="card_number">Karta raqami</Label>
        <Input id="card_number" name="card_number" placeholder="1234 5678 9012 3456" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry_month">Amal qilish oyi</Label>
          <Input id="expiry_month" name="expiry_month" placeholder="MM" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiry_year">Amal qilish yili</Label>
          <Input id="expiry_year" name="expiry_year" placeholder="YY" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cvv">CVV</Label>
        <Input id="cvv" name="cvv" placeholder="123" required />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="is_default" name="is_default" />
        <Label htmlFor="is_default">Asosiy to'lov usuli sifatida belgilash</Label>
      </div>
      <Button type="submit" className="w-full">
        To'lov usulini qo'shish
      </Button>
    </form>
  )
}

function BillingSettingsForm({ settings, onSubmit }: { settings: any, onSubmit: (data: any) => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const billingSettings = {
      auto_payments: formData.get('auto_payments') === 'on',
      billing_cycle: formData.get('billing_cycle'),
      billing_address: {
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        postal_code: formData.get('postal_code'),
        country: formData.get('country')
      }
    }
    onSubmit(billingSettings)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="auto_payments" 
          name="auto_payments" 
          defaultChecked={settings?.auto_payments} 
        />
        <Label htmlFor="auto_payments">Avtomatik to'lovlarni yoqish</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="billing_cycle">To'lov davri</Label>
        <Select name="billing_cycle" defaultValue={settings?.billing_cycle}>
          <SelectTrigger>
            <SelectValue placeholder="To'lov davrini tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Oylik</SelectItem>
            <SelectItem value="quarterly">Choraklik</SelectItem>
            <SelectItem value="annually">Yillik</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>To'lov manzili</Label>
        <div className="grid gap-4">
          <Input 
            name="street" 
            placeholder="Ko'cha manzili" 
            defaultValue={settings?.billing_address?.street}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="city" 
              placeholder="Shahar" 
              defaultValue={settings?.billing_address?.city}
            />
            <Input 
              name="state" 
              placeholder="Viloyat" 
              defaultValue={settings?.billing_address?.state}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="postal_code" 
              placeholder="Pochta indeksi" 
              defaultValue={settings?.billing_address?.postal_code}
            />
            <Input 
              name="country" 
              placeholder="Davlat" 
              defaultValue={settings?.billing_address?.country}
            />
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full">
        Sozlamalarni saqlash
      </Button>
    </form>
  )
} 