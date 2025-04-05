"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Test the connection by trying to get the Supabase URL
      const url = supabase.supabaseUrl

      // Try to query the database
      const { data, error } = await supabase.from("rooms").select("*").limit(5)

      if (error) throw error

      setResult({
        connection: "Success",
        url,
        data,
      })
    } catch (err: any) {
      console.error("Connection error:", err)
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Test your connection to Supabase and view the results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? "Testing..." : "Test Connection"}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                <h3 className="font-medium">Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
                <h3 className="font-medium">Connection Successful</h3>
                <p className="text-sm">Connected to: {result.url}</p>

                {result.data && (
                  <div className="mt-4">
                    <h4 className="font-medium">Data Preview:</h4>
                    <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-[200px]">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            If the connection is successful, you should see your Supabase URL and data (if available).
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

