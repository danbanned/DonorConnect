'use client'

import { useEffect, useState, useMemo } from 'react'
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserCircleIcon,
  ChartBarIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import styles from './Dashboard.module.css'
import { useRouter } from 'next/navigation'
import {useDonors} from '../hooks/useDonor'
import { useDonations } from '../hooks/usedonation.js'

export default function DashboardPage() {
  const router = useRouter()
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showDonorDropdown, setShowDonorDropdown] = useState(false)
  const [timeframe, setTimeframe] = useState('year') // For donation stats
  
  // Real data hooks
  const { donors, loading: donorsLoading, error: donorsError } = useDonors()
  const { donations, summary, loading: donationsLoading, error: donationsError } = useDonations({ 
    timeframe,
    limit: 1000 // Get more donations for better stats
  })

console.log(donations,'gigganigga')
  
 
  const isLoading = donorsLoading || donationsLoading

  // Process real donor data
  const processedDonors = useMemo(() => {
    if (!donors || donors.length === 0) return []
    
    return donors.map((donor) => {
      // Calculate donor stats from their donations
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
        status: donor.status || 'ACTIVE',
        relationshipStage: donor.relationshipStage || 'NEW',
        notes: donor.notes || donor.personalNotes?.notes || '',
        organizationId: donor.organizationId,
        createdAt: donor.createdAt ? new Date(donor.createdAt) : new Date(),
        updatedAt: donor.updatedAt ? new Date(donor.updatedAt) : new Date()
      }
    })
  }, [donors, donations])

   console.log('[Dashboard] donations sample:', donations?.[0])


  // Process donation statistics
  const donationStats = useMemo(() => {
    if (!donations || donations.length === 0) return {
      totalDonors: 0,
      yearToDate: 0,
      lybuntDonors: 0,
      avgGiftSize: 0,
      growth: 0,
      recentDonations: []
    }

    // Calculate YTD donations (current year)
    const currentYear = new Date().getFullYear()
    const ytdDonations = donations.filter(d => {
      const donationYear = new Date(d.date).getFullYear()
      return donationYear === currentYear
    })
    const ytdTotal = ytdDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
    
    // Calculate LY BUNT donors (simplified)
    const lybuntCount = processedDonors.filter(donor => donor.isLYBUNT).length
    
    // Calculate average gift
    const avgGift = donations.length > 0 
      ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length 
      : 0
    
    // Get recent donations (last 5)
    const recentDonations = [...donations]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(donation => {
        const donor = processedDonors.find(d => d.id === donation.donorId)
        return {
          id: donation.id,
          donor: donor ? `${donor.firstName} ${donor.lastName}` : 'Unknown Donor',
          action: 'Made a donation',
          amount: `$${donation.amount.toFixed(0)}`,
          time: formatTimeAgo(new Date(donation.date))
        }
      })

    return {
      totalDonors: processedDonors.length,
      yearToDate: ytdTotal,
      lybuntDonors: lybuntCount,
      avgGiftSize: avgGift,
      growth: 8.2, // Mock growth percentage for now
      recentDonations
    }
  }, [donations, processedDonors])

  // Filter donors based on search and filter type
  const filteredDonors = useMemo(() => {
    let results = [...processedDonors]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(donor =>
        donor.name.toLowerCase().includes(query) ||
        donor.email.toLowerCase().includes(query) ||
        donor.phone.toLowerCase().includes(query)
      )
    }

    if (filterType === 'highest') {
      results.sort((a, b) => b.totalDonations - a.totalDonations)
    }

    if (filterType === 'lybunt') {
      results = results.filter(donor => donor.isLYBUNT)
    }

    return results
  }, [processedDonors, searchQuery, filterType])

  // Static chart data (enhanced with real data if available)
  const chartData = useMemo(() => {
    // Create monthly donation data
    const monthlyData = Array(12).fill(0).map((_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      amount: 0
    }))

    // Fill with real data if available
    if (donations && donations.length > 0) {
      donations.forEach(donation => {
        const date = new Date(donation.date)
        const month = date.getMonth()
        const year = date.getFullYear()
        
        if (year === 2024 && month >= 0 && month < 12) {
          monthlyData[month].amount += donation.amount
        }
      })
    } else {
      // Use mock data if no real data
      const mockAmounts = [40250, 38920, 45670, 51230, 48910, 56780, 52100, 49870, 54320, 58910, 61230, 59870]
      monthlyData.forEach((item, index) => {
        item.amount = mockAmounts[index] || 45000
      })
    }

    return monthlyData
  }, [donations])

  // Donor composition data
  const donorComposition = useMemo(() => {
    if (processedDonors.length === 0) {
      return [
        { category: 'Major Donors', value: 15 },
        { category: 'Recurring', value: 32 },
        { category: 'Single Gift', value: 28 },
        { category: 'LYBUNT', value: 25 },
      ]
    }

    const majorDonors = processedDonors.filter(d => d.totalDonations >= 10000).length
    const lybuntDonors = processedDonors.filter(d => d.isLYBUNT).length
    const recurringDonors = processedDonors.filter(d => 
      donations?.some(donation => donation.donorId === d.id && donation.isRecurring)
    ).length
    const singleGiftDonors = processedDonors.length - (majorDonors + lybuntDonors + recurringDonors)
    console.log(majorDonors,'mjjjjjj')

    return [
      { 
        category: 'Major Donors', 
        value: Math.round((majorDonors / processedDonors.length) * 100) 
      },
      { 
        category: 'Recurring', 
        value: Math.round((recurringDonors / processedDonors.length) * 100) 
      },
      { 
        category: 'Single Gift', 
        value: Math.round((singleGiftDonors / processedDonors.length) * 100) 
      },
      { 
        category: 'LYBUNT', 
        value: Math.round((lybuntDonors / processedDonors.length) * 100) 
      },
    ]
  }, [processedDonors, donations])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format time ago
  function formatTimeAgo(date) {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  }

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
        router.push(`/recorddonorpage/${selectedDonor.id}`)
        break
      case 'thank-you':
        router.push(`/communications/new?donorId=${selectedDonor.id}`)
        break
      case 'meeting':
        router.push(`/communications/schedule?donorId=${selectedDonor.id}`)
        break
      case 'view':
        router.push(`/donors/${selectedDonor.id}`)
        break
      default:
        break
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  // Stats data - mix of real and calculated
  const stats = [
    { 
      name: 'Total Donors', 
      value: donationStats.totalDonors.toLocaleString(), 
      change: '+12%', 
      icon: UserGroupIcon 
    },
    { 
      name: 'Year to Date', 
      value: formatCurrency(donationStats.yearToDate), 
      change: '+8.2%', 
      icon: CurrencyDollarIcon 
    },
    { 
      name: 'LYBUNT Donors', 
      value: donationStats.lybuntDonors.toString(), 
      change: donationStats.lybuntDonors > 0 ? '-3.2%' : '0%', 
      icon: ExclamationTriangleIcon 
    },
    { 
      name: 'Avg Gift Size', 
      value: formatCurrency(donationStats.avgGiftSize), 
      change: '+5.1%', 
      icon: ArrowTrendingUpIcon 
    },
  ]

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.dashboardSubtitle}>
          Welcome back! {donationStats.recentDonations.length > 0 
            ? `You have ${donationStats.totalDonors} donors and received ${formatCurrency(donationStats.yearToDate)} this year.`
            : 'Welcome to your donor management system.'}
        </p>
      </div>

      {/* Error messages */}
      {donorsError && (
        <div className={styles.errorMessage}>
          <p>Error loading donors: {donorsError}</p>
        </div>
      )}
      {donationsError && (
        <div className={styles.errorMessage}>
          <p>Error loading donations: {donationsError}</p>
        </div>
      )}

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
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Donations Over Time</h2>
            <div className={styles.chartTimeframe}>
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className={styles.timeframeSelect}
              >
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          <div className={styles.chartWrapper}>
            <div className={styles.barChart}>
              {chartData.map((item, index) => {
                const maxAmount = Math.max(...chartData.map(d => d.amount))
                const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
                return (
                  <div key={index} className={styles.barContainer}>
                    <div className={styles.bar} style={{ height: `${height}%` }}>
                      <div className={styles.barAmount}>{formatCurrency(item.amount)}</div>
                    </div>
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
              <div className={styles.donutCenter}>
                <span className={styles.donutCenterValue}>
                  {processedDonors.length}
                </span>
                <span className={styles.donutCenterLabel}>Total Donors</span>
              </div>
            </div>
            <div className={styles.donutLegend}>
              {donorComposition.map((item, index) => (
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
          <div className={styles.recentActivityHeader}>
            <h2 className={styles.recentActivityTitle}>Recent Activity</h2>
            <Link href="/donations" className={styles.viewAllLink}>
              View All →
            </Link>
          </div>
          <div className={styles.recentActivityList}>
            {donationStats.recentDonations.length > 0 ? (
              donationStats.recentDonations.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <UserCircleIcon className={styles.activityIcon} />
                  <div className={styles.activityInfo}>
                    <p className={styles.activityDonor}>{activity.donor}</p>
                    <p className={styles.activityAction}>{activity.action}</p>
                  </div>
                  <div className={styles.activityDetails}>
                    {activity.amount && <p className={styles.activityAmount}>{activity.amount}</p>}
                    <p className={styles.activityTime}>{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
               {processedDonors.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <UserCircleIcon className={styles.activityIcon} />
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
              </>
            )}
          </div>
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
                  placeholder={processedDonors.length > 0 ? "Search donors by name or email..." : "No donors available"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowDonorDropdown(true)}
                  className={styles.donorSearchInput}
                  disabled={processedDonors.length === 0}
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
                  disabled={processedDonors.length === 0}
                >
                  All Donors ({processedDonors.length})
                </button>
                <button
                  className={`${styles.filterButton} ${filterType === 'highest' ? styles.active : ''}`}
                  onClick={() => setFilterType('highest')}
                  disabled={processedDonors.length === 0}
                >
                  <CurrencyDollarIcon className={styles.filterIcon} />
                  Highest Donors
                </button>
                <button
                  className={`${styles.filterButton} ${filterType === 'lybunt' ? styles.active : ''}`}
                  onClick={() => setFilterType('lybunt')}
                  disabled={processedDonors.length === 0}
                >
                  <ExclamationTriangleIcon className={styles.filterIcon} />
                  LYBUNT ({donationStats.lybuntDonors})
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
                  <span className={styles.dropdownTitle}>
                    {filteredDonors.length} donor{filteredDonors.length !== 1 ? 's' : ''} found
                  </span>
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
                          {donor.totalDonations >= 10000 && (
                            <span className={styles.donorItemMajor}>Major</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for donors */}
            {processedDonors.length === 0 && (
              <div className={styles.noDonorsMessage}>
                <UserGroupIcon className={styles.noDonorsIcon} />
                <p>No donors found. Add your first donor to get started.</p>
                <Link href="/donors/new" className={styles.addDonorButton}>
                  Add First Donor
                </Link>
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
              <UserCircleIcon className={styles.quickActionIcon} />
              <span className={styles.quickActionText}>View Donor Profile</span>
            </button>
            
            <Link
              href="/donors"
              className={`${styles.quickActionLink} ${styles.quickActionLinkYellow}`}
            >
              <UserGroupIcon className={styles.quickActionIcon} />
              <span className={styles.quickActionText}>View All Donors</span>
            </Link>
            
            <Link
              href="/recorddonorpage"
              className={`${styles.quickActionLink} ${styles.quickActionLinkBlue}`}
            >
              <ReceiptPercentIcon className={styles.quickActionIcon} />
              <span className={styles.quickActionText}>Record Quick Donation</span>
            </Link>
          </div>

          {/* Hint for selecting donor */}
          {!selectedDonor && processedDonors.length > 0 && (
            <div className={styles.selectionHint}>
              <p>Select a donor from the search above to enable quick actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}