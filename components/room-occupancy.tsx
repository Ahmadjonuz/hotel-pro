"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Sample occupancy data
const occupancyData = [
  { date: "Apr 1", standard: 65, deluxe: 80, suite: 50 },
  { date: "Apr 5", standard: 75, deluxe: 90, suite: 60 },
  { date: "Apr 10", standard: 85, deluxe: 95, suite: 70 },
  { date: "Apr 15", standard: 90, deluxe: 100, suite: 85 },
  { date: "Apr 20", standard: 80, deluxe: 85, suite: 75 },
  { date: "Apr 25", standard: 70, deluxe: 80, suite: 65 },
  { date: "Apr 30", standard: 75, deluxe: 85, suite: 70 },
]

export default function RoomOccupancy() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={occupancyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="standard" name="Standard Rooms" fill="#ec4899" />
          <Bar dataKey="deluxe" name="Deluxe Rooms" fill="#f43f5e" />
          <Bar dataKey="suite" name="Suites" fill="#be185d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

