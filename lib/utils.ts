import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  // Ensure amount is a valid number
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    console.warn("Invalid amount provided to formatCurrency:", amount);
    return "-"; // Or return a default placeholder
  }
  
  // Format the number part using uz-UZ locale for correct grouping
  const numberFormatter = new Intl.NumberFormat('uz-UZ', {
    style: 'decimal', // Format as a plain number
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  const formattedNumber = numberFormatter.format(numericAmount);
  
  // Manually append the currency symbol with a non-breaking space
  return `${formattedNumber}\u00A0soʻm`; // \u00A0 is a non-breaking space
}

export function handleSupabaseError(error: any) {
  console.error("Supabase error:", error)
  return {
    data: null,
    error: {
      message: error?.message || "An unexpected error occurred",
      details: error?.details || null
    }
  }
}
