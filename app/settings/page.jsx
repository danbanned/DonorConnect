// app/settings/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthProvider'
import { hasPermission, isAdminRole } from '../../lib/access-control'
import {
  UserCircleIcon,
  LockClosedIcon,
  BellIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CogIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  ArrowLeftOnRectangleIcon,
  EnvelopeIcon,
  PhoneIcon,
  PhotoIcon,
  KeyIcon,
  ComputerDesktopIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout, loading: authLoading } = useAuth()
  
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  
  // User Account States
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: null,
    role: ''
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  })
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    donationNotifications: true,
    reminderEmails: true,
    inAppNotifications: true,
    smsAlerts: false
  })
  
  // Organization States
  const [organization, setOrganization] = useState({
    name: '',
    logo: null,
    address: '',
    contactEmail: '',
    contactPhone: '',
    timezone: 'America/New_York',
    language: 'en',
    defaultCurrency: 'USD',
    donationCategories: [],
    newCategory: ''
  })
  
  const [users, setUsers] = useState([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'STAFF',
    permissions: []
  })
  
  // Integration States
  const [integrations, setIntegrations] = useState({
    stripe: { enabled: false, apiKey: '', webhookSecret: '' },
    paypal: { enabled: false, clientId: '', secret: '' },
    mailchimp: { enabled: false, apiKey: '', audienceId: '' },
    sendgrid: { enabled: false, apiKey: '', fromEmail: '' }
  })
  
  // System & Privacy States
  const [privacySettings, setPrivacySettings] = useState({
    gdprCompliant: true,
    autoDeleteInactiveData: false,
    dataRetentionMonths: 24,
    allowDataExport: true,
    communicationOptIn: true
  })
  
  // App Preferences
  const [appPreferences, setAppPreferences] = useState({
    theme: 'light',
    defaultView: 'dashboard',
    tableDisplay: 'table',
    itemsPerPage: 25,
    autoLogoutMinutes: 30,
    showAnalytics: true
  })
  
  // Styles object
  const styles = {
    // Layout
    settingsPage: {
      padding: '2rem',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    },
    settingsHeader: {
      marginBottom: '2rem'
    },
    settingsLayout: {
      display: 'flex',
      gap: '2rem'
    },
    
    // Sidebar
    settingsSidebar: {
      width: '250px',
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: 'fit-content'
    },
    sidebarNav: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    sidebarItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '0.95rem',
      color: '#6b7280',
      transition: 'all 0.2s'
    },
    sidebarItemActive: {
      backgroundColor: '#eff6ff',
      color: '#2563eb'
    },
    sidebarIcon: {
      width: '20px',
      height: '20px'
    },
    sidebarFooter: {
      marginTop: 'auto',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e5e7eb'
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      cursor: 'pointer',
      fontSize: '0.95rem',
      width: '100%',
      transition: 'all 0.2s'
    },
    
    // Main Content
    settingsContent: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    settingsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    sectionIcon: {
      width: '28px',
      height: '28px',
      color: '#4b5563'
    },
    
    // Cards
    settingsCard: {
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid #e5e7eb'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e5e7eb'
    },
    cardIcon: {
      width: '20px',
      height: '20px',
      marginRight: '0.5rem'
    },
    
    // Forms
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem'
    },
    formGroup: {
      marginBottom: '1.25rem'
    },
    formLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#374151',
      fontSize: '0.875rem'
    },
    formInput: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '0.95rem',
      transition: 'all 0.2s'
    },
    formInputFocus: {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    formSelect: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '0.95rem',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    formHint: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    formRange: {
      width: '100%',
      margin: '1rem 0'
    },
    
    // Buttons
    saveButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.625rem 1.25rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s'
    },
    cancelButton: {
      backgroundColor: '#6b7280',
      color: 'white',
      padding: '0.625rem 1.25rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s'
    },
    dangerButton: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.625rem 1.25rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s'
    },
    addUserButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s'
    },
    uploadButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.2s'
    },
    passwordToggle: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280'
    },
    
    // Toggle Switch
    toggleSwitch: {
      position: 'relative',
      width: '44px',
      height: '24px',
      backgroundColor: '#d1d5db',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    toggleSwitchEnabled: {
      backgroundColor: '#10b981'
    },
    toggleSlider: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      borderRadius: '50%',
      top: '2px',
      left: '2px',
      transition: 'all 0.3s'
    },
    toggleSliderEnabled: {
      left: '22px'
    },
    
    // Profile Picture
    profilePictureUpload: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    profileAvatar: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      backgroundColor: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    
    // Password Input Container
    passwordInput: {
      position: 'relative'
    },
    
    // Role Badge
    roleBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    
    // Notification Settings
    notificationSettings: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    settingToggle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    
    // Categories
    categoriesList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    categoryItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: '#e5e7eb',
      padding: '0.375rem 0.75rem',
      borderRadius: '6px'
    },
    categoryAdd: {
      display: 'flex',
      gap: '0.5rem'
    },
    addButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '0.375rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    deleteButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    // Tables
    usersTable: {
      overflowX: 'auto',
      marginTop: '1.5rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      textAlign: 'left',
      padding: '0.75rem 1rem',
      borderBottom: '2px solid #e5e7eb',
      fontWeight: '600',
      color: '#374151',
      fontSize: '0.875rem'
    },
    tableCell: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '0.875rem'
    },
    tableActions: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '0.25rem'
    },
    
    // Integrations
    integrationList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    integrationItem: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #e5e7eb'
    },
    integrationHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    integrationInfo: {
      flex: 1
    },
    integrationConfig: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e7eb'
    },
    
    // Data Management
    dataActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    },
    actionGroup: {
      marginBottom: '1rem'
    },
    exportButtons: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '0.75rem'
    },
    exportButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      cursor: 'pointer',
      fontSize: '0.875rem'
    },
    importSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginTop: '0.75rem'
    },
    fileInput: {
      display: 'none'
    },
    importButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      cursor: 'pointer',
      fontSize: '0.875rem'
    },
    
    // Audit Logs
    auditLogs: {
      marginTop: '1rem'
    },
    logsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    logsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    logItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      backgroundColor: 'white',
      borderRadius: '6px',
      border: '1px solid #e5e7eb'
    },
    logInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    logDetails: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    
    // Theme Options
    themeOptions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '0.5rem'
    },
    themeOption: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'none',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    themeOptionActive: {
      borderColor: '#3b82f6',
      backgroundColor: '#eff6ff'
    },
    themePreview: {
      width: '60px',
      height: '40px',
      borderRadius: '4px'
    },
    themePreviewLight: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb'
    },
    themePreviewDark: {
      backgroundColor: '#1f2937'
    },
    themePreviewAuto: {
      background: 'linear-gradient(90deg, #ffffff 50%, #1f2937 50%)',
      border: '1px solid #e5e7eb'
    },
    
    // Sessions
    sessionsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    sessionItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    sessionInfo: {
      flex: 1
    },
    sessionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '0.5rem'
    },
    sessionStatus: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    sessionStatusCurrent: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    sessionStatusActive: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    sessionDetails: {
      display: 'flex',
      gap: '1rem',
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    sessionExpiry: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      marginTop: '0.5rem'
    },
    sessionActions: {
      marginLeft: '1rem'
    },
    revokeButton: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      padding: '0.375rem 0.75rem',
      borderRadius: '6px',
      border: '1px solid #fecaca',
      cursor: 'pointer',
      fontSize: '0.875rem'
    },
    sessionStats: {
      display: 'flex',
      gap: '2rem',
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e5e7eb'
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#374151'
    },
    logoutFullButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.95rem',
      width: '100%',
      transition: 'all 0.2s'
    },
    
    // Empty State
    emptySection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      textAlign: 'center'
    },
    emptyIcon: {
      width: '64px',
      height: '64px',
      color: '#9ca3af',
      marginBottom: '1rem'
    },
    emptyHint: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.5rem'
    },
    
    // Loading State
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }
  }

  // Animation for spinner
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch user profile
        const profileRes = await fetch('/api/auth/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUserProfile({
            name: profileData.name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            profilePicture: profileData.profilePicture,
            role: profileData.role || ''
          })
          setIsAdmin(
            isAdminRole(profileData.role) ||
            hasPermission(profileData, 'manage_users')
          )
        }
        
        // Fetch sessions
        const sessionsRes = await fetch('/api/auth/sessions')
        if (sessionsRes.ok) {
          setSessions(await sessionsRes.json())
        }
        
        // Fetch audit logs
        const logsRes = await fetch('/api/audit')
        if (logsRes.ok) {
          setAuditLogs(await logsRes.json())
        }
        
        // Fetch organization data if admin
        if (isAdmin) {
          const orgRes = await fetch('/api/organization')
          if (orgRes.ok) {
            const orgData = await orgRes.json()
            setOrganization(prev => ({
              ...prev,
              ...orgData,
              donationCategories: orgData.donationCategories || []
            }))
          }
          
          const usersRes = await fetch('/api/organization/users')
          if (usersRes.ok) {
            setUsers(await usersRes.json())
          }
          
          const integrationsRes = await fetch('/api/integrations')
          if (integrationsRes.ok) {
            setIntegrations(await integrationsRes.json())
          }
        }
        
      } catch (error) {
        console.error('Error fetching settings data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [isAdmin])
  
  const handleLogout = async () => {
    await logout()
  }
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      })
      
      if (response.ok) {
        alert('Profile updated successfully')
      }
    } catch (error) {
      alert('Failed to update profile')
    }
  }
  
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      if (response.ok) {
        alert('Password changed successfully')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          showCurrent: false,
          showNew: false,
          showConfirm: false
        })
      } else {
        alert('Failed to change password')
      }
    } catch (error) {
      alert('Error changing password')
    }
  }
  
  const handleRevokeSession = async (sessionId) => {
    if (!confirm('Are you sure you want to revoke this session?')) return
    
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId))
        if (sessionId === 'current') {
          // If current session revoked, logout
          await logout()
        }
      }
    } catch (error) {
      alert('Failed to revoke session')
    }
  }
  
  const handleOrganizationUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organization)
      })
      
      if (response.ok) {
        alert('Organization settings updated successfully')
      }
    } catch (error) {
      alert('Failed to update organization settings')
    }
  }
  
  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/organization/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      
      if (response.ok) {
        const createdUser = await response.json()
        setUsers([...users, createdUser])
        setShowAddUser(false)
        setNewUser({
          name: '',
          email: '',
          role: 'STAFF',
          permissions: []
        })
        alert('User added successfully')
      }
    } catch (error) {
      alert('Failed to add user')
    }
  }
  
  const handleExportData = async (format) => {
    try {
      const response = await fetch(`/api/data/export?format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `donor-export-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      alert('Failed to export data')
    }
  }
  
  const tabs = [
    { id: 'account', label: 'Account', icon: UserCircleIcon },
    { id: 'organization', label: 'Organization', icon: BuildingOfficeIcon },
    { id: 'integrations', label: 'Integrations', icon: CogIcon },
    { id: 'system', label: 'System & Privacy', icon: ShieldCheckIcon },
    { id: 'preferences', label: 'App Preferences', icon: PaintBrushIcon },
    { id: 'sessions', label: 'Sessions', icon: ArrowLeftOnRectangleIcon },
  ]
  
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading settings...</p>
      </div>
    )
  }

  if (!authLoading && user && !hasPermission(user, 'access_settings')) {
    return (
      <div style={styles.loadingContainer}>
        <h2>Access denied</h2>
        <p>You do not have permission to view settings.</p>
      </div>
    )
  }
  
  return (
    <div style={styles.settingsPage}>
      <div style={styles.settingsHeader}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#111827' }}>Settings</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>Manage your account and organization preferences</p>
      </div>
      
      <div style={styles.settingsLayout}>
        {/* Sidebar Navigation */}
        <div style={styles.settingsSidebar}>
          <nav style={styles.sidebarNav}>
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.sidebarItem,
                    ...(activeTab === tab.id ? styles.sidebarItemActive : {})
                  }}
                >
                  <Icon style={styles.sidebarIcon} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
          
          <div style={styles.sidebarFooter}>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <ArrowLeftOnRectangleIcon style={{ width: '20px', height: '20px' }} />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div style={styles.settingsContent}>
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div style={styles.settingsSection}>
              <div style={styles.sectionHeader}>
                <UserCircleIcon style={styles.sectionIcon} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Account Settings</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Profile Information */}
                <form onSubmit={handleProfileUpdate} style={styles.settingsCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Profile Information</h3>
                    <button type="submit" style={styles.saveButton}>
                      Save Changes
                    </button>
                  </div>
                  
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label htmlFor="name" style={styles.formLabel}>Full Name</label>
                      <input
                        type="text"
                        id="name"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        style={styles.formInput}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label htmlFor="email" style={styles.formLabel}>Email Address</label>
                      <input
                        type="email"
                        id="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        style={styles.formInput}
                        disabled
                      />
                      <p style={styles.formHint}>Contact admin to change email</p>
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label htmlFor="phone" style={styles.formLabel}>Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        style={styles.formInput}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Role</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={styles.roleBadge}>{userProfile.role}</span>
                        <p style={styles.formHint}>Role assigned by organization admin</p>
                      </div>
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Profile Picture</label>
                      <div style={styles.profilePictureUpload}>
                        <div style={styles.profileAvatar}>
                          {userProfile.profilePicture ? (
                            <img 
                              src={userProfile.profilePicture} 
                              alt="Profile" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <UserCircleIcon style={{ width: '48px', height: '48px', color: '#9ca3af' }} />
                          )}
                        </div>
                        <button type="button" style={styles.uploadButton}>
                          <PhotoIcon style={{ width: '16px', height: '16px' }} />
                          Upload Photo
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                
                {/* Password & Security */}
                <form onSubmit={handlePasswordChange} style={styles.settingsCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Password & Security</h3>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="currentPassword" style={styles.formLabel}>Current Password</label>
                    <div style={styles.passwordInput}>
                      <input
                        type={passwordForm.showCurrent ? "text" : "password"}
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        style={styles.formInput}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordForm({...passwordForm, showCurrent: !passwordForm.showCurrent})}
                        style={styles.passwordToggle}
                      >
                        {passwordForm.showCurrent ? 
                          <EyeSlashIcon style={{ width: '20px', height: '20px' }} /> : 
                          <EyeIcon style={{ width: '20px', height: '20px' }} />
                        }
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="newPassword" style={styles.formLabel}>New Password</label>
                    <div style={styles.passwordInput}>
                      <input
                        type={passwordForm.showNew ? "text" : "password"}
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        style={styles.formInput}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordForm({...passwordForm, showNew: !passwordForm.showNew})}
                        style={styles.passwordToggle}
                      >
                        {passwordForm.showNew ? 
                          <EyeSlashIcon style={{ width: '20px', height: '20px' }} /> : 
                          <EyeIcon style={{ width: '20px', height: '20px' }} />
                        }
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="confirmPassword" style={styles.formLabel}>Confirm New Password</label>
                    <div style={styles.passwordInput}>
                      <input
                        type={passwordForm.showConfirm ? "text" : "password"}
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        style={styles.formInput}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordForm({...passwordForm, showConfirm: !passwordForm.showConfirm})}
                        style={styles.passwordToggle}
                      >
                        {passwordForm.showConfirm ? 
                          <EyeSlashIcon style={{ width: '20px', height: '20px' }} /> : 
                          <EyeIcon style={{ width: '20px', height: '20px' }} />
                        }
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.cardFooter}>
                    <button type="submit" style={styles.saveButton}>
                      Change Password
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={styles.settingToggle}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>Two-Factor Authentication</h4>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>Add an extra layer of security to your account</p>
                      </div>
                      <button
                        type="button"
                        style={{
                          ...styles.toggleSwitch,
                          ...(twoFactorEnabled ? styles.toggleSwitchEnabled : {})
                        }}
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      >
                        <div style={{
                          ...styles.toggleSlider,
                          ...(twoFactorEnabled ? styles.toggleSliderEnabled : {})
                        }}></div>
                      </button>
                    </div>
                  </div>
                </form>
                
                {/* Notifications */}
                <div style={styles.settingsCard}>
                  <div style={{ ...styles.cardHeader, justifyContent: 'flex-start', gap: '0.5rem' }}>
                    <BellIcon style={{ width: '20px', height: '20px', color: '#4b5563' }} />
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Notification Preferences</h3>
                  </div>
                  
                  <div style={styles.notificationSettings}>
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} style={styles.settingToggle}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h4>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                            Receive notifications for {key.toLowerCase().replace(/([A-Z])/g, ' $1')}
                          </p>
                        </div>
                        <button
                          type="button"
                          style={{
                            ...styles.toggleSwitch,
                            ...(value ? styles.toggleSwitchEnabled : {})
                          }}
                          onClick={() => setNotificationSettings({
                            ...notificationSettings,
                            [key]: !value
                          })}
                        >
                          <div style={{
                            ...styles.toggleSlider,
                            ...(value ? styles.toggleSliderEnabled : {})
                          }}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div style={styles.cardFooter}>
                    <button
                      onClick={() => {
                        // Save notification settings
                        alert('Notification preferences saved')
                      }}
                      style={styles.saveButton}
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Organization Settings (Admin only) */}
          {activeTab === 'organization' && isAdmin && (
            <div style={styles.settingsSection}>
              <div style={styles.sectionHeader}>
                <BuildingOfficeIcon style={styles.sectionIcon} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Organization Settings</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Organization Profile */}
                <form onSubmit={handleOrganizationUpdate} style={styles.settingsCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Organization Profile</h3>
                    <button type="submit" style={styles.saveButton}>
                      Save Changes
                    </button>
                  </div>
                  
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label htmlFor="orgName" style={styles.formLabel}>Organization Name</label>
                      <input
                        type="text"
                        id="orgName"
                        value={organization.name}
                        onChange={(e) => setOrganization({...organization, name: e.target.value})}
                        style={styles.formInput}
                        required
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label htmlFor="contactEmail" style={styles.formLabel}>Contact Email</label>
                      <input
                        type="email"
                        id="contactEmail"
                        value={organization.contactEmail}
                        onChange={(e) => setOrganization({...organization, contactEmail: e.target.value})}
                        style={styles.formInput}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label htmlFor="contactPhone" style={styles.formLabel}>Contact Phone</label>
                      <input
                        type="tel"
                        id="contactPhone"
                        value={organization.contactPhone}
                        onChange={(e) => setOrganization({...organization, contactPhone: e.target.value})}
                        style={styles.formInput}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label htmlFor="timezone" style={styles.formLabel}>Timezone</label>
                      <select
                        id="timezone"
                        value={organization.timezone}
                        onChange={(e) => setOrganization({...organization, timezone: e.target.value})}
                        style={styles.formSelect}
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                      </select>
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label htmlFor="language" style={styles.formLabel}>Language</label>
                      <select
                        id="language"
                        value={organization.language}
                        onChange={(e) => setOrganization({...organization, language: e.target.value})}
                        style={styles.formSelect}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Organization Logo</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '8px',
                          backgroundColor: '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          {organization.logo ? (
                            <img 
                              src={organization.logo} 
                              alt="Organization Logo" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <BuildingOfficeIcon style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
                          )}
                        </div>
                        <button type="button" style={styles.uploadButton}>
                          <PhotoIcon style={{ width: '16px', height: '16px' }} />
                          Upload Logo
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                
                {/* Donation Settings */}
                <div style={styles.settingsCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <CurrencyDollarIcon style={{ width: '20px', height: '20px', color: '#4b5563' }} />
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Donation Settings</h3>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="defaultCurrency" style={styles.formLabel}>Default Currency</label>
                    <select
                      id="defaultCurrency"
                      value={organization.defaultCurrency}
                      onChange={(e) => setOrganization({...organization, defaultCurrency: e.target.value})}
                      style={styles.formSelect}
                    >
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                      <option value="CAD">Canadian Dollar (CAD)</option>
                      <option value="AUD">Australian Dollar (AUD)</option>
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Donation Categories</label>
                    <div style={styles.categoriesList}>
                      {organization.donationCategories.map((category, index) => (
                        <div key={index} style={styles.categoryItem}>
                          <span style={{ fontSize: '0.875rem' }}>{category}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newCategories = [...organization.donationCategories]
                              newCategories.splice(index, 1)
                              setOrganization({...organization, donationCategories: newCategories})
                            }}
                            style={styles.deleteButton}
                          >
                            <XMarkIcon style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      ))}
                      <div style={styles.categoryAdd}>
                        <input
                          type="text"
                          value={organization.newCategory}
                          onChange={(e) => setOrganization({...organization, newCategory: e.target.value})}
                          placeholder="Add new category"
                          style={{ ...styles.formInput, flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (organization.newCategory.trim()) {
                              setOrganization({
                                ...organization,
                                donationCategories: [...organization.donationCategories, organization.newCategory.trim()],
                                newCategory: ''
                              })
                            }
                          }}
                          style={styles.addButton}
                        >
                          <PlusIcon style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* User Management */}
                <div style={styles.settingsCard}>
                  <div style={styles.cardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserGroupIcon style={{ width: '20px', height: '20px', color: '#4b5563' }} />
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>User Management</h3>
                    </div>
                    <button
                      onClick={() => setShowAddUser(true)}
                      style={styles.addUserButton}
                    >
                      <PlusIcon style={{ width: '16px', height: '16px' }} />
                      Add User
                    </button>
                  </div>
                  
                  {showAddUser && (
                    <form onSubmit={handleAddUser} style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      marginBottom: '1.5rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                          <label htmlFor="userName" style={styles.formLabel}>Name</label>
                          <input
                            type="text"
                            id="userName"
                            value={newUser.name}
                            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                            style={styles.formInput}
                            required
                          />
                        </div>
                        
                        <div style={styles.formGroup}>
                          <label htmlFor="userEmail" style={styles.formLabel}>Email</label>
                          <input
                            type="email"
                            id="userEmail"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            style={styles.formInput}
                            required
                          />
                        </div>
                        
                        <div style={styles.formGroup}>
                          <label htmlFor="userRole" style={styles.formLabel}>Role</label>
                          <select
                            id="userRole"
                            value={newUser.role}
                            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                            style={styles.formSelect}
                          >
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setShowAddUser(false)}
                          style={styles.cancelButton}
                        >
                          Cancel
                        </button>
                        <button type="submit" style={styles.saveButton}>
                          Add User
                        </button>
                      </div>
                    </form>
                  )}
                  
                  <div style={styles.usersTable}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.tableHeader}>Name</th>
                          <th style={styles.tableHeader}>Email</th>
                          <th style={styles.tableHeader}>Role</th>
                          <th style={styles.tableHeader}>Status</th>
                          <th style={styles.tableHeader}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                            <td style={styles.tableCell}>{user.name}</td>
                            <td style={styles.tableCell}>{user.email}</td>
                            <td style={styles.tableCell}>
                              <span style={styles.roleBadge}>{user.role}</span>
                            </td>
                            <td style={styles.tableCell}>
                              <span style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: user.active ? '#d1fae5' : '#f3f4f6',
                                color: user.active ? '#065f46' : '#6b7280'
                              }}>
                                {user.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td style={styles.tableCell}>
                              <div style={styles.tableActions}>
                                <button style={styles.actionButton} title="Edit">
                                  <CogIcon style={{ width: '16px', height: '16px' }} />
                                </button>
                                <button style={{ ...styles.actionButton, color: '#dc2626' }} title="Remove">
                                  <TrashIcon style={{ width: '16px', height: '16px' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Integrations */}
          {activeTab === 'integrations' && (
            <div style={styles.settingsSection}>
              <div style={styles.sectionHeader}>
                <CogIcon style={styles.sectionIcon} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Integrations</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Payment Gateways */}
                <div style={styles.settingsCard}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Payment Gateways</h3>
                  <div style={styles.integrationList}>
                    {Object.entries(integrations).filter(([key]) => ['stripe', 'paypal'].includes(key)).map(([key, config]) => (
                      <div key={key} style={styles.integrationItem}>
                        <div style={styles.integrationHeader}>
                          <div style={styles.integrationInfo}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </h4>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                              Connect your {key} account to process donations
                            </p>
                          </div>
                          <button
                            style={{
                              ...styles.toggleSwitch,
                              ...(config.enabled ? styles.toggleSwitchEnabled : {})
                            }}
                            onClick={() => setIntegrations({
                              ...integrations,
                              [key]: {...config, enabled: !config.enabled}
                            })}
                          >
                            <div style={{
                              ...styles.toggleSlider,
                              ...(config.enabled ? styles.toggleSliderEnabled : {})
                            }}></div>
                          </button>
                        </div>
                        
                        {config.enabled && (
                          <div style={styles.integrationConfig}>
                            <div style={styles.formGroup}>
                              <label htmlFor={`${key}ApiKey`} style={styles.formLabel}>API Key</label>
                              <input
                                type="password"
                                id={`${key}ApiKey`}
                                value={config.apiKey}
                                onChange={(e) => setIntegrations({
                                  ...integrations,
                                  [key]: {...config, apiKey: e.target.value}
                                })}
                                style={styles.formInput}
                                placeholder="Enter API key"
                              />
                            </div>
                            
                            {key === 'stripe' && (
                              <div style={styles.formGroup}>
                                <label htmlFor={`${key}WebhookSecret`} style={styles.formLabel}>Webhook Secret</label>
                                <input
                                  type="password"
                                  id={`${key}WebhookSecret`}
                                  value={config.webhookSecret}
                                  onChange={(e) => setIntegrations({
                                    ...integrations,
                                    [key]: {...config, webhookSecret: e.target.value}
                                  })}
                                  style={styles.formInput}
                                  placeholder="Enter webhook secret"
                                />
                              </div>
                            )}
                            
                            {key === 'paypal' && (
                              <div style={styles.formGroup}>
                                <label htmlFor={`${key}Secret`} style={styles.formLabel}>Secret Key</label>
                                <input
                                  type="password"
                                  id={`${key}Secret`}
                                  value={config.secret}
                                  onChange={(e) => setIntegrations({
                                    ...integrations,
                                    [key]: {...config, secret: e.target.value}
                                  })}
                                  style={styles.formInput}
                                  placeholder="Enter secret key"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Email Integrations */}
                <div style={styles.settingsCard}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Email Integrations</h3>
                  <div style={styles.integrationList}>
                    {Object.entries(integrations).filter(([key]) => ['mailchimp', 'sendgrid'].includes(key)).map(([key, config]) => (
                      <div key={key} style={styles.integrationItem}>
                        <div style={styles.integrationHeader}>
                          <div style={styles.integrationInfo}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </h4>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                              Connect your {key} account for email campaigns
                            </p>
                          </div>
                          <button
                            style={{
                              ...styles.toggleSwitch,
                              ...(config.enabled ? styles.toggleSwitchEnabled : {})
                            }}
                            onClick={() => setIntegrations({
                              ...integrations,
                              [key]: {...config, enabled: !config.enabled}
                            })}
                          >
                            <div style={{
                              ...styles.toggleSlider,
                              ...(config.enabled ? styles.toggleSliderEnabled : {})
                            }}></div>
                          </button>
                        </div>
                        
                        {config.enabled && (
                          <div style={styles.integrationConfig}>
                            <div style={styles.formGroup}>
                              <label htmlFor={`${key}ApiKey`} style={styles.formLabel}>API Key</label>
                              <input
                                type="password"
                                id={`${key}ApiKey`}
                                value={config.apiKey}
                                onChange={(e) => setIntegrations({
                                  ...integrations,
                                  [key]: {...config, apiKey: e.target.value}
                                })}
                                style={styles.formInput}
                                placeholder="Enter API key"
                              />
                            </div>
                            
                            {key === 'mailchimp' && (
                              <div style={styles.formGroup}>
                                <label htmlFor="mailchimpAudience" style={styles.formLabel}>Audience ID</label>
                                <input
                                  type="text"
                                  id="mailchimpAudience"
                                  value={config.audienceId}
                                  onChange={(e) => setIntegrations({
                                    ...integrations,
                                    [key]: {...config, audienceId: e.target.value}
                                  })}
                                  style={styles.formInput}
                                  placeholder="Enter audience ID"
                                />
                              </div>
                            )}
                            
                            {key === 'sendgrid' && (
                              <div style={styles.formGroup}>
                                <label htmlFor="sendgridFromEmail" style={styles.formLabel}>From Email</label>
                                <input
                                  type="email"
                                  id="sendgridFromEmail"
                                  value={config.fromEmail}
                                  onChange={(e) => setIntegrations({
                                    ...integrations,
                                    [key]: {...config, fromEmail: e.target.value}
                                  })}
                                  style={styles.formInput}
                                  placeholder="Enter from email"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => alert('Integration settings saved')}
                    style={styles.saveButton}
                  >
                    Save Integrations
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* System & Privacy */}
          {activeTab === 'system' && (
            <div style={styles.settingsSection}>
              <div style={styles.sectionHeader}>
                <ShieldCheckIcon style={styles.sectionIcon} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>System & Privacy</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Data Export/Import */}
                <div style={styles.settingsCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <ArrowPathIcon style={{ width: '20px', height: '20px', color: '#4b5563' }} />
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Data Management</h3>
                  </div>
                  
                  <div style={styles.dataActions}>
                    <div style={styles.actionGroup}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>Export Data</h4>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>Export your donor data in various formats</p>
                      <div style={styles.exportButtons}>
                        <button onClick={() => handleExportData('csv')} style={styles.exportButton}>
                          Export as CSV
                        </button>
                        <button onClick={() => handleExportData('xlsx')} style={styles.exportButton}>
                          Export as Excel
                        </button>
                        <button onClick={() => handleExportData('json')} style={styles.exportButton}>
                          Export as JSON
                        </button>
                      </div>
                    </div>
                    
                    <div style={styles.actionGroup}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>Import Data</h4>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>Import donor records from external sources</p>
                      <div style={styles.importSection}>
                        <input
                          type="file"
                          id="importFile"
                          accept=".csv,.xlsx,.json"
                          style={styles.fileInput}
                        />
                        <label htmlFor="importFile" style={styles.importButton}>
                          Choose File
                        </label>
                        <button style={styles.saveButton}>
                          Upload & Import
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Audit Logs */}
                <div style={styles.settingsCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <ClockIcon style={{ width: '20px', height: '20px', color: '#4b5563' }} />
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Audit Logs</h3>
                  </div>
                  
                  <div style={styles.auditLogs}>
                    <div style={styles.logsHeader}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>Recent Activity</h4>
                      <button style={{ 
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        View All Logs
                      </button>
                    </div>
                    
                    <div style={styles.logsList}>
                      {auditLogs.slice(0, 5).map(log => (
                        <div key={log.id} style={styles.logItem}>
                          <div style={styles.logInfo}>
                            <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{log.action}</span>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{log.user?.name || 'System'}</span>
                          </div>
                          <div style={styles.logDetails}>
                            <span style={{ fontSize: '0.75rem' }}>
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                            <span style={{ fontSize: '0.75rem' }}>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Privacy Settings */}
                <div style={styles.settingsCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <ShieldCheckIcon style={{ width: '20px', height: '20px', color: '#4b5563' }} />
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Privacy Settings</h3>
                  </div>
                  
                  <div style={styles.privacySettings}>
                    {Object.entries(privacySettings).map(([key, value]) => (
                      <div key={key} style={styles.settingToggle}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h4>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                            Configure {key.toLowerCase().replace(/([A-Z])/g, ' $1')} settings
                          </p>
                        </div>
                        <button
                          type="button"
                          style={{
                            ...styles.toggleSwitch,
                            ...(value ? styles.toggleSwitchEnabled : {})
                          }}
                          onClick={() => setPrivacySettings({
                            ...privacySettings,
                            [key]: typeof value === 'boolean' ? !value : value
                          })}
                        >
                          <div style={{
                            ...styles.toggleSlider,
                            ...(value ? styles.toggleSliderEnabled : {})
                          }}></div>
                        </button>
                      </div>
                    ))}
                    
                    {privacySettings.dataRetentionMonths && (
                      <div style={styles.formGroup}>
                        <label htmlFor="retentionMonths" style={styles.formLabel}>Data Retention Period (Months)</label>
                        <input
                          type="range"
                          id="retentionMonths"
                          min="1"
                          max="60"
                          value={privacySettings.dataRetentionMonths}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            dataRetentionMonths: parseInt(e.target.value)
                          })}
                          style={styles.formRange}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>1 month</span>
                          <span style={{ fontWeight: '500' }}>{privacySettings.dataRetentionMonths} months</span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>60 months</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.cardFooter}>
                    <button
                      onClick={() => alert('Privacy settings saved')}
                      style={styles.saveButton}
                    >
                      Save Privacy Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* App Preferences */}
          {activeTab === 'preferences' && (
            <div style={styles.settingsSection}>
              <div style={styles.sectionHeader}>
                <PaintBrushIcon style={styles.sectionIcon} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>App Preferences</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={styles.settingsCard}>
                  <div style={styles.formGroup}>
                    <label htmlFor="theme" style={styles.formLabel}>Theme</label>
                    <div style={styles.themeOptions}>
                      <button
                        style={{
                          ...styles.themeOption,
                          ...(appPreferences.theme === 'light' ? styles.themeOptionActive : {})
                        }}
                        onClick={() => setAppPreferences({...appPreferences, theme: 'light'})}
                      >
                        <div style={{ ...styles.themePreview, ...styles.themePreviewLight }}></div>
                        <span style={{ fontSize: '0.875rem' }}>Light</span>
                      </button>
                      <button
                        style={{
                          ...styles.themeOption,
                          ...(appPreferences.theme === 'dark' ? styles.themeOptionActive : {})
                        }}
                        onClick={() => setAppPreferences({...appPreferences, theme: 'dark'})}
                      >
                        <div style={{ ...styles.themePreview, ...styles.themePreviewDark }}></div>
                        <span style={{ fontSize: '0.875rem', color: 'white' }}>Dark</span>
                      </button>
                      <button
                        style={{
                          ...styles.themeOption,
                          ...(appPreferences.theme === 'auto' ? styles.themeOptionActive : {})
                        }}
                        onClick={() => setAppPreferences({...appPreferences, theme: 'auto'})}
                      >
                        <div style={{ ...styles.themePreview, ...styles.themePreviewAuto }}></div>
                        <span style={{ fontSize: '0.875rem' }}>Auto</span>
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="defaultView" style={styles.formLabel}>Default Dashboard View</label>
                    <select
                      id="defaultView"
                      value={appPreferences.defaultView}
                      onChange={(e) => setAppPreferences({...appPreferences, defaultView: e.target.value})}
                      style={styles.formSelect}
                    >
                      <option value="dashboard">Dashboard Overview</option>
                      <option value="donors">Donor List</option>
                      <option value="donations">Recent Donations</option>
                      <option value="analytics">Analytics</option>
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="tableDisplay" style={styles.formLabel}>Table Display Style</label>
                    <select
                      id="tableDisplay"
                      value={appPreferences.tableDisplay}
                      onChange={(e) => setAppPreferences({...appPreferences, tableDisplay: e.target.value})}
                      style={styles.formSelect}
                    >
                      <option value="table">Table View</option>
                      <option value="cards">Card View</option>
                      <option value="list">List View</option>
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="itemsPerPage" style={styles.formLabel}>Items Per Page</label>
                    <select
                      id="itemsPerPage"
                      value={appPreferences.itemsPerPage}
                      onChange={(e) => setAppPreferences({...appPreferences, itemsPerPage: parseInt(e.target.value)})}
                      style={styles.formSelect}
                    >
                      <option value={10}>10 items</option>
                      <option value={25}>25 items</option>
                      <option value={50}>50 items</option>
                      <option value={100}>100 items</option>
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="autoLogout" style={styles.formLabel}>Auto Logout Timer (Minutes)</label>
                    <select
                      id="autoLogout"
                      value={appPreferences.autoLogoutMinutes}
                      onChange={(e) => setAppPreferences({...appPreferences, autoLogoutMinutes: parseInt(e.target.value)})}
                      style={styles.formSelect}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>
                  
                  <div style={styles.settingToggle}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>Show Analytics Dashboard</h4>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>Display analytics and charts on dashboard</p>
                    </div>
                    <button
                      type="button"
                      style={{
                        ...styles.toggleSwitch,
                        ...(appPreferences.showAnalytics ? styles.toggleSwitchEnabled : {})
                      }}
                      onClick={() => setAppPreferences({...appPreferences, showAnalytics: !appPreferences.showAnalytics})}
                    >
                      <div style={{
                        ...styles.toggleSlider,
                        ...(appPreferences.showAnalytics ? styles.toggleSliderEnabled : {})
                      }}></div>
                    </button>
                  </div>
                  
                  <div style={styles.cardFooter}>
                    <button
                      onClick={() => alert('Preferences saved')}
                      style={styles.saveButton}
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Sessions */}
          {activeTab === 'sessions' && (
            <div style={styles.settingsSection}>
              <div style={styles.sectionHeader}>
                <ArrowLeftOnRectangleIcon style={styles.sectionIcon} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Session Management</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={styles.settingsCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Active Sessions</h3>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to revoke all sessions except current?')) {
                          // Implement revoke all sessions
                        }
                      }}
                      style={styles.dangerButton}
                    >
                      Revoke All Sessions
                    </button>
                  </div>
                  
                  <div style={styles.sessionsList}>
                    {sessions.map(session => (
                      <div key={session.id} style={styles.sessionItem}>
                        <div style={styles.sessionInfo}>
                          <div style={styles.sessionHeader}>
                            <span style={{
                              ...styles.sessionStatus,
                              ...(session.isCurrent ? styles.sessionStatusCurrent : styles.sessionStatusActive)
                            }}>
                              {session.isCurrent ? 'Current Session' : 'Active Session'}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              Last active: {new Date(session.lastActivityAt).toLocaleString()}
                            </span>
                          </div>
                          <div style={styles.sessionDetails}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <ComputerDesktopIcon style={{ width: '16px', height: '16px' }} />
                              {session.userAgent || 'Unknown device'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              IP: {session.ipAddress || 'Unknown'}
                            </span>
                          </div>
                          <div style={styles.sessionExpiry}>
                            Expires: {new Date(session.expiresAt).toLocaleString()}
                          </div>
                        </div>
                        <div style={styles.sessionActions}>
                          {!session.isCurrent && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              style={styles.revokeButton}
                            >
                              Revoke Session
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={styles.sessionStats}>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Active Sessions</span>
                      <span style={styles.statValue}>{sessions.length}</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Session Timeout</span>
                      <span style={styles.statValue}>{appPreferences.autoLogoutMinutes} min</span>
                    </div>
                  </div>
                </div>
                
                <div style={styles.settingsCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Auto Logout Settings</h3>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="sessionTimeout" style={styles.formLabel}>Session Timeout (Minutes)</label>
                    <select
                      id="sessionTimeout"
                      value={appPreferences.autoLogoutMinutes}
                      onChange={(e) => setAppPreferences({...appPreferences, autoLogoutMinutes: parseInt(e.target.value)})}
                      style={styles.formSelect}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={0}>Never auto logout</option>
                    </select>
                    <p style={styles.formHint}>
                      Automatically log out after period of inactivity
                    </p>
                  </div>
                  
                  <div style={{ marginTop: '1.5rem' }}>
                    <button onClick={handleLogout} style={styles.logoutFullButton}>
                      <ArrowLeftOnRectangleIcon style={{ width: '20px', height: '20px' }} />
                      <span>Logout from All Devices</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Organization Settings Not Available */}
          {activeTab === 'organization' && !isAdmin && (
            <div style={styles.emptySection}>
              <BuildingOfficeIcon style={styles.emptyIcon} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Organization Settings</h3>
              <p style={{ margin: 0, color: '#6b7280' }}>Organization settings are only available to administrators.</p>
              <p style={styles.emptyHint}>Contact your organization admin for access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
