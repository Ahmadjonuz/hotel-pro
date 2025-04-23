"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AuthBridgePage() {
  const [status, setStatus] = useState("Initializing...")
  const [isClient, setIsClient] = useState(false)
  
  // First useEffect just to mark we're on client side to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Second useEffect runs authentication logic only after we're confirmed on client
  useEffect(() => {
    if (!isClient) return
    
    async function initSession() {
      try {
        setStatus("Checking auth state...")
        
        // First check if we already have a session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error checking session:", error)
          setStatus(`Auth error: ${error.message}`)
          return
        }
        
        if (!session) {
          setStatus("No active session found. Redirecting to login...")
          setTimeout(() => {
            window.location.href = "/auth/login"
          }, 1000)
          return
        }
        
        // If we have a session, let's verify it's still valid
        setStatus("Session found. Verifying...")
        
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (userError || !user) {
            setStatus("Session invalid. Redirecting to login...")
            setTimeout(() => {
              window.location.href = "/auth/login"
            }, 1000)
            return
          }
          
          // Successfully verified, redirect to dashboard
          setStatus("Session verified! Redirecting to dashboard...")
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 500)
        } catch (verifyError) {
          console.error("Error verifying user:", verifyError)
          setStatus("Error verifying session. Try logging in again.")
          setTimeout(() => {
            window.location.href = "/auth/login"
          }, 1500)
        }
      } catch (e) {
        console.error("Unexpected error in auth bridge:", e)
        setStatus("An unexpected error occurred. Redirecting to login...")
        setTimeout(() => {
          window.location.href = "/auth/login"
        }, 1500)
      }
    }
    
    initSession()
  }, [isClient])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-2xl font-bold mb-4">Authentication Bridge</div>
      <div className="mb-6 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
      </div>
      <div className="text-gray-600">{status}</div>
      <div className="mt-8 text-sm text-gray-500">This page ensures your session is properly set before accessing the dashboard.</div>
    </div>
  )
} 