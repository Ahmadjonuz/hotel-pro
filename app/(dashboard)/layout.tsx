import type React from "react"
import { MainNav } from "@/components/main-nav"
import { Header } from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <MainNav />
      <div className="flex-1 flex flex-col">
        <Header />
        {children}
      </div>
    </div>
  )
}

