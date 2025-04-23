"use client"

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#f43f5e", "#ec4899", "#be185d", "#9f1239", "#881337"]

interface ChartProps {
  data: any[]
  height?: number
}

interface LineChartProps extends ChartProps {
  xField: string
  yField: string
}

interface BarChartProps extends ChartProps {
  xField: string
  yField: string
}

interface PieChartProps extends ChartProps {
  nameField: string
  valueField: string
}

export function LineChart({ data, xField, yField, height = 350 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={yField}
          stroke="#f43f5e"
          strokeWidth={2}
          dot={false}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function BarChart({ data, xField, yField, height = 350 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={yField} fill="#f43f5e" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export function PieChart({ data, nameField, valueField, height = 350 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          nameKey={nameField}
          dataKey={valueField}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#f43f5e"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
} 