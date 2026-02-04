// app/dashboard/page.jsx - Updated with charts
'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  EnvelopeIcon,
  UserCircleIcon,
  ChartBarIcon,
  FireIcon,
  BellAlertIcon,
  DocumentTextIcon,
  PhoneIcon,
  CheckCircleIcon,
  BoltIcon,
  PlayIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import styles from './Dashboard.module.css'
import SimulationControls from '../components/ai/SimulationControls'
import BulkDonorManager from '../components/BulkDonorManager'
import { useRouter } from 'next/navigation'
import { useDonors } from '../hooks/useDonor'
import { useDonations } from '../hooks/usedonation'
import { useAI } from '../providers/AIProvider'
import { bulkCreateDonors, prepareDonorsForBulk } from '../../utils/bulkDonorCreator'

// Chart imports
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

// Simple event emitter for simulation events
class SimulationEventEmitter {
  constructor() {
    this.listeners = new Map()
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
    return () => this.off(event, callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      })
    }
  }
}

// Create a global event emitter instance
const simulationEventEmitter = new SimulationEventEmitter()

export default function DashboardPage() {
  const router = useRouter()
  const { 
    aiSystem, 
    status: aiStatus, 
    apiClient,
    isSimulationRunning,
    simulationStats
  } = useAI()

  const [timeframe, setTimeframe] = useState('year')
  const [activityFeed, setActivityFeed] = useState([])
  const [simulatedActivities, setSimulatedActivities] = useState([])
  const [simulatedDonors, setSimulatedDonors] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [showSimulationPanel, setShowSimulationPanel] = useState(false)
  const [bulkCreating, setBulkCreating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(null)
  const [simulationEvents, setSimulationEvents] = useState([])
  const [localSettings, setLocalSettings] = useState(null)
  const [isClient, setIsClient] = useState(false)
  
  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
    try {
      const savedSettings = localStorage.getItem('simulationSettings')
      if (savedSettings) {
        setLocalSettings(JSON.parse(savedSettings))
      } else {
        // Set default settings
        setLocalSettings({
          speed: 'normal',
          donorCount: 20,
          activityTypes: ['donations', 'communications', 'profile_updates'],
          realism: 'high',
          autoGenerate: true,
          autoSave: false
        })
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error)
      setLocalSettings({
        speed: 'normal',
        donorCount: 20,
        activityTypes: ['donations', 'communications', 'profile_updates'],
        realism: 'high',
        autoGenerate: true,
        autoSave: false
      })
    }
  }, [])

  // Save settings to localStorage when changed
  useEffect(() => {
    if (isClient && localSettings) {
      try {
        localStorage.setItem('simulationSettings', JSON.stringify(localSettings))
      } catch (error) {
        console.error('Error saving settings to localStorage:', error)
      }
    }
  }, [localSettings, isClient])
  
  // Real data hooks
  const { donors, loading: donorsLoading, error: donorsError, invalidate: invalidateDonors } = useDonors()
  const { donations, summary, loading: donationsLoading, error: donationsError } = useDonations({ 
    timeframe,
    limit: 1000
  })

  const isLoading = donorsLoading || donationsLoading

  // Fetch activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      setActivityLoading(true)
      try {
        const response = await fetch('/api/donor-activity?timeframe=7days&limit=10')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setActivityFeed(data.data.activities || [])
          }
        } else {
          console.warn('Failed to fetch activity data')
        }
      } catch (error) {
        console.error('Error fetching activity data:', error)
      } finally {
        setActivityLoading(false)
      }
    }

    fetchActivityData()
  }, [])

  // Simulate generating donor data (for testing)
  const simulateDonorGeneration = useCallback(async (count = 10) => {
    try {
      const orgId = localStorage.getItem('currentOrgId') || 'default-org'
      
      // Generate fake donor data through your AI API
      const result = await apiClient.fetchData('generateFakeDonorData', {
        count,
        includeCommunications: false,
        includeDonations: true
      }, { usePost: true })

      if (result.success && result.data?.donors) {
        const donors = result.data.donors
        
        // Store donors for bulk creation
        setSimulatedDonors(donors)
        
        // Emit event for UI update
        simulationEventEmitter.emit('data_generated', {
          type: 'data_generated',
          data: result
        })

        console.log(`✅ Generated ${donors.length} simulated donors`)
        return donors
      }
    } catch (error) {
      console.error('Error generating donor data:', error)
    }
  }, [apiClient])

  // Handle bulk creation of simulated donors
  const handleBulkCreateDonors = async (donorsToCreate = simulatedDonors) => {
    if (!donorsToCreate || donorsToCreate.length === 0) {
      console.warn('No donors to create')
      return
    }

    setBulkCreating(true)
    setBulkProgress({ status: 'preparing', total: donorsToCreate.length })

    try {
      const orgId = localStorage.getItem('currentOrgId') || 'default-org'
      
      // Prepare donors for bulk creation
      const preparedDonors = prepareDonorsForBulk(donorsToCreate)
      
      if (preparedDonors.length === 0) {
        throw new Error('No valid donors to create')
      }

      setBulkProgress({ 
        status: 'creating', 
        total: preparedDonors.length,
        processed: 0 
      })

      // Create donors in bulk
      const result = await bulkCreateDonors(preparedDonors, orgId, (progress) => {
        setBulkProgress(progress)
      })

      // Safely handle invalidateDonors
      if (invalidateDonors && typeof invalidateDonors === 'function') {
        console.log('🔄 Invalidating donors cache...')
        try {
          await invalidateDonors()
        } catch (invalidateError) {
          console.warn('Failed to invalidate donors, reloading page:', invalidateError)
          window.location.reload()
        }
      } else {
        console.warn('invalidateDonors not available, reloading page')
        window.location.reload()
      }

      // Clear simulated donors
      setSimulatedDonors([])

      // Add success notification
      const successActivity = {
        id: `bulk_${Date.now()}`,
        type: 'SYSTEM',
        donor: 'Bulk Import',
        action: `Created ${result.created} new donors`,
        amount: '',
        time: 'just now',
        icon: 'CheckCircleIcon',
        isSimulated: false,
        data: result
      }

      setSimulatedActivities(prev => [successActivity, ...prev.slice(0, 19)])

      console.log(`✅ Successfully created ${result.created} donors`)

      // Emit success event
      simulationEventEmitter.emit('bulk_creation_complete', {
        type: 'bulk_creation_complete',
        data: result
      })

    } catch (error) {
      console.error('❌ Bulk creation failed:', error)
      
      // Add error notification
      const errorActivity = {
        id: `error_${Date.now()}`,
        type: 'ERROR',
        donor: 'Bulk Import',
        action: 'Failed to create donors',
        amount: '',
        time: 'just now',
        icon: 'ExclamationTriangleIcon',
        isSimulated: false,
        data: { error: error.message }
      }

      setSimulatedActivities(prev => [errorActivity, ...prev.slice(0, 19)])
    } finally {
      setBulkCreating(false)
      setBulkProgress(null)
    }
  }

  // Handle simulation events
  const handleSimulationEvent = useCallback((event) => {
    console.log('🎮 Simulation event received:', event)
    
    // Track event for debugging
    setSimulationEvents(prev => [...prev.slice(-9), event])
    
    // 🧬 Data generated event
    if (event.type === 'data_generated') {
      const donors = event.data?.data?.donors ?? []
      console.log('🧬 Data generated:', donors.length, 'donors')

      // Store donors for potential bulk creation
      setSimulatedDonors(donors)

      // Show as a system activity
      const systemActivity = {
        id: `sim_${Date.now()}`,
        type: 'SYSTEM',
        donor: 'AI Simulation',
        action: `Generated ${donors.length} donors`,
        amount: '',
        time: 'just now',
        icon: 'UserGroupIcon',
        isSimulated: true,
        data: donors
      }

      setSimulatedActivities(prev => [systemActivity, ...prev.slice(0, 19)])

      // Auto-create donors if enabled in simulation settings
      if (localSettings?.autoSave && donors.length > 0) {
        setTimeout(() => {
          handleBulkCreateDonors(donors)
        }, 1000)
      }

      return
    }

    // Handle donation events
    if (event.type === 'donation') {
      const activity = {
        id: `sim_${Date.now()}_${Math.random()}`,
        type: 'DONATION',
        donor: event.data?.donorName || 'Simulated Donor',
        action: 'Made a donation',
        amount: `$${event.data?.amount || 0}`,
        time: 'just now',
        icon: 'CurrencyDollarIcon',
        isSimulated: true,
        data: event.data
      }

      setSimulatedActivities(prev => [activity, ...prev.slice(0, 19)])
    }

    // Handle communication events
    if (event.type === 'communication') {
      const activity = {
        id: `sim_${Date.now()}_${Math.random()}`,
        type: 'COMMUNICATION',
        donor: event.data?.donorName || 'Simulated Donor',
        action: 'Sent a message',
        amount: '',
        time: 'just now',
        icon: 'EnvelopeIcon',
        isSimulated: true,
        data: event.data
      }

      setSimulatedActivities(prev => [activity, ...prev.slice(0, 19)])
    }

    // Handle simulation status changes
    if (event.type === 'simulation_status') {
      const activity = {
        id: `status_${Date.now()}`,
        type: 'SYSTEM',
        donor: 'AI Simulation',
        action: event.data?.message || 'Simulation status updated',
        amount: '',
        time: 'just now',
        icon: 'PlayIcon',
        isSimulated: true,
        data: event.data
      }

      setSimulatedActivities(prev => [activity, ...prev.slice(0, 19)])
    }
  }, [localSettings?.autoSave])

  // Listen to simulation events using our event emitter
  useEffect(() => {
    console.log('🔍 Setting up simulation event listeners')

    // Subscribe to events
    const unsubscribeDataGenerated = simulationEventEmitter.on('data_generated', handleSimulationEvent)
    const unsubscribeBulkComplete = simulationEventEmitter.on('bulk_creation_complete', handleSimulationEvent)
    
    // Poll for simulation status if AI system doesn't have events
    let pollInterval
    if (aiSystem && isSimulationRunning) {
      pollInterval = setInterval(async () => {
        try {
          // Check for new simulation stats
          if (simulationStats) {
            simulationEventEmitter.emit('simulation_status', {
              type: 'simulation_status',
              data: {
                status: 'running',
                stats: simulationStats,
                message: 'Simulation is running'
              }
            })
          }
        } catch (error) {
          console.error('Error polling simulation status:', error)
        }
      }, 30000)
    }
    
    return () => {
      console.log('🧹 Cleaning up simulation event listeners')
      unsubscribeDataGenerated()
      unsubscribeBulkComplete()
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [aiSystem, isSimulationRunning, simulationStats, handleSimulationEvent])

  // Trigger donor generation when simulation starts
  useEffect(() => {
    if (isSimulationRunning && simulatedDonors.length === 0) {
      // Auto-generate donors when simulation starts
      const timer = setTimeout(() => {
        const count = localSettings?.donorCount || 5
        simulateDonorGeneration(count)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isSimulationRunning, simulateDonorGeneration, simulatedDonors.length, localSettings?.donorCount])

  // Combine real and simulated activities
  const combinedActivities = useMemo(() => {
    const allActivities = [...activityFeed, ...simulatedActivities]
    return allActivities
      .sort((a, b) => {
        const timeA = a.createdAt || (a.isSimulated ? new Date() : a.date)
        const timeB = b.createdAt || (b.isSimulated ? new Date() : b.date)
        return new Date(timeB) - new Date(timeA)
      })
      .slice(0, 10)
  }, [activityFeed, simulatedActivities])

  // Process real donor data
  const processedDonors = useMemo(() => {
    if (!donors || donors.length === 0) return []
    
    return donors.map((donor) => {
      const donorDonations = donations?.filter(d => d.donorId === donor.id) || []
      const totalGiven = donorDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
      const lastDonation = donorDonations.length > 0 
        ? donorDonations.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null
        
      return {
        id: donor.id,
        name: `${donor.firstName} ${donor.lastName}`,
        email: donor.email || '',
        firstName: donor.firstName,
        lastName: donor.lastName,
        phone: donor.phone || '',
        totalDonations: totalGiven,
        lastDonationDate: lastDonation ? new Date(lastDonation.date) : null,
        isLYBUNT: donor.relationshipStage === 'LYBUNT',
        isSYBUNT: donor.relationshipStage === 'SYBUNT',
        status: donor.status || 'ACTIVE',
        relationshipStage: donor.relationshipStage || 'NEW',
        notes: donor.notes || donor.personalNotes?.notes || '',
        organizationId: donor.organizationId,
        createdAt: donor.createdAt ? new Date(donor.createdAt) : new Date(),
        updatedAt: donor.updatedAt ? new Date(donor.updatedAt) : new Date()
      }
    })
  }, [donors, donations])

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Process donation statistics
  const donationStats = useMemo(() => {
    if (!donations || donations.length === 0) return {
      totalDonors: 0,
      yearToDate: 0,
      lybuntDonors: 0,
      sybuntDonors: 0,
      avgGiftSize: 0,
      growth: 0,
      totalActivities: combinedActivities.length,
      simulatedDonorCount: simulatedDonors.length,
      isSimulationRunning: isSimulationRunning
    }

    const currentYear = new Date().getFullYear()
    const ytdDonations = donations.filter(d => {
      const donationYear = new Date(d.date).getFullYear()
      return donationYear === currentYear
    })
    const ytdTotal = ytdDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
    
    const lybuntCount = processedDonors.filter(donor => donor.isLYBUNT).length
    const sybuntCount = processedDonors.filter(donor => donor.isSYBUNT).length
    
    const avgGift = donations.length > 0 
      ? donations.reduce((sum, d) => sum + (d.amount || 0), 0) / donations.length 
      : 0
    
    return {
      totalDonors: processedDonors.length,
      yearToDate: ytdTotal,
      lybuntDonors: lybuntCount,
      sybuntDonors: sybuntCount,
      avgGiftSize: avgGift,
      growth: 8.2,
      totalActivities: combinedActivities.length,
      simulatedDonorCount: simulatedDonors.length,
      isSimulationRunning: isSimulationRunning
    }
  }, [donations, processedDonors, combinedActivities, simulatedDonors, isSimulationRunning])

  // Enhanced stats data with simulation info
  const stats = [
    { 
      name: 'Total Donors', 
      value: donationStats.totalDonors.toLocaleString(), 
      change: '+12%', 
      icon: UserGroupIcon,
      subtitle: simulatedDonors.length > 0 
        ? `${simulatedDonors.length} ready to import` 
        : `${donationStats.lybuntDonors} LYBUNT, ${donationStats.sybuntDonors} SYBUNT`
    },
    { 
      name: 'Year to Date', 
      value: formatCurrency(donationStats.yearToDate), 
      change: '+8.2%', 
      icon: CurrencyDollarIcon,
      subtitle: isSimulationRunning ? 'Simulation active' : ''
    },
    { 
      name: 'Recent Activities', 
      value: donationStats.totalActivities.toString(), 
      change: '+15%', 
      icon: FireIcon,
      subtitle: `${simulatedActivities.length} simulated, ${activityFeed.length} real`
    },
    { 
      name: 'Avg Gift Size', 
      value: formatCurrency(donationStats.avgGiftSize), 
      change: '+5.1%', 
      icon: ArrowTrendingUpIcon,
      subtitle: isSimulationRunning ? 'Live simulation' : ''
    },
  ]

  // Chart data (sample data similar to your image)
  const monthlyDonationData = [
    { month: 'Jan', amount: 70 },
    { month: 'Feb', amount: 60 },
    { month: 'Mar', amount: 50 },
    { month: 'Apr', amount: 40 },
    { month: 'May', amount: 30 },
    { month: 'Jun', amount: 20 },
    { month: 'Jul', amount: 10 },
    { month: 'Aug', amount: 0 }
  ]

  const departmentDonationData = [
    { name: 'Cutting', value: 49, color: '#8884d8' },
    { name: 'Food Products', value: 51, color: '#82ca9d' },
    { name: 'Electronics', value: 1, color: '#ffc658' },
    { name: 'Kitchen Utility', value: 2, color: '#ff8042' },
    { name: 'Gardening', value: 7, color: '#0088fe' }
  ]

  const campaignPerformanceData = [
    { campaign: 'Annual Fund', goal: 100000, raised: 75600 },
    { campaign: 'Capital Campaign', goal: 500000, raised: 320000 },
    { campaign: 'Endowment', goal: 250000, raised: 189000 },
    { campaign: 'Scholarship', goal: 75000, raised: 61500 }
  ]

  // Generate donor growth data
  const donorGrowthData = useMemo(() => {
    if (!donors || donors.length === 0) {
      // Sample data if no real data
      return [
        { month: 'Jan', donors: 45 },
        { month: 'Feb', donors: 52 },
        { month: 'Mar', donors: 48 },
        { month: 'Apr', donors: 61 },
        { month: 'May', donors: 55 },
        { month: 'Jun', donors: 58 },
        { month: 'Jul', donors: 65 },
        { month: 'Aug', donors: 70 }
      ]
    }

    // Group donors by month created
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = new Date().getFullYear()
    
    const donorsByMonth = {}
    
    donors.forEach(donor => {
      const createdAt = new Date(donor.createdAt || donor.createdDate)
      if (createdAt.getFullYear() === currentYear) {
        const month = monthNames[createdAt.getMonth()]
        if (!donorsByMonth[month]) {
          donorsByMonth[month] = 0
        }
        donorsByMonth[month]++
      }
    })
    
    return monthNames.map(month => ({
      month,
      donors: donorsByMonth[month] || 0
    }))
  }, [donors])

  const getIconComponent = (iconName) => {
    const iconMap = {
      'CurrencyDollarIcon': CurrencyDollarIcon,
      'CalendarIcon': CalendarIcon,
      'EnvelopeIcon': EnvelopeIcon,
      'PhoneIcon': PhoneIcon,
      'DocumentTextIcon': DocumentTextIcon,
      'CheckCircleIcon': CheckCircleIcon,
      'ExclamationTriangleIcon': ExclamationTriangleIcon,
      'UserCircleIcon': UserCircleIcon,
      'FireIcon': FireIcon,
      'BellAlertIcon': BellAlertIcon,
      'UserGroupIcon': UserGroupIcon,
      'PlayIcon': PlayIcon,
      'SparklesIcon': SparklesIcon
    }
    
    return iconMap[iconName] || UserCircleIcon
  }

  // Test function to manually trigger donor generation
  const handleTestDonorGeneration = useCallback(async (count = null) => {
    try {
      const orgId = localStorage.getItem('currentOrgId') || 'default-org'
      const donorCount = count || localSettings?.donorCount || 10
      
      console.log(`🔮 Generating ${donorCount} donors...`)
      
      // Generate fake donor data through your AI API
      const result = await apiClient.fetchData('generateFakeDonorData', {
        count: donorCount,
        includeCommunications: false,
        includeDonations: true
      }, { usePost: true })

      if (result.success && result.data?.donors) {
        const donors = result.data.donors
        
        // Store donors for bulk creation
        setSimulatedDonors(donors)
        
        // Emit event for UI update
        simulationEventEmitter.emit('data_generated', {
          type: 'data_generated',
          data: result
        })

        console.log(`✅ Generated ${donors.length} simulated donors`)
        
        // Auto-save if enabled
        if (localSettings?.autoSave && donors.length > 0) {
          console.log('🔄 Auto-saving donors...')
          setTimeout(() => {
            handleBulkCreateDonors(donors)
          }, 1000)
        }
        
        return donors
      }
    } catch (error) {
      console.error('Error generating donor data:', error)
    }
  }, [apiClient, localSettings?.autoSave, localSettings?.donorCount])

  // Debug button handler
  const handleDebugClick = () => {
    console.log('=== DEBUG INFO ===')
    console.log('Simulated Donors:', simulatedDonors.length)
    console.log('Simulated Activities:', simulatedActivities.length)
    console.log('Is Simulation Running:', isSimulationRunning)
    console.log('Local Settings:', localSettings)
    console.log('Donor Stats:', donationStats)
    console.log('==================')
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.dashboardTitle}>Dashboard</h1>
          <div className={styles.headerActions}>
            <button 
              onClick={() => setShowSimulationPanel(!showSimulationPanel)}
              className={`${styles.simulationToggle} ${isSimulationRunning ? styles.simulationRunning : ''}`}
            >
              <BoltIcon className={styles.simulationToggleIcon} />
              {isSimulationRunning ? 'Simulation Running' : 'AI Simulation'}
              {simulatedDonors.length > 0 && (
                <span className={styles.simulationBadge}>
                  {simulatedDonors.length} new
                </span>
              )}
            </button>
                      
            {/* Debug button for testing - optional */}
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={handleDebugClick}
                className={styles.debugButton}
                title="Debug Info"
              >
                🐛 Debug
              </button>
            )}
          </div>
        </div>
        <p className={styles.dashboardSubtitle}>
          Welcome back! {donationStats.totalDonors > 0 
            ? `You have ${donationStats.totalDonors} donors, received ${formatCurrency(donationStats.yearToDate)} this year.`
            : 'Welcome to your donor management system.'}
          {isSimulationRunning && ' AI simulation is active.'}
          {simulatedDonors.length > 0 && ` ${simulatedDonors.length} simulated donors ready to import.`}
        </p>
      </div>

      {/* Simulation Panel */}
      {showSimulationPanel && isClient && (
        <div className={styles.simulationPanel}>
          <SimulationControls 
            simulatedDonors={simulatedDonors}
            simulatedActivities={simulatedActivities.filter(a => a.isSimulated)}
            onStartSimulation={async (settings) => {
              console.log('Start simulation:', settings)
            }}
            onStopSimulation={async () => {
              console.log('Stop simulation')
            }}
            onPauseSimulation={async () => {
              console.log('Pause simulation')
            }}
            onGenerateTestData={async (settings) => {
              // Simplified version for debugging
              console.log('Generate test data with settings:', settings)
              const count = settings?.count || localSettings?.donorCount || 10
              await handleTestDonorGeneration(count)
            }}
            onBulkCreate={handleBulkCreateDonors}
            bulkCreating={bulkCreating}
            bulkProgress={bulkProgress}
            simulationSettings={localSettings}
            onSettingsChange={(newSettings) => {
              setLocalSettings(newSettings)
            }}
          />
        </div>
      )}

      {/* Bulk Donor Manager */}
      {simulatedDonors.length > 0 && (
        <BulkDonorManager 
          simulatedDonors={simulatedDonors}
          onBulkCreate={handleBulkCreateDonors}
          bulkCreating={bulkCreating}
          bulkProgress={bulkProgress}
        />
      )}

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className={`${styles.statCard} ${stat.name === 'Recent Activities' && simulatedActivities.length > 0 ? styles.statCardHighlight : ''}`}>
              <div className={styles.statCardContent}>
                <div className={styles.statText}>
                  <p className={styles.statName}>{stat.name}</p>
                  <p className={styles.statValue}>{stat.value}</p>
                  {stat.subtitle && (
                    <p className={styles.statSubtitle}>{stat.subtitle}</p>
                  )}
                  <p className={`${styles.statChange} ${stat.change.startsWith('+') ? styles.statChangePositive : styles.statChangeNegative}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <Icon className={styles.statIcon} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Monthly Donations Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Monthly Donations</h3>
            <div className={styles.chartTimeframe}>
              <button 
                className={`${styles.timeframeButton} ${timeframe === 'year' ? styles.active : ''}`}
                onClick={() => setTimeframe('year')}
              >
                Year
              </button>
              <button 
                className={`${styles.timeframeButton} ${timeframe === 'month' ? styles.active : ''}`}
                onClick={() => setTimeframe('month')}
              >
                Month
              </button>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyDonationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666' }}
                  tickFormatter={(value) => `$${value}k`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Amount']}
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="amount" 
                  name="Donations ($k)" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donor Growth Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Donor Growth</h3>
            <span className={styles.chartSubtitle}>New donors by month</span>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={donorGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="donors" 
                  name="New Donors" 
                  stroke="#82ca9d" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Performance */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Campaign Performance</h3>
            <span className={styles.chartSubtitle}>Goal vs Raised</span>
          </div>
          <div className={styles.campaignList}>
            {campaignPerformanceData.map((campaign, index) => {
              const percentage = (campaign.raised / campaign.goal) * 100
              return (
                <div key={index} className={styles.campaignItem}>
                  <div className={styles.campaignInfo}>
                    <span className={styles.campaignName}>{campaign.campaign}</span>
                    <span className={styles.campaignAmount}>
                      {formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: percentage >= 100 ? '#10b981' : percentage >= 75 ? '#3b82f6' : '#f59e0b'
                      }}
                    ></div>
                  </div>
                  <span className={`${styles.percentage} ${
                    percentage >= 100 ? styles.percentageSuccess : 
                    percentage >= 75 ? styles.percentageGood : 
                    styles.percentageWarning
                  }`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Department Donations */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Department Donations</h3>
            <span className={styles.chartSubtitle}>Allocation by category</span>
          </div>
          <div className={styles.pieChartContainer}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={departmentDonationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentDonationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.departmentList}>
            {departmentDonationData.map((dept, index) => (
              <div key={index} className={styles.departmentItem}>
                <div className={styles.departmentMarker} style={{ backgroundColor: dept.color }}></div>
                <span className={styles.departmentName}>{dept.name}</span>
                <span className={styles.departmentValue}>${dept.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className={styles.dashboardMainGrid}>
        <div className={styles.recentActivityCard}>
          <div className={styles.recentActivityHeader}>
            <h2 className={styles.recentActivityTitle}>
              Recent Activity Feed
              {simulatedActivities.length > 0 && (
                <span className={styles.simulationBadge}>
                  {simulatedActivities.length} simulated
                </span>
              )}
            </h2>
            <div className={styles.activityHeaderActions}>
              <Link href="/activities" className={styles.viewAllLink}>
                View All →
              </Link>
            </div>
          </div>
          <div className={styles.recentActivityList}>
            {activityLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className={styles.activityItemSkeleton}>
                  <div className={styles.activityIconSkeleton}></div>
                  <div className={styles.activityInfoSkeleton}>
                    <div className={styles.activityDonorSkeleton}></div>
                    <div className={styles.activityActionSkeleton}></div>
                  </div>
                </div>
              ))
            ) : combinedActivities.length > 0 ? (
              combinedActivities.map((activity, index) => {
                const Icon = getIconComponent(activity.icon)
                return (
                  <div 
                    key={`${activity.id || index}_${activity.type}`} 
                    className={`${styles.activityItem} ${activity.isSimulated ? styles.simulatedActivity : ''}`}
                  >
                    <div className={styles.activityIconContainer}>
                      <Icon className={styles.activityIcon} />
                      {activity.isSimulated && (
                        <span className={styles.simulationIndicator}>🤖</span>
                      )}
                    </div>
                    <div className={styles.activityInfo}>
                      <p className={styles.activityDonor}>{activity.donor}</p>
                      <p className={styles.activityAction}>{activity.action || activity.title}</p>
                      {activity.data?.donors && (
                        <p className={styles.activitySubtext}>
                          {activity.data.donors.length} donors generated
                        </p>
                      )}
                      {activity.data?.created && (
                        <p className={styles.activitySubtext}>
                          Created {activity.data.created} donors
                        </p>
                      )}
                    </div>
                    <div className={styles.activityDetails}>
                      {activity.amount && <p className={styles.activityAmount}>{activity.amount}</p>}
                      <p className={styles.activityTime}>
                        {activity.isSimulated ? 'just now' : activity.time}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className={styles.noActivities}>
                <SparklesIcon className={styles.noActivitiesIcon} />
                <p>No recent activities. Start the AI simulation to see simulated donor activity!</p>
                <div className={styles.noActivitiesButtons}>
                  <button 
                    onClick={() => setShowSimulationPanel(true)}
                    className={styles.startSimulationButton}
                    disabled={!isClient}
                  >
                    <PlayIcon className={styles.startSimulationIcon} />
                    Start Simulation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}