"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Namuna hisobot ma'lumotlari
const revenueData = [
  { month: "Yan", revenue: 10800, lastYear: 9500 },
  { month: "Fev", revenue: 12200, lastYear: 10800 },
  { month: "Mar", revenue: 13100, lastYear: 11500 },
  { month: "Apr", revenue: 15400, lastYear: 13200 },
  { month: "May", revenue: 18200, lastYear: 15800 },
  { month: "Iyn", revenue: 21800, lastYear: 18500 },
  { month: "Iyl", revenue: 25600, lastYear: 22000 },
  { month: "Avg", revenue: 28200, lastYear: 24500 },
  { month: "Sen", revenue: 24100, lastYear: 21000 },
  { month: "Okt", revenue: 19800, lastYear: 17500 },
  { month: "Noy", revenue: 17200, lastYear: 15000 },
  { month: "Dek", revenue: 19600, lastYear: 16800 },
]

const occupancyData = [
  { month: "Yan", standard: 65, deluxe: 70, suite: 55 },
  { month: "Fev", standard: 68, deluxe: 72, suite: 60 },
  { month: "Mar", standard: 70, deluxe: 75, suite: 65 },
  { month: "Apr", standard: 78, deluxe: 80, suite: 70 },
  { month: "May", standard: 82, deluxe: 85, suite: 75 },
  { month: "Iyn", standard: 86, deluxe: 90, suite: 80 },
  { month: "Iyl", standard: 92, deluxe: 95, suite: 85 },
  { month: "Avg", standard: 94, deluxe: 98, suite: 90 },
  { month: "Sen", standard: 88, deluxe: 92, suite: 80 },
  { month: "Okt", standard: 82, deluxe: 85, suite: 75 },
  { month: "Noy", standard: 76, deluxe: 80, suite: 70 },
  { month: "Dek", standard: 80, deluxe: 85, suite: 75 },
]

const bookingSourceData = [
  { name: "Veb-sayt orqali", value: 45 },
  { name: "Onlayn bronlash agentliklari", value: 30 },
  { name: "Telefon orqali", value: 15 },
  { name: "To'g'ridan-to'g'ri", value: 10 },
]

const COLORS = ["#f43f5e", "#ec4899", "#be185d", "#9f1239"]

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState("year")

  return (
    <div className="flex-1">
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hisobotlar va tahlillar</h1>
            <p className="text-muted-foreground">Mehmonxona ko'rsatkichlarini tahlil qiling</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select defaultValue={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vaqt oralig'ini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Shu oy</SelectItem>
                <SelectItem value="quarter">Shu chorak</SelectItem>
                <SelectItem value="year">Shu yil</SelectItem>
                <SelectItem value="custom">Boshqa oraliq</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrlar
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Yuklab olish
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="overview">Umumiy</TabsTrigger>
            <TabsTrigger value="revenue">Daromad</TabsTrigger>
            <TabsTrigger value="occupancy">Band bo'lish</TabsTrigger>
            <TabsTrigger value="guests">Mehmonlar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Jami daromad</CardTitle>
                  <CardDescription>Yil boshidan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$226,000</div>
                  <p className="text-sm text-muted-foreground">O'tgan yilga nisbatan +12.5%</p>
                  <div className="h-[150px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <Line type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2} dot={false} />
                        <Line
                          type="monotone"
                          dataKey="lastYear"
                          stroke="#e5e7eb"
                          strokeWidth={2}
                          dot={false}
                          strokeDasharray="4 4"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>O'rtacha band bo'lish</CardTitle>
                  <CardDescription>Yil boshidan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">78.5%</div>
                  <p className="text-sm text-muted-foreground">O'tgan yilga nisbatan +5.2%</p>
                  <div className="h-[150px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={occupancyData}>
                        <Bar dataKey="standard" fill="#f43f5e" />
                        <Bar dataKey="deluxe" fill="#ec4899" />
                        <Bar dataKey="suite" fill="#be185d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Bronlash manbalari</CardTitle>
                  <CardDescription>Taqsimot kanallari</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingSourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {bookingSourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daromad taqsimoti</CardTitle>
                <CardDescription>Xona turlari bo'yicha oylik daromad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar name="Standart" dataKey="standard" fill="#f43f5e" />
                      <Bar name="Deluxe" dataKey="deluxe" fill="#ec4899" />
                      <Bar name="Lyuks" dataKey="suite" fill="#be185d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daromad tahlili</CardTitle>
                <CardDescription>Batafsil daromad ma'lumotlari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line name="Joriy yil" type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2} />
                      <Line name="O'tgan yil" type="monotone" dataKey="lastYear" stroke="#e5e7eb" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="occupancy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Band bo'lish darajasi</CardTitle>
                <CardDescription>Xona turlari bo'yicha band bo'lish</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar name="Standart" dataKey="standard" fill="#f43f5e" />
                      <Bar name="Deluxe" dataKey="deluxe" fill="#ec4899" />
                      <Bar name="Lyuks" dataKey="suite" fill="#be185d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mehmonlar statistikasi</CardTitle>
                <CardDescription>Mehmonlar haqida ma'lumot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingSourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {bookingSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

