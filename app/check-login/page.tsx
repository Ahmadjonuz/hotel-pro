"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CheckLoginPage() {
  const [loginStatus, setLoginStatus] = useState<any>(null)
  const [cookies, setCookies] = useState<string[]>([])
  
  useEffect(() => {
    async function checkLogin() {
      try {
        // Get cookie list
        const cookieList = document.cookie.split(';').map(c => c.trim())
        setCookies(cookieList)
        
        // Check session from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        setLoginStatus({
          hasSession: !!data.session,
          sessionExpires: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toString() : null,
          sessionUser: data.session?.user?.email || null,
          error: error ? error.message : null
        })
      } catch (err: any) {
        setLoginStatus({ error: err.message })
      }
    }
    
    checkLogin()
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Login Status Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white p-4 rounded-md border">
            <h3 className="font-medium mb-2">Session Status:</h3>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(loginStatus, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white p-4 rounded-md border">
            <h3 className="font-medium mb-2">Cookies:</h3>
            {cookies.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {cookies.map((cookie, i) => (
                  <li key={i} className="text-sm">{cookie}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No cookies found</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              asChild 
              className="flex-1"
            >
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="flex-1"
            >
              <a href="/auth/login">Go to Login</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 