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
  BellAlertIcon,
  UserCircleIcon,
  SparklesIcon,
  PlayIcon,
  StopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  TrashIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon as DollarIcon
} from '@heroicons/react/24/outline'
import { useCurrentAccount } from '../../hooks/useCurrentAccount.js'
import { useAI } from '../../providers/AIProvider.jsx'
import useAINotifications from '../ai/AINotifications' // Import the hook
import './Navbar.css'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Donors', href: '/donors', icon: UserGroupIcon },
  { name: 'Donations', href: '/donations', icon: CurrencyDollarIcon },
  { name: 'Communications', href: '/communications', icon: EnvelopeIcon },
  { name: 'Insights', href: '/insights', icon: ChartBarIcon },
 // { name: 'AI Dashboard', href: '/dashboard/AiDashboard', icon: SparklesIcon },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const notificationsRef = useRef(null)
  
  // Get AI status from provider
  const { status, aiSystem, startSimulation, stopSimulation, isLoading } = useAI()
  const { account, loading: accountLoading } = useCurrentAccount()
  
  // Use the new notifications hook
  const {
    notifications: aiNotifications,
    unreadCount,
    soundEnabled,
    isPaused,
    markAllRead,
    toggleSound,
    togglePause,
    clearAll,
    removeNotification,
    markAsRead,
    getNotificationIconClass,
    formatTime,
    notificationStats,
    addNotification,
    toggleSound: toggleNotificationSound,
    togglePause: toggleNotificationPause
  } = useAINotifications()

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false)
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
      // Add notification when simulation stops
      addNotification({
        type: 'simulation',
        title: 'Simulation Stopped',
        message: 'AI simulation has been stopped',
        importance: 'normal'
      })
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

  // Get notification icon component
  const getNotificationIcon = (type) => {
    const iconClass = getNotificationIconClass(type)
    switch (type) {
      case 'donation':
        return <DollarIcon className={`w-4 h-4 ${iconClass}`} />
      case 'simulation':
        return <SparklesIcon className={`w-4 h-4 ${iconClass}`} />
      case 'bonding':
        return <UserGroupIcon className={`w-4 h-4 ${iconClass}`} />
      case 'system':
      case 'ai':
        return <BellAlertIcon className={`w-4 h-4 ${iconClass}`} />
      default:
        return <BellIcon className={`w-4 h-4 ${iconClass}`} />
    }
  }

  // Handle test notification button (for debugging)
  const handleTestNotification = () => {
    addNotification({
      type: 'donation',
      title: 'Test Donation',
      message: 'This is a test notification from the AI system',
      importance: 'important',
      data: { amount: 1000, donor: 'Test Donor' }
    })
  }

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
                </div>
              )}
            </div>

            {/* AI Notifications */}
            <div className="navbar-notifications" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="navbar-notifications-button relative"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="navbar-notifications-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="navbar-notifications-dropdown">
                  <div className="navbar-notifications-header">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-purple-500" />
                      <h3 className="navbar-notifications-title">AI Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="ai-notifications-badge ml-2">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="navbar-notifications-controls">
                      <button
                        onClick={toggleSound}
                        className={`notification-control-btn ${soundEnabled ? 'sound-on' : 'sound-off'}`}
                        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                      >
                        {soundEnabled ? (
                          <SpeakerWaveIcon className="w-4 h-4" />
                        ) : (
                          <SpeakerXMarkIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={togglePause}
                        className={`notification-control-btn ${isPaused ? 'paused' : 'active'}`}
                        title={isPaused ? 'Resume notifications' : 'Pause notifications'}
                      >
                        {isPaused ? '▶' : '⏸'}
                      </button>
                      {aiNotifications.length > 0 && (
                        <>
                          <button
                            onClick={markAllRead}
                            className="notification-control-btn mark-read"
                            title="Mark all as read"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={clearAll}
                            className="notification-control-btn clear"
                            title="Clear all notifications"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="navbar-notifications-list">
                    {aiNotifications.length === 0 ? (
                      <div className="navbar-notifications-empty">
                        <BellIcon className="w-8 h-8 text-gray-300" />
                        <p className="text-gray-500 text-sm">No AI notifications yet</p>
                      </div>
                    ) : (
                      aiNotifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`navbar-notification-item ${notification.type} ${notification.importance} ${notification.read ? 'read' : 'unread'}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="notification-item-content">
                            <div className="notification-icon">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-details">
                              <div className="notification-header">
                                <h4 className="notification-title">{notification.title}</h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeNotification(notification.id)
                                  }}
                                  className="notification-close"
                                  title="Dismiss"
                                >
                                  <XMarkIcon className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="notification-message">{notification.message}</p>
                              <div className="notification-footer">
                                <span className="notification-time">
                                  <ClockIcon className="w-3 h-3" />
                                  {notification.formattedTime || formatTime(notification.timestamp)}
                                </span>
                                {notification.importance === 'important' && (
                                  <span className="notification-importance">Important</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="notification-unread-indicator" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  {aiNotifications.length > 0 && (
                    <div className="navbar-notifications-footer">
                      <div className="notification-stats">
                        <span className="text-xs text-gray-500">
                          {notificationStats.total} notifications • {notificationStats.importantCount} important
                        </span>
                      </div>
                    </div>
                  )}
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
                  {/* Debug: Add test notification button */}
                  <button
                    className="navbar-user-dropdown-item"
                    onClick={handleTestNotification}
                  >
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
                
                {/* Mobile Notifications Summary */}
                {unreadCount > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BellIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">AI Notifications</span>
                      </div>
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount} unread
                      </span>
                    </div>
                    {aiNotifications.slice(0, 2).map((notification) => (
                      <div key={notification.id} className="mt-2 text-sm text-gray-600 truncate">
                        {notification.title}
                      </div>
                    ))}
                    {aiNotifications.length > 2 && (
                      <button
                        onClick={() => {
                          setNotificationsOpen(true)
                          setMobileMenuOpen(false)
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        View all {aiNotifications.length} notifications →
                      </button>
                    )}
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