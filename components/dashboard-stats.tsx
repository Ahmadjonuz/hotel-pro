"use client"

import { memo, useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCachedData } from "@/hooks/use-cached-data"

interface ChartData {
  name: string
  revenue?: number
  occupancy?: number
  bookings?: number
}

// Sample data for dashboard stats
const sampleData: ChartData[] = [
  { name: "Jan", revenue: 10800, occupancy: 65, bookings: 85 },
  { name: "Feb", revenue: 12200, occupancy: 68, bookings: 92 },
  { name: "Mar", revenue: 13100, occupancy: 70, bookings: 98 },
  { name: "Apr", revenue: 15400, occupancy: 78, bookings: 110 },
  { name: "May", revenue: 18200, occupancy: 82, bookings: 125 },
  { name: "Jun", revenue: 21800, occupancy: 86, bookings: 148 },
  { name: "Jul", revenue: 25600, occupancy: 92, bookings: 162 },
  { name: "Aug", revenue: 28200, occupancy: 94, bookings: 170 },
  { name: "Sep", revenue: 24100, occupancy: 88, bookings: 145 },
  { name: "Oct", revenue: 19800, occupancy: 84, bookings: 130 },
  { name: "Nov", revenue: 17200, occupancy: 80, bookings: 115 },
  { name: "Dec", revenue: 19600, occupancy: 82, bookings: 125 },
]

const Chart = memo(({ data, dataKey }: { data: ChartData[], dataKey: 'revenue' | 'occupancy' | 'bookings' }) => (
  <ResponsiveContainer width="100%" height={350}>
    <LineChart data={data}>
      <Line
        type="monotone"
        dataKey={dataKey}
        strokeWidth={2}
        activeDot={{
          r: 6,
          style: { fill: "var(--primary)", opacity: 0.8 },
        }}
        style={{
          stroke: "var(--primary)",
          opacity: 0.5,
        }}
      />
      <Tooltip
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            const value = payload[0].value
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">{dataKey}:</span>
                  <span className="font-medium">
                    {dataKey === 'revenue' ? `$${value}` : dataKey === 'occupancy' ? `${value}%` : value}
                  </span>
                </div>
              </div>
            )
          }
          return null
        }}
      />
    </LineChart>
  </ResponsiveContainer>
))

Chart.displayName = 'Chart'

export function DashboardStats() {
  const { data: chartData, loading } = useCachedData<ChartData[]>(
    async () => sampleData, // Replace with actual API call
    { key: 'dashboard-stats', ttl: 5 * 60 * 1000 } // 5 minutes cache
  )

  const revenueData = useMemo(() => 
    chartData?.map(({ name, revenue }) => ({ name, revenue })) ?? [],
    [chartData]
  )

  const occupancyData = useMemo(() => 
    chartData?.map(({ name, occupancy }) => ({ name, occupancy })) ?? [],
    [chartData]
  )

  const bookingsData = useMemo(() => 
    chartData?.map(({ name, bookings }) => ({ name, bookings })) ?? [],
    [chartData]
  )

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Tabs defaultValue="revenue" className="space-y-4">
      <TabsList>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
      </TabsList>
      <TabsContent value="revenue" className="space-y-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-rose-500" />
                            <div>Revenue</div>
                          </div>
                          <div className="font-medium">${payload?.[0]?.value?.toLocaleString?.() ?? ""}</div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line type="monotone" dataKey="revenue" strokeWidth={2} activeDot={{ r: 6 }} stroke="#ec4899" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
      <TabsContent value="occupancy" className="space-y-4">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold">Occupancy</h2>
                <p className="text-sm text-muted-foreground">
                  Monthly occupancy statistics
                </p>
              </div>
            </div>
            <div className="h-[350px]">
              <Chart data={occupancyData} dataKey="occupancy" />
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="bookings" className="space-y-4">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold">Bookings</h2>
                <p className="text-sm text-muted-foreground">
                  Monthly bookings statistics
                </p>
              </div>
            </div>
            <div className="h-[350px]">
              <Chart data={bookingsData} dataKey="bookings" />
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

