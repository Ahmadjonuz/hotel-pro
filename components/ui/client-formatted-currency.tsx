"use client"

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

interface ClientFormattedCurrencyProps {
  amount: number | null | undefined
  placeholder?: string
}

export function ClientFormattedCurrency({ amount, placeholder = "-" }: ClientFormattedCurrencyProps) {
  const [formattedAmount, setFormattedAmount] = useState<string>(placeholder)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // This effect runs only on the client
    setIsClient(true)
    if (typeof amount === 'number' && !isNaN(amount)) {
      setFormattedAmount(formatCurrency(amount))
    } else {
      setFormattedAmount(placeholder)
    }
  }, [amount, placeholder])

  // Render placeholder initially and on the server
  if (!isClient) {
    return <span>{placeholder}</span>
  }

  // Render the formatted amount once the client has mounted and formatted
  return <span>{formattedAmount}</span>
} 