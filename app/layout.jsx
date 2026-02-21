'use client'

import './globals.css'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import './Layout.css'
import { AuthProvider } from './providers/AuthProvider'
import { AIProvider } from './providers/AIProvider'
import { QuickActionsProvider } from './providers/QuickActionsProvider'
import QuickActions from './components/QuickActions'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const isPublicRoute = ['/', '/login', '/sign-in', '/register', '/forgot-password', '/reset-password'].includes(pathname)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <html lang="en">
      <body>
        <div className="layout-container">
          {isPublicRoute ? (
            <main>{children}</main>
          ) : (
            <AIProvider>
              <AuthProvider>
                {/* Navbar - This should stay at the top */}
                <Navbar />
                
                {/* Main content area WITHOUT page-with-sidebar wrapper */}
                <main className="main-content">
                  {children}
                  
                  {/* QuickActions should be inside main content or positioned absolutely */}
                  {mounted && (
                    <div className="quick-actions-wrapper">
                      <QuickActionsProvider>
                        <QuickActions />
                      </QuickActionsProvider>
                    </div>
                  )}
                </main>
                
                <Footer />
              </AuthProvider>
            </AIProvider>
          )}
        </div>
      </body>
    </html>
  )
}
