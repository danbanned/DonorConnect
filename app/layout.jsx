import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import './Layout.css'

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
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}