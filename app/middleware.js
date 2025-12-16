import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

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

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify token
    const user = await verifyToken(token)
    
    // Add user to request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email)
    requestHeaders.set('x-user-role', user.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Authentication error:', error)
    
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. /public (public files)
     * 6. /login (login page)
     * 7. / (home page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|login$|^/$).*)',
  ],
}