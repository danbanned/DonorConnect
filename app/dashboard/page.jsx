'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import styles from './Dashboard.module.css'
import { useRouter } from 'next/navigation'



// Static data for charts
const chartdata = [
  { month: 'Jan', amount: 40250 },
  { month: 'Feb', amount: 38920 },
  { month: 'Mar', amount: 45670 },
  { month: 'Apr', amount: 51230 },
  { month: 'May', amount: 48910 },
  { month: 'Jun', amount: 56780 },
]

const donorData = [
  { category: 'Major Donors', value: 15 },
  { category: 'Recurring', value: 32 },
  { category: 'Single Gift', value: 28 },
  { category: 'LYBUNT', value: 25 },
]

const stats = [
  { name: 'Total Donors', value: '1,234', change: '+12%', icon: UserGroupIcon },
  { name: 'Year to Date', value: '$245,231', change: '+8.2%', icon: CurrencyDollarIcon },
  { name: 'LYBUNT Donors', value: '47', change: '-3.2%', icon: ExclamationTriangleIcon },
  { name: 'Avg Gift Size', value: '$421', change: '+5.1%', icon: ArrowTrendingUpIcon },
]

const recentActivity = [
  { id: 1, donor: 'John Smith', action: 'Made a donation', amount: '$10,000', time: '2 hours ago' },
  { id: 2, donor: 'Sarah Johnson', action: 'Meeting scheduled', amount: '', time: '4 hours ago' },
  { id: 3, donor: 'Robert Chen', action: 'Thank you note sent', amount: '', time: '1 day ago' },
  { id: 4, donor: 'Maria Garcia', action: 'Made a donation', amount: '$500', time: '2 days ago' },
  { id: 5, donor: 'David Wilson', action: 'Updated contact info', amount: '', time: '3 days ago' },
]

