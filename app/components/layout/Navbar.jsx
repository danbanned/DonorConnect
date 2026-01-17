'use client'

import { useState, useRef, useEffect } from 'react'
import { useCurrentAccount } from '../../hooks/usecurrentaccount'
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
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import './Navbar.css'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Donors', href: '/donors', icon: UserGroupIcon },
  { name: 'Donations', href: '/donations', icon: CurrencyDollarIcon },
  { name: 'Communications', href: '/communications', icon: EnvelopeIcon },
  { name: 'Insights', href: '/insights', icon: ChartBarIcon },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)
  
  // Get current account from hook - THIS IS THE RIGHT SPOT
  const { account, loading, error } = useCurrentAccount()
  console.log('Current account in Navbar:', account)

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
      const res = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      if (res.ok) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
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
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="navbar-actions">
            {/* Notifications */}
            <div className="navbar-notifications">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="navbar-notifications-button"
              >
                <BellIcon />
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

            {/* User profile - UPDATED TO USE ACCOUNT DATA */}
            <div className="navbar-user-profile" ref={menuRef}>
              {loading ? (
                // Loading state
                <div className="navbar-user-info">
                  <p className="navbar-user-name animate-pulse">Loading...</p>
                  <p className="navbar-user-role animate-pulse">&nbsp;</p>
                </div>
              ) : error ? (
                // Error state
                <div className="navbar-user-info">
                  <p className="navbar-user-name text-red-500">Error</p>
                  <p className="navbar-user-role text-xs text-red-400">Could not load user</p>
                </div>
              ) : account ? (
                // Authenticated state
                <>
                  <div className="navbar-user-info" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                    <p className="navbar-user-name">
                      {account.name || account.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="navbar-user-role">
                      {account.role || 'User'}
                    </p>
                  </div>
                  <div className="navbar-user-avatar" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                    <UserCircleIcon className="h-8 w-8 text-gray-700 hover:text-gray-900" />
                  </div>
                </>
              ) : (
                // Not authenticated state
                <div className="navbar-user-info">
                  <p className="navbar-user-name">Not logged in</p>
                  <Link 
                    href="/login"
                    className="navbar-user-role text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Sign in
                  </Link>
                </div>
              )}

              {userMenuOpen && account && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-50">
                  {/* User info in dropdown */}
                  <div className="px-4 py-2 border-b">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {account.name || account.email?.split('@')[0] || 'User'}
                      </p>
                      {account.role && (
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                          account.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : account.role === 'STAFF'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {account.role}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{account.email}</p>
                    {account.organization && (
                      <p className="text-xs text-gray-400 mt-1">{account.organization.name}</p>
                    )}
                  </div>
                  
                  {/* Admin-only link */}
                  {account.role === 'ADMIN' && (
                    <Link
                      href="/admin-only"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ShieldCheckIcon className="h-4 w-4" />
                      Admin Settings
                    </Link>
                  )}
                  
                  {/* Regular user links */}
                  <Link
                    href="/myprofile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    My Profile
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                    Account Settings
                  </Link>
                  
                  {account.organization && (
                    <Link
                      href="/organization"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Organization
                    </Link>
                  )}
                  
                  <div className="border-t">
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="navbar-mobile-button"
            >
              {mobileMenuOpen ? (
                <XMarkIcon />
              ) : (
                <Bars3Icon />
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
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Mobile admin link for admins */}
              {account?.role === 'ADMIN' && (
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-purple-700 bg-purple-50 border-l-4 border-purple-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  Admin Settings
                </Link>
              )}
              
              {/* Mobile user links */}
              {account && (
                <>
                  <Link
                    href="/myprofile"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-5 w-5" />
                    My Profile
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Cog6ToothIcon className="h-5 w-5" />
                    Account Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}