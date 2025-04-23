"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import Head from 'next/head'

export default function HomePage() {
  const [email, setEmail] = useState("admin@hotel.com")
  const [password, setPassword] = useState("admin2125")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      toast.info("Logging in...")
      
      // Reset any previous session
      await supabase.auth.signOut()
      
      // Try login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(`Login failed: ${error.message}`)
        console.error("Login error:", error)
        return
      }

      if (!data.session) {
        toast.error("No session data returned")
        console.error("No session data")
        return
      }

      // Explicitly set cookies
      document.cookie = `sb-access-token=${data.session.access_token};path=/;max-age=86400;SameSite=Lax`
      document.cookie = `sb-refresh-token=${data.session.refresh_token};path=/;max-age=86400;SameSite=Lax`
      
      toast.success("Login successful!")
      
      // Hard redirect
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1000)
    } catch (error: any) {
      toast.error(`Unexpected error: ${error.message}`)
      console.error("Login exception:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          background-color: white;
          overflow: hidden;
        }
        .login-header {
          padding: 1.5rem 1.5rem 0.5rem 1.5rem;
        }
        .login-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .login-description {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .login-body {
          padding: 1.5rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        .form-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 1px #6366f1;
        }
        .login-button {
          width: 100%;
          padding: 0.5rem 1rem;
          background-color: #6366f1;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .login-button:hover {
          background-color: #4f46e5;
        }
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .form-hint {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: #6b7280;
          text-align: center;
        }
      `}</style>
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h3 className="login-title">Hotel Pro Login</h3>
            <p className="login-description">Enter your credentials to access the dashboard</p>
          </div>
          <div className="login-body">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="admin@hotel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="login-button" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              
              <div className="form-hint">
                Default admin: admin@hotel.com / admin2125
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