// Mock donor data for the dropdown
const mockDonors = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', totalDonations: 125000, lastDonationDate: '2024-01-15', isLYBUNT: false },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', totalDonations: 85000, lastDonationDate: '2024-02-01', isLYBUNT: false },
  { id: '3', name: 'Robert Chen', email: 'robert.chen@email.com', totalDonations: 45000, lastDonationDate: '2023-12-20', isLYBUNT: true },
  { id: '4', name: 'Maria Garcia', email: 'maria.g@email.com', totalDonations: 275000, lastDonationDate: '2024-01-10', isLYBUNT: false },
  { id: '5', name: 'David Wilson', email: 'david.wilson@email.com', totalDonations: 32000, lastDonationDate: '2023-11-15', isLYBUNT: true },
  { id: '6', name: 'Emily Davis', email: 'emily.davis@email.com', totalDonations: 68000, lastDonationDate: '2024-02-05', isLYBUNT: false },
  { id: '7', name: 'Michael Brown', email: 'michael.b@email.com', totalDonations: 92000, lastDonationDate: '2024-01-25', isLYBUNT: false },
  { id: '8', name: 'Jennifer Lee', email: 'jennifer.lee@email.com', totalDonations: 21000, lastDonationDate: '2023-10-30', isLYBUNT: true },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showDonorDropdown, setShowDonorDropdown] = useState(false)
  const [filteredDonors, setFilteredDonors] = useState(mockDonors)
  const router = useRouter()


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter donors based on search and filter type
  useEffect(() => {
    let results = [...mockDonors]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(donor =>
        donor.name.toLowerCase().includes(query) ||
        donor.email.toLowerCase().includes(query)
      )
    }

    // Apply filter type
    if (filterType === 'highest') {
      results.sort((a, b) => b.totalDonations - a.totalDonations)
    } else if (filterType === 'lybunt') {
      results = results.filter(donor => donor.isLYBUNT)
    }

    setFilteredDonors(results)
  }, [searchQuery, filterType])

  const handleDonorSelect = (donor) => {
    setSelectedDonor(donor)
    setShowDonorDropdown(false)
    setSearchQuery('')
  }

  const handleClearSelection = () => {
    setSelectedDonor(null)
    setSearchQuery('')
  }

  const handleQuickAction = (action) => {
    if (!selectedDonor) {
      alert('Please select a donor first')
      return
    }

    switch(action) {
      case 'record':
        window.location.href = `/recorddonorpage/`
        break
      case 'thank-you':
        window.location.href = `/communications/new`
        break
      case 'meeting':
        window.location.href = `/communications/schedule?donorId=${selectedDonor.id}`
        break
      case 'view':
        router.push(`/donors/${selectedDonor.id}`)
        break
      default:
        break
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.dashboardSubtitle}>Welcome back! Here's what's happening with your donors.</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className={styles.statCard}>
              <div className={styles.statCardContent}>
                <div className={styles.statText}>
                  <p className={styles.statName}>{stat.name}</p>
                  <p className={styles.statValue}>{stat.value}</p>
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

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartContainer}>
          <h2 className={styles.chartTitle}>Donations Over Time</h2>
          <div className={styles.chartWrapper}>
            <div className={styles.barChart}>
              {chartdata.map((item, index) => {
                const maxAmount = Math.max(...chartdata.map(d => d.amount))
                const height = (item.amount / maxAmount) * 100
                return (
                  <div key={index} className={styles.bar} style={{ height: `${height}%` }}>
                    <span className={styles.barLabel}>{item.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <h2 className={styles.chartTitle}>Donor Composition</h2>
          <div className={styles.chartWrapper}>
            <div className={styles.donutChart}>
              <div className={styles.donutCenter}></div>
            </div>
            <div className={styles.donutLegend}>
              {donorData.map((item, index) => (
                <div key={index} className={styles.donutLegendItem}>
                  <div className={`${styles.donutLegendColor} ${
                    styles[`donutLegendColor${item.category.replace(/\s+/g, '')}`]
                  }`}></div>
                  <span>{item.category}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className={styles.dashboardMainGrid}>
        <div className={styles.recentActivityCard}>
          <h2 className={styles.recentActivityTitle}>Recent Activity</h2>
          <div className={styles.recentActivityList}>
            {recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityInfo}>
                  <p className={styles.activityDonor}>{activity.donor}</p>
                  <p className={styles.activityAction}>{activity.action}</p>
                </div>
                <div className={styles.activityDetails}>
                  {activity.amount && <p className={styles.activityAmount}>{activity.amount}</p>}
                  <p className={styles.activityTime}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/communications" className={styles.recentActivityLink}>
            View all activity →
          </Link>
        </div>

        <div className={styles.quickActionsCard}>
          <h2 className={styles.quickActionsTitle}>Quick Actions</h2>
          
          {/* Donor Selection Section */}
          <div className={styles.donorSelectionSection}>
            <div className={styles.donorSearchContainer}>
              <div className={styles.donorSearchInputWrapper}>
                <MagnifyingGlassIcon className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search donors by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowDonorDropdown(true)}
                  className={styles.donorSearchInput}
                />
                {selectedDonor && (
                  <button onClick={handleClearSelection} className={styles.clearSelectionBtn}>
                    <XMarkIcon className={styles.clearIcon} />
                  </button>
                )}
              </div>
              
              {/* Filter Buttons */}
              <div className={styles.filterButtonsContainer}>
                <button
                  className={`${styles.filterButton} ${filterType === 'all' ? styles.active : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  All Donors
                </button>
                <button
                  className={`${styles.filterButton} ${filterType === 'highest' ? styles.active : ''}`}
                  onClick={() => setFilterType('highest')}
                >
                  <CurrencyDollarIcon className={styles.filterIcon} />
                  Highest Donors
                </button>
                <button
                  className={`${styles.filterButton} ${filterType === 'lybunt' ? styles.active : ''}`}
                  onClick={() => setFilterType('lybunt')}
                >
                  <ExclamationTriangleIcon className={styles.filterIcon} />
                  LYBUNT
                </button>
              </div>
            </div>

            {/* Selected Donor Display */}
            {selectedDonor && (
              <div className={styles.selectedDonorDisplay}>
                <div className={styles.selectedDonorInfo}>
                  <div className={styles.selectedDonorAvatar}>
                    {selectedDonor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={styles.selectedDonorDetails}>
                    <p className={styles.selectedDonorName}>{selectedDonor.name}</p>
                    <p className={styles.selectedDonorEmail}>{selectedDonor.email}</p>
                    <div className={styles.selectedDonorStats}>
                      <span className={styles.donorStat}>
                        Total: {formatCurrency(selectedDonor.totalDonations)}
                      </span>
                      <span className={`${styles.donorStat} ${selectedDonor.isLYBUNT ? styles.lybuntBadge : ''}`}>
                        {selectedDonor.isLYBUNT ? 'LYBUNT' : 'Current Donor'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Donor Dropdown */}
            {showDonorDropdown && filteredDonors.length > 0 && (
              <div className={styles.donorDropdown}>
                <div className={styles.donorDropdownHeader}>
                  <span className={styles.dropdownTitle}>Select a Donor</span>
                  <button 
                    onClick={() => setShowDonorDropdown(false)}
                    className={styles.closeDropdownBtn}
                  >
                    <XMarkIcon className={styles.closeIcon} />
                  </button>
                </div>
                <div className={styles.donorDropdownList}>
                  {filteredDonors.map((donor) => (
                    <button
                      key={donor.id}
                      className={styles.donorDropdownItem}
                      onClick={() => handleDonorSelect(donor)}
                    >
                      <div className={styles.donorItemAvatar}>
                        {donor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={styles.donorItemInfo}>
                        <p className={styles.donorItemName}>{donor.name}</p>
                        <p className={styles.donorItemEmail}>{donor.email}</p>
                        <div className={styles.donorItemStats}>
                          <span className={styles.donorItemTotal}>
                            {formatCurrency(donor.totalDonations)}
                          </span>
                          {donor.isLYBUNT && (
                            <span className={styles.donorItemLybunt}>LYBUNT</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className={styles.quickActionsList}>
            <button
              onClick={() => handleQuickAction('record')}
              className={`${styles.quickActionButton} ${!selectedDonor ? styles.disabled : ''} ${styles.quickActionButtonBlue}`}
              disabled={!selectedDonor}
            >
              <CurrencyDollarIcon className={styles.quickActionIcon} />
              <span className={styles.quickActionText}>Record Donation</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('thank-you')}
              className={`${styles.quickActionButton} ${!selectedDonor ? styles.disabled : ''} ${styles.quickActionButtonGreen}`}
              disabled={!selectedDonor}
            >
              <EnvelopeIcon className={styles.quickActionIcon} />
              <span className={styles.quickActionText}>Send Thank You</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('meeting')}
              className={`${styles.quickActionButton} ${!selectedDonor ? styles.disabled : ''} ${styles.quickActionButtonPurple}`}
              disabled={!selectedDonor}
            >
              <CalendarIcon className={styles.quickActionIcon} />
              <span className={styles.quickActionText}>Schedule Meeting</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('view')}
              className={`${styles.quickActionButton} ${!selectedDonor ? styles.disabled : ''} ${styles.quickActionButtonGray}`}
              disabled={!selectedDonor}
            >
              <UserGroupIcon className={styles.quickActionIcon} />
              <span className={styles.quickActionText}>View Donor Profile</span>
            </button>
            
            <Link
              href="/donors?filter=lybunt"
              className={`${styles.quickActionLink} ${styles.quickActionLinkYellow}`}
            >
              <ExclamationTriangleIcon className={styles.quickActionIcon} />
              <span className={styles.quickActionText}>Review All LYBUNT Donors</span>
            </Link>
          </div>

          {/* Hint for selecting donor */}
          {!selectedDonor && (
            <div className={styles.selectionHint}>
              <p>Please select a donor from the search above to enable quick actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}