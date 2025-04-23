import { MainNav } from "@/components/main-nav"
import { Header } from "@/components/header"

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <MainNav />
        <div className="flex flex-col flex-1">
          <Header />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 