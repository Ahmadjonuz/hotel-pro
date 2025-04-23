"use client"

import { useState } from "react"
import { Mail, Phone, MessageSquare, HelpCircle, ChevronDown, Search, FileText, Video, BookOpen, Link2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Nusxalandi",
      description: "Ma'lumot buferga nusxalandi",
    })
  }

  const faqs = [
    {
      question: "Mehmonni qanday ro'yxatdan o'tkazaman?",
      answer: "Mehmonni ro'yxatdan o'tkazish uchun 'Mehmonlar' bo'limiga o'ting va 'Mehmon qo'shish' tugmasini bosing. Kerakli ma'lumotlarni kiriting va saqlang. So'ngra 'Bronlar' bo'limidan ushbu mehmon uchun xona band qilishingiz mumkin."
    },
    {
      question: "Xona holati nima ma'noni anglatadi?",
      answer: "Xona holati quyidagi ma'nolarni anglatadi: 'Bo'sh' - xona mehmonlarni qabul qilishga tayyor; 'Band' - xonada mehmon bor; 'Tozalanmoqda' - xona tozalash jarayonida; 'Texnik xizmatda' - xona ta'mirlanmoqda yoki texnik muammolar bor."
    },
    {
      question: "Bronni bekor qilish mumkinmi?",
      answer: "Ha, bronni bekor qilish mumkin. Buning uchun 'Bronlar' bo'limiga o'ting, bekor qilmoqchi bo'lgan bronni toping va 'Batafsil' tugmasini bosing. Keyin 'Bekor qilish' tugmasini bosing va tasdiqlang."
    },
    {
      question: "Hisobot qanday yuklab olish mumkin?",
      answer: "Hisobotlarni yuklab olish uchun 'Hisobotlar' bo'limiga o'ting, kerakli hisobot turini tanlang, vaqt oralig'ini belgilang va 'Hisobot yaratish' tugmasini bosing. So'ngra 'Yuklab olish' tugmasi orqali PDF, Excel yoki CSV formatida yuklab olishingiz mumkin."
    },
    {
      question: "Tizimga kirish ma'lumotlarimni unutdim, nima qilishim kerak?",
      answer: "Tizimga kirish ma'lumotlaringizni unutgan bo'lsangiz, kirish sahifasidagi 'Parolni unutdingizmi?' havolasini bosing. Email manzilingizni kiriting va parolni tiklash bo'yicha ko'rsatmalar yuboriladi. Agar bu ham yordam bermasa, administrator bilan bog'laning."
    }
  ]

  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs

  return (
    <div className="flex-1">
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Yordam Markazi</h1>
            <p className="text-muted-foreground">Savollarga javoblar va qo'llanmalar</p>
          </div>
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Operatorga murojaat
          </Button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Savollar bo'yicha qidirish..."
            className="w-full pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="faq">
          <TabsList className="mb-6">
            <TabsTrigger value="faq">Ko'p so'raladigan savollar</TabsTrigger>
            <TabsTrigger value="guides">Qo'llanmalar</TabsTrigger>
            <TabsTrigger value="contact">Bog'lanish</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Ko'p so'raladigan savollar</CardTitle>
                <CardDescription>Tizimdan foydalanish bo'yicha tez-tez so'raladigan savollar</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-lg font-medium">Savollar topilmadi</p>
                      <p className="text-muted-foreground mb-4">Boshqa so'z bilan qidirib ko'ring</p>
                    </div>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="guides">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Mehmonlarni boshqarish
                  </CardTitle>
                  <CardDescription>Mehmonlarni ro'yxatga olish va boshqarish</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Bu qo'llanma mehmonlarni tizimga qo'shish, ularning ma'lumotlarini tahrirlash va mehmonlar bilan bog'liq barcha operatsiyalarni bajarish haqida.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Qo'llanmani ko'rish</Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Video qo'llanmalar
                  </CardTitle>
                  <CardDescription>Tizimdan foydalanish bo'yicha video ko'rsatmalar</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Bu bo'limda tizimning asosiy funktsiyalari bo'yicha videoqo'llanmalar mavjud. Har bir jarayon bosqichma-bosqich ko'rsatilgan.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Videolarni ko'rish</Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    To'liq qo'llanma
                  </CardTitle>
                  <CardDescription>Tizimning to'liq dokumentatsiyasi</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Tizimning barcha imkoniyatlari haqida batafsil ma'lumot olish uchun to'liq qo'llanmani o'qing. Barcha funktsiyalar batafsil ko'rsatilgan.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Qo'llanmani ochish</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Bog'lanish ma'lumotlari</CardTitle>
                  <CardDescription>Yordam va qo'llab-quvvatlash xizmati</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Telefon</p>
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">+998 90 123 45 67</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard("+998 90 123 45 67")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">support@hotelpro.uz</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard("support@hotelpro.uz")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Link2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Veb-sayt</p>
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">www.hotelpro.uz</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard("www.hotelpro.uz")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Xabar yuborish
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ish vaqti</CardTitle>
                  <CardDescription>Qo'llab-quvvatlash markazi ish vaqti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Dushanba - Juma</span>
                      <span className="text-muted-foreground">09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Shanba</span>
                      <span className="text-muted-foreground">10:00 - 15:00</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Yakshanba</span>
                      <span className="text-muted-foreground">Dam olish kuni</span>
                    </div>
                    <div className="flex justify-between py-4">
                      <span className="font-medium">Favqulodda holatlar uchun</span>
                      <span className="text-muted-foreground">24/7</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  <p>Favqulodda holatlar uchun +998 90 999 99 99 raqamiga qo'ng'iroq qiling</p>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 