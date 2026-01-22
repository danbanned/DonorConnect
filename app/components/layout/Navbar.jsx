// app/components/layout/Navbar.jsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline'
import { useCurrentAccount } from '../../hooks/useCurrentAccount.js'
import { useAI } from '../../providers/AIProvider.jsx'
import './Navbar.css'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Donors', href: '/donors', icon: UserGroupIcon },
  { name: 'Donations', href: '/donations', icon: CurrencyDollarIcon },
  { name: 'Communications', href: '/communications', icon: EnvelopeIcon },
  { name: 'Insights', href: '/insights', icon: ChartBarIcon },
  { name: 'AI Dashboard', href: '/dashboard/AiDashboard', icon: SparklesIcon },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)
  
  // Get AI status from provider
  const { status, aiSystem, startSimulation, stopSimulation, isLoading } = useAI()
  const { account, loading: accountLoading } = useCurrentAccount()
  console.log('Current account in Navbar:', account, accountLoading)
  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        localStorage.removeItem('currentOrgId')
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleSimulationToggle = async () => {
    const orgId = localStorage.getItem('currentOrgId') || 'default-org'
    if (status.simulation?.isRunning) {
      await stopSimulation()
    } else {
      await startSimulation(orgId)
    }
  }

  const getAIStatusColor = () => {
    if (!status.initialized) return 'gray'
    if (status.simulation?.isRunning) return 'green'
    if (status.bonding?.activeSessions > 0) return 'blue'
    return 'yellow'
  }

  const getAIStatusText = () => {
    if (isLoading) return 'AI Loading...'
    if (!status.initialized) return 'AI Offline'
    if (status.simulation?.isRunning) return 'Simulation Running'
    if (status.bonding?.activeSessions > 0) return `${status.bonding.activeSessions} Active`
    return 'AI Ready'
  }

  const notifications = [
    { id: 1, message: 'LYBUNT alert: 5 donors haven\'t given this year', time: '2 hours ago', type: 'warning' },
    { id: 2, message: 'Meeting with John Smith tomorrow', time: '4 hours ago', type: 'info' },
    { id: 3, message: 'New donation: $1,000 from Sarah Johnson', time: '1 day ago', type: 'success' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="navbar-logo">
              <div className="navbar-logo-icon">
                <UserGroupIcon />
              </div>
              <span className="navbar-logo-text">DonorConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-desktop">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`navbar-desktop-link ${
                    isActive
                      ? 'navbar-desktop-link-active'
                      : 'navbar-desktop-link-inactive'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="navbar-actions">
            {/* AI Status Indicator */}
            <div className="ai-navbar-status">
              <div className={`ai-status-indicator ai-status-${getAIStatusColor()}`}>
                <SparklesIcon className="w-4 h-4" />
                <span className="ai-status-text">{getAIStatusText()}</span>
                
                {status.dataSummary && (
                  <div className="ai-stats">
                    <span className="ai-stat">👥 {status.dataSummary.totalDonors || 0}</span>
                    <span className="ai-stat">💰 {status.dataSummary.totalDonations || 0}</span>
                  </div>
                )}
              </div>
              
              {status.initialized && (
                <div className="ai-actions">
                  <button
                    onClick={handleSimulationToggle}
                    className={`ai-action-btn ${status.simulation?.isRunning ? 'stop' : 'start'}`}
                    disabled={isLoading}
                    title={status.simulation?.isRunning ? 'Stop Simulation' : 'Start Simulation'}
                  >
                    {status.simulation?.isRunning ? (
                      <StopIcon className="w-3 h-3" />
                    ) : (
                      <PlayIcon className="w-3 h-3" />
                    )}
                  </button>
                  
                  <Link
                    href="components/ai/AIDashboard"
                    className="ai-action-btn dashboard"
                    title="AI Dashboard"
                  >
                    <ChartBarIcon className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="navbar-notifications">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="navbar-notifications-button"
              >
                <BellIcon className="w-5 h-5" />
                <span className="navbar-notifications-badge">3</span>
              </button>

              {notificationsOpen && (
                <div className="navbar-notifications-dropdown">
                  <div className="navbar-notifications-header">
                    <h3 className="navbar-notifications-title">Notifications</h3>
                  </div>
                  <div className="navbar-notifications-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="navbar-notification-item"
                      >
                        <p className="navbar-notification-message">{notification.message}</p>
                        <p className="navbar-notification-time">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="navbar-notifications-footer">
                    <Link
                      href="/notifications"
                      className="navbar-notifications-link"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User profile */}
            <div className="navbar-user-profile" ref={menuRef}>
              <div className="navbar-user-info" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <p className="navbar-user-name">{account?.name || 'John Smith'}</p>
                <p className="navbar-user-role">{account?.role || 'Development Director'}</p>
              </div>
              <div className="navbar-user-avatar" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <UserCircleIcon className="h-8 w-8 text-gray-700 hover:text-gray-900" />
              </div>

              {userMenuOpen && (
                <div className="navbar-user-dropdown">
                  <button
                    className="navbar-user-dropdown-item"
                    onClick={() => router.push('/settings')}
                  >
                    Settings
                  </button>
                  <button
                    className="navbar-user-dropdown-item"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="navbar-mobile-button"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-links">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`navbar-mobile-link ${
                      isActive
                        ? 'navbar-mobile-link-active'
                        : 'navbar-mobile-link-inactive'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Mobile AI Status */}
              <div className="navbar-mobile-ai">
                <div className="flex items-center gap-2">
                  <SparklesIcon className={`w-4 h-4 ai-icon-${getAIStatusColor()}`} />
                  <span>{getAIStatusText()}</span>
                </div>
                {status.dataSummary && (
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>Donors: {status.dataSummary.totalDonors || 0}</span>
                    <span>Donations: {status.dataSummary.totalDonations || 0}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}