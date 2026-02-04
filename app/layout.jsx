'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import './Layout.css'
import { AuthProvider } from './providers/AuthProvider'
import { AIProvider } from './providers/AIProvider'
import { QuickActionsProvider } from './providers/QuickActionsProvider' // New provider
import QuickActions from './components/QuickActions'
import { useState, useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

//export const metadata = {
//  title: 'DonorConnect - Smart Donor Management',
// description: 'Intelligent CRM for nonprofit donor relationships',
// }

export default function RootLayout({ children }) {
  // We'll move the QuickActions component state management here
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="layout-container">
          {/* Wrap everything in AIProvider */}
          <AIProvider>
            <AuthProvider>
              {/* Navbar will have AI indicator */}
              <Navbar />


                <div className="page-with-sidebar">
                  <main className="main-content">
                    {children}
                  </main>

                  {mounted && (
                    <aside className="quick-actions-wrapper">
                      <QuickActionsProvider>
                        <QuickActions />
                      </QuickActionsProvider>
                    </aside>
                  )}
                </div>
                
              <Footer />
              

            </AuthProvider>
          </AIProvider>
        </div>
      </body>
    </html>
  )
}