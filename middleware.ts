import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Get the pathname
  const path = req.nextUrl.pathname
  
  // Skip middleware for non-dashboard routes
  if (!path.startsWith('/dashboard')) {
    return NextResponse.next()
  }
  
  // Check for auth cookie
  const hasSbAuthCookie = req.cookies.has('sb-access-token') || 
                          req.cookies.has('sb-refresh-token')
  
  // Add debug header
  const res = NextResponse.next()
  res.headers.set('x-debug-has-auth-cookie', hasSbAuthCookie ? 'true' : 'false')
  
  // Redirect to home/login if not authenticated
  if (!hasSbAuthCookie) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
} 