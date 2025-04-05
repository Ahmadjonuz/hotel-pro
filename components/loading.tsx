'use client'

import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex h-[200px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  )
}
