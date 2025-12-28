// middleware.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/donors',
  '/donations',
  '/communications',
  '/insights',
  '/api/donors',
  '/api/donations',
  '/api/communications',
  '/api/insights',
]

// Public routes (no authentication required)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth',       // base
  '/api/auth/',      // ALL auth subroutes
]

// Routes that require specific roles
const roleBasedRoutes = {
  '/admin': ['ADMIN'],
  '/api/admin': ['ADMIN'],
  '/settings': ['ADMIN'],
  '/api/settings': ['ADMIN'],
}

// Check if path matches a route pattern
const isPathProtected = (pathname) => {
  // Check if it's a public route first
  if (publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )) {
    return false
  }
  
  // Check if it's a protected route
  return protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

// Check if path requires specific role
const getRequiredRole = (pathname) => {
  for (const [route, roles] of Object.entries(roleBasedRoutes)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return roles
    }
  }
  return null
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }
  
  // Check if route is protected
  if (!isPathProtected(pathname)) {
    return NextResponse.next()
  }
  
  try {
    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    
    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      console.error('JWT verification error:', error.message)
      // Token is invalid or expired
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('error', 'session_expired')
      
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('auth_token')
      response.cookies.delete('refresh_token')
      return response
    }
    
    // Check if session exists in database and is still valid
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        token: token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    })
    
    if (!session) {
      // Session not found or expired
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('error', 'session_invalid')
      
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('auth_token')
      response.cookies.delete('refresh_token')
      return response
    }
    
    // Check role-based access
    const requiredRoles = getRequiredRole(pathname)
    if (requiredRoles && !requiredRoles.includes(decoded.role)) {
      // User doesn't have required role
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    // Update session last activity
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() }
    })
    
    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.userId)
    requestHeaders.set('x-user-email', decoded.email)
    requestHeaders.set('x-user-role', decoded.role)
    requestHeaders.set('x-organization-id', decoded.organizationId || '')
    requestHeaders.set('x-session-id', session.id)
    
    // Check for API routes and set appropriate headers
    if (pathname.startsWith('/api/')) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
    
    // For page routes, continue normally
    return NextResponse.next()
    
  } catch (error) {
    console.error('Middleware error:', error)
    
    // In case of any error, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('error', 'server_error')
    
    return NextResponse.redirect(loginUrl)
  }
}

// Define which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/static (static files)
     * 2. /_next/image (image optimization files)
     * 3. /favicon.ico (favicon file)
     * 4. /public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|components|hooks|providers).*)',
  ],
}