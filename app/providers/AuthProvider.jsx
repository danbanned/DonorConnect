// app/providers/AuthProvider.jsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { hasPermission, isAdminRole } from '../../lib/access-control'

const AuthContext = createContext({})
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password']

function getPostLoginRoute(user) {
  if (!user) return '/login'
  return '/dashboard'
}

function canAccessPath(user, pathname) {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  if (!user) return false

  if (pathname.startsWith('/settings')) {
    return hasPermission(user, 'access_settings')
  }

  if (pathname.startsWith('/admin')) {
    return isAdminRole(user.role)
  }

  return true
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    // Check session on route changes (except for public routes)
    checkSession()
  }, [pathname])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (response.ok && data.user) {
        setUser(data.user)

        if (PUBLIC_ROUTES.includes(pathname) && pathname !== '/') {
          router.push(getPostLoginRoute(data.user))
          return
        }

        if (!canAccessPath(data.user, pathname)) {
          router.push(getPostLoginRoute(data.user))
          return
        }
      } else {
        setUser(null)
        
        // Redirect to login if on protected page
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        }
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, rememberMe) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        router.push(getPostLoginRoute(data.user))
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      router.push('/login')
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
