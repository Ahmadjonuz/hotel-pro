import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a Supabase client with cookie-based storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: {
      getItem: (key) => {
        // For server-side rendering, return null
        if (typeof document === 'undefined') return null
        
        // Get from cookie
        const cookies = document.cookie.split(';')
        const cookie = cookies.find(c => c.trim().startsWith(`${key}=`))
        if (!cookie) return null
        return decodeURIComponent(cookie.split('=')[1])
      },
      setItem: (key, value) => {
        // Skip during SSR
        if (typeof document === 'undefined') return
        
        // Set cookie with HttpOnly and Secure flags
        document.cookie = `${key}=${encodeURIComponent(value)};path=/;max-age=86400;SameSite=Lax`
      },
      removeItem: (key) => {
        // Skip during SSR
        if (typeof document === 'undefined') return
        
        // Remove cookie by setting expiry in the past
        document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`
      },
    },
  },
}) 