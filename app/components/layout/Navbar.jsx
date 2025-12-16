'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon
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
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

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

            {/* User profile */}
            <div className="navbar-user-profile">
              <div className="navbar-user-info">
                <p className="navbar-user-name">John Smith</p>
                <p className="navbar-user-role">Development Director</p>
              </div>
              <div className="navbar-user-avatar">
                <UserCircleIcon />
              </div>
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
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}