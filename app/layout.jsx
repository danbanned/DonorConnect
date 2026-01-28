// app/layout.js - UPDATED VERSION
import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import './Layout.css'
import { AuthProvider } from './providers/AuthProvider'
import { AIProvider } from './providers/AIProvider'  // New AI Provider

import AINotifications from './components/ai/AINotifications'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DonorConnect - Smart Donor Management',
  description: 'Intelligent CRM for nonprofit donor relationships',
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={inter.className}>

   
        <div className="layout-container">
          {/* Wrap everything in AIProvider */}
          <AIProvider>
      
            <AuthProvider>

              
              {/* Navbar will have AI indicator */}
              <Navbar />
              
             <main className="main-content">
                {children}
              </main>
              
              <Footer />
            </AuthProvider>
          </AIProvider>
        </div>
      </body>
    </html>
  )
}