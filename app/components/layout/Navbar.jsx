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
  CurrencyDollarIcon as DollarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useCurrentAccount } from '../../hooks/useCurrentAccount.js'
import { useAI } from '../../providers/AIProvider.jsx'
import useAINotifications from '../ai/AINotifications'
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
  const [adminSettingsOpen, setAdminSettingsOpen] = useState(false)
  const menuRef = useRef(null)
  const notificationsRef = useRef(null)
  const adminSettingsRef = useRef(null)
  const mobileMenuRef = useRef(null)
  
  const { status, startSimulation, stopSimulation, isLoading } = useAI()
  const { account } = useCurrentAccount()
  
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
    addNotification
  } = useAINotifications()

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      // Close user menu
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
      
      // Close notifications
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false)
      }
      
      // Close admin settings
      if (adminSettingsRef.current && !adminSettingsRef.current.contains(e.target)) {
        setAdminSettingsOpen(false)
      }
      
      // Close mobile menu
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(e.target) && 
          !e.target.closest('.navbar-mobile-button')) {
        setMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  // Close dropdowns when navigating
  useEffect(() => {
    setNotificationsOpen(false)
    setUserMenuOpen(false)
    setAdminSettingsOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        localStorage.removeItem('currentOrgId')
        router.push('/login')
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleSimulationToggle = async () => {
    const orgId = localStorage.getItem('currentOrgId') || 'default-org'
    if (status.simulation?.isRunning) {
      await stopSimulation()
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

  const isAdmin = account?.role === 'ADMIN' || account?.role === 'SUPER_ADMIN'

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo-section">
            <Link href="/" className="navbar-logo">
              <div className="navbar-logo-icon">
                <UserGroupIcon />
              </div>
              <span className="navbar-logo-text">DonorConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-desktop-links">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`navbar-desktop-link ${
                    isActive ? 'navbar-desktop-link-active' : 'navbar-desktop-link-inactive'
                  }`}
                >
                  <item.icon className="navbar-link-icon" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="navbar-actions-section">
            {/* AI Status Indicator */}
            <div className="ai-status-container">
              <div className={`ai-status-indicator ai-status-${getAIStatusColor()}`}>
                <SparklesIcon className="ai-status-icon" />
                <span className="ai-status-text">{getAIStatusText()}</span>
                
                {status.dataSummary && (
                  <div className="ai-stats">
                    <span className="ai-stat">👥 {status.dataSummary.totalDonors || 0}</span>
                    <span className="ai-stat">💰 {status.dataSummary.totalDonations || 0}</span>
                  </div>
                )}
              </div>
              
              {status.initialized && (
                <button
                  onClick={handleSimulationToggle}
                  className={`ai-simulation-btn ${status.simulation?.isRunning ? 'stop' : 'start'}`}
                  disabled={isLoading}
                  title={status.simulation?.isRunning ? 'Stop Simulation' : 'Start Simulation'}
                >
                  {status.simulation?.isRunning ? (
                    <StopIcon className="ai-simulation-icon" />
                  ) : (
                    <PlayIcon className="ai-simulation-icon" />
                  )}
                </button>
              )}
            </div>

            {/* Admin Settings Button */}
            {isAdmin && (
              <div className="navbar-admin-wrapper" ref={adminSettingsRef}>
                <button
                  onClick={() => {
                    setAdminSettingsOpen(!adminSettingsOpen)
                    setNotificationsOpen(false)
                    setUserMenuOpen(false)
                  }}
                  className="navbar-admin-btn"
                  title="Admin Settings"
                >
                  <Cog6ToothIcon className="navbar-admin-icon" />
                  {adminSettingsOpen && (
                    <div className="navbar-admin-dropdown">
                      <div className="navbar-admin-header">
                        <h3 className="navbar-admin-title">Admin look</h3>
                        <span className="navbar-admin-badge">ADMIN</span>
                      </div>
                      <div className="navbar-admin-content">
                        <p className="navbar-admin-message">Admin settings panel would appear here.</p>
                        <div className="navbar-admin-actions">
                          <button className="navbar-admin-action-btn">
                            Manage Users
                          </button>
                           <Link href="/admin-only">
                            <button className="navbar-admin-action-btn">
                            Admin Settings
                          </button>
                           </Link>
        
                          <button className="navbar-admin-action-btn">
                            API Keys
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Notifications */}
            <div className="navbar-notifications-wrapper" ref={notificationsRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setAdminSettingsOpen(false)
                  setUserMenuOpen(false)
                }}
                className="navbar-notifications-btn"
              >
                <BellIcon className="navbar-notifications-icon" />
                {unreadCount > 0 && (
                  <span className="navbar-notifications-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="navbar-notifications-dropdown">
                  <div className="navbar-notifications-header">
                    <div className="notifications-header-left">
                      <SparklesIcon className="notifications-header-icon" />
                      <h3 className="notifications-header-title">AI Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="notifications-unread-count">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="notifications-controls">
                      <button
                        onClick={toggleSound}
                        className={`notification-control-btn ${soundEnabled ? 'sound-on' : 'sound-off'}`}
                        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                      >
                        {soundEnabled ? (
                          <SpeakerWaveIcon className="control-btn-icon" />
                        ) : (
                          <SpeakerXMarkIcon className="control-btn-icon" />
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
                            <CheckIcon className="control-btn-icon" />
                          </button>
                          <button
                            onClick={clearAll}
                            className="notification-control-btn clear"
                            title="Clear all notifications"
                          >
                            <TrashIcon className="control-btn-icon" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="navbar-notifications-list">
                    {aiNotifications.length === 0 ? (
                      <div className="navbar-notifications-empty">
                        <BellIcon className="notifications-empty-icon" />
                        <p className="notifications-empty-text">No AI notifications yet</p>
                      </div>
                    ) : (
                      aiNotifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`navbar-notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
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
                                  <XMarkIcon className="notification-close-icon" />
                                </button>
                              </div>
                              <p className="notification-message">{notification.message}</p>
                              <div className="notification-footer">
                                <span className="notification-time">
                                  <ClockIcon className="notification-time-icon" />
                                  {formatTime(notification.timestamp)}
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
                        <span className="notification-stats-text">
                          {notificationStats.total} notifications • {notificationStats.importantCount} important
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="navbar-user-wrapper" ref={menuRef}>
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen)
                  setNotificationsOpen(false)
                  setAdminSettingsOpen(false)
                }}
                className="navbar-user-btn"
              >
                <div className="navbar-user-info">
                  <p className="navbar-user-name">{account?.name || 'User'}</p>
                  <p className="navbar-user-role">{account?.role || 'User'}</p>
                </div>
                <UserCircleIcon className="navbar-user-avatar" />
              </button>

              {userMenuOpen && (
                <div className="navbar-user-dropdown">
                  {isAdmin && (
                    <button
                      className="navbar-user-dropdown-item admin-item"
                      onClick={() => {
                        setAdminSettingsOpen(true)
                        setUserMenuOpen(false)
                      }}
                    >
                      <Cog6ToothIcon className="dropdown-item-icon" />
                      Admin Settings
                    </button>
                  )}
                  <button
                    className="navbar-user-dropdown-item"
                    onClick={() => router.push('/settings')}
                  >
                    Settings
                  </button>
                  <button
                    className="navbar-user-dropdown-item logout"
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
              className="navbar-mobile-btn"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="navbar-mobile-icon" />
              ) : (
                <Bars3Icon className="navbar-mobile-icon" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content" ref={mobileMenuRef}>
            <div className="mobile-menu-header">
              <div className="mobile-menu-user">
                <UserCircleIcon className="mobile-user-avatar" />
                <div>
                  <p className="mobile-user-name">{account?.name || 'User'}</p>
                  <p className="mobile-user-role">{account?.role || 'User'}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-menu-close"
              >
                <XMarkIcon className="mobile-close-icon" />
              </button>
            </div>
            
            <div className="mobile-menu-links">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`mobile-menu-link ${
                      isActive ? 'mobile-menu-link-active' : 'mobile-menu-link-inactive'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="mobile-link-icon" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {isAdmin && (
                <button
                  onClick={() => {
                    setAdminSettingsOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="mobile-menu-link mobile-menu-admin-link"
                >
                  <Cog6ToothIcon className="mobile-link-icon" />
                  <span>Admin Settings</span>
                </button>
              )}
            </div>
            
            {/* Mobile AI Status */}
            <div className="mobile-ai-status">
              <div className="mobile-ai-header">
                <SparklesIcon className={`mobile-ai-icon ai-icon-${getAIStatusColor()}`} />
                <span className="mobile-ai-text">{getAIStatusText()}</span>
              </div>
              {status.dataSummary && (
                <div className="mobile-ai-stats">
                  <span className="mobile-ai-stat">Donors: {status.dataSummary.totalDonors || 0}</span>
                  <span className="mobile-ai-stat">Donations: {status.dataSummary.totalDonations || 0}</span>
                </div>
              )}
            </div>
            
            {/* Mobile Notifications Summary */}
            {unreadCount > 0 && (
              <div className="mobile-notifications-summary">
                <div className="mobile-notifications-header">
                  <BellIcon className="mobile-notifications-icon" />
                  <span className="mobile-notifications-title">AI Notifications</span>
                  <span className="mobile-notifications-badge">
                    {unreadCount} unread
                  </span>
                </div>
                {aiNotifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="mobile-notification-item">
                    <div className="mobile-notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="mobile-notification-content">
                      <p className="mobile-notification-title">{notification.title}</p>
                      <p className="mobile-notification-message">{notification.message}</p>
                    </div>
                  </div>
                ))}
                {aiNotifications.length > 3 && (
                  <button
                    onClick={() => {
                      setNotificationsOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="mobile-view-all-btn"
                  >
                    View all {aiNotifications.length} notifications →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}