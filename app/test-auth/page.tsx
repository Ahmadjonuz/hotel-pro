"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([])

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true)
        setError(null)
        
        // Set localStorage keys
        setLocalStorageKeys(Object.keys(localStorage))
        
        // Get session from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error.message)
          return
        }
        
        setSession(data.session)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('supabase.auth.token')
      window.location.href = '/auth/login'
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2">Checking auth state...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : session ? (
            <>
              <div className="p-4 bg-green-50 text-green-800 rounded-md">
                <p className="font-semibold">Authenticated</p>
                <p className="text-sm">User ID: {session.user.id}</p>
                <p className="text-sm">Email: {session.user.email}</p>
                <p className="text-sm truncate">Token (starts with): {session.access_token.substring(0, 20)}...</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  asChild
                  className="flex-1"
                >
                  <a href="/auth-bridge">Go to Dashboard (Safe)</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                >
                  <a href="/dashboard">Go to Dashboard (Direct)</a>
                </Button>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full mt-2"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                <p className="font-semibold">Not Authenticated</p>
                <p className="text-sm">You are not currently logged in.</p>
              </div>
              <Button 
                asChild 
                className="w-full"
              >
                <a href="/auth/login">Go to Login</a>
              </Button>
            </>
          )}
          
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-60">
            <p className="font-bold">Debug Info:</p>
            <p>LocalStorage Keys: {localStorageKeys.join(', ')}</p>
            <p>Session Data:</p>
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 