'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from 'use-debounce'

export default function DonorDirectoryPage() {
  const router = useRouter()
  const [donors, setDonors] = useState([])
  const [filteredDonors, setFilteredDonors] = useState([])
  const [stats, setStats] = useState({
    totalDonors: 0,
    activeDonors: 0,
    totalLifetimeDonations: 0,
    averageDonation: 0,
    statusDistribution: [],
    stageDistribution: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [stageFilter, setStageFilter] = useState('ALL')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [sortBy, setSortBy] = useState('lastName')
  const [sortOrder, setSortOrder] = useState('asc')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  console.log('Rendering DonorDirectoryPage with',)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [donorsResponse, statsResponse] = await Promise.all([
          fetch('/api/donors/directory'),
          fetch('/api/donors/stats')
        ])

        if (!donorsResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const donorsData = await donorsResponse.json()
        const statsData = await statsResponse.json()

        setDonors(donorsData)
        setFilteredDonors(donorsData)
        setStats(statsData)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and sort donors
  const applyFilters = useCallback(() => {
    let results = [...donors]

    // Apply search filter
    if (debouncedSearchTerm) {
      results = results.filter(donor => {
        const fullName = `${donor.firstName} ${donor.lastName}`.toLowerCase()
        const search = debouncedSearchTerm.toLowerCase()
        return (
          fullName.includes(search) ||
          donor.email?.toLowerCase().includes(search) ||
          donor.phone?.includes(debouncedSearchTerm)
        )
      })
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      results = results.filter(donor => donor.status === statusFilter)
    }

    // Apply stage filter
    if (stageFilter !== 'ALL') {
      results = results.filter(donor => donor.relationshipStage === stageFilter)
    }

    // Apply amount filters
    if (minAmount) {
      const min = parseFloat(minAmount)
      if (!isNaN(min)) {
        results = results.filter(donor => donor.totalDonations >= min)
      }
    }

    if (maxAmount) {
      const max = parseFloat(maxAmount)
      if (!isNaN(max)) {
        results = results.filter(donor => donor.totalDonations <= max)
      }
    }

    // Apply sorting
    results.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'totalDonations':
          aValue = a.totalDonations
          bValue = b.totalDonations
          break
        case 'lastDonation':
          aValue = a.lastDonationDate ? new Date(a.lastDonationDate).getTime() : 0
          bValue = b.lastDonationDate ? new Date(b.lastDonationDate).getTime() : 0
          break
        case 'firstName':
          aValue = a.firstName.toLowerCase()
          bValue = b.firstName.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default: // lastName
          aValue = a.lastName.toLowerCase()
          bValue = b.lastName.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    setFilteredDonors(results)
  }, [donors, debouncedSearchTerm, statusFilter, stageFilter, minAmount, maxAmount, sortBy, sortOrder])

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleDonorSelect = (donorId) => {
    router.push(`/recorddonorpage/${donorId}`)
  }

  const handleQuickRecordDonation = (donorId, e) => {
    e.stopPropagation()
    router.push(`/recorddonorpage/${donorId}?action=record-donation`)
  }

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('ALL')
    setStageFilter('ALL')
    setMinAmount('')
    setMaxAmount('')
    setSortBy('lastName')
    setSortOrder('asc')
  }

  // Styles object
  const styles = {
    // Main container styles
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '1rem'
    },
    loadingContainer: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    },
    loadingSpinner: {
      textAlign: 'center'
    },
    spinner: {
      display: 'inline-block',
      animation: 'spin 1s linear infinite',
      borderRadius: '50%',
      borderTop: '2px solid #3b82f6',
      borderRight: '2px solid transparent',
      width: '3rem',
      height: '3rem',
      marginBottom: '1rem'
    },
    errorContainer: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    },
    errorContent: {
      textAlign: 'center',
      color: '#ef4444'
    },
    errorTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '0.5rem'
    },
    errorRetryButton: {
      marginTop: '1rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s ease-in-out'
    },
    // Header styles
    header: {
      marginBottom: '2rem'
    },
    headerTitle: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    headerSubtitle: {
      color: '#6b7280'
    },
    // Stats grid styles
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.2s ease-in-out'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    statValue: {
      fontSize: '1.875rem',
      fontWeight: '700'
    },
    // Filters container styles
    filtersContainer: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      marginBottom: '1.5rem'
    },
    searchActionsRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    searchContainer: {
      flex: 1
    },
    searchWrapper: {
      position: 'relative'
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      width: '1.25rem',
      height: '1.25rem'
    },
    searchInput: {
      width: '100%',
      padding: '0.5rem 0.75rem 0.5rem 2.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease-in-out'
    },
    actionsContainer: {
      display: 'flex',
      gap: '0.75rem'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      borderRadius: '0.75rem',
      fontWeight: '500',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      border: '1px solid transparent'
    },
    actionButtonPrimary: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    actionButtonSecondary: {
      backgroundColor: 'white',
      color: '#374151',
      borderColor: '#d1d5db'
    },
    // Advanced filters grid
    advancedFiltersGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    filterLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151'
    },
    filterSelect: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      transition: 'all 0.2s ease-in-out'
    },
    filterInput: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      transition: 'all 0.2s ease-in-out'
    },
    // Filter actions
    filterActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    clearFiltersButton: {
      fontSize: '0.875rem',
      color: '#6b7280',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out'
    },
    filterResults: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    // Donors table
    donorsTableContainer: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      marginBottom: '1.5rem'
    },
    tableWrapper: {
      overflowX: 'auto'
    },
    donorsTable: {
      minWidth: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f9fafb'
    },
    tableHeaderTh: {
      padding: '0.75rem 1.5rem',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#6b7280',
      borderBottom: '1px solid #e5e7eb',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'all 0.2s ease-in-out'
    },
    sortIndicator: {
      marginLeft: '0.25rem',
      fontSize: '0.875rem'
    },
    tableBody: {
      borderBottom: '1px solid #e5e7eb'
    },
    tableBodyTr: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer'
    },
    tableBodyTd: {
      padding: '1rem 1.5rem',
      fontSize: '0.875rem'
    },
    // Donor cell
    donorCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    donorAvatar: {
      width: '2.5rem',
      height: '2.5rem',
      backgroundColor: '#93c5fd',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      color: '#1d4ed8',
      flexShrink: 0
    },
    donorInfo: {
      minWidth: 0
    },
    donorName: {
      fontWeight: '500',
      color: '#111827',
      marginBottom: '0.25rem'
    },
    donorEmail: {
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    // Status badge
    statusBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.025em'
    },
    statusActive: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981'
    },
    statusLapsed: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b'
    },
    statusProspect: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      color: '#3b82f6'
    },
    statusInactive: {
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      color: '#6b7280'
    },
    // Stage text
    stageText: {
      textTransform: 'capitalize',
      color: '#374151'
    },
    // Amount cell
    amountCell: {
      fontWeight: '500',
      color: '#111827'
    },
    // Date cell
    dateCell: {
      color: '#6b7280'
    },
    // Actions cell
    actionsCell: {
      display: 'flex',
      gap: '1rem'
    },
    actionLink: {
      fontSize: '0.875rem',
      fontWeight: '500',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out'
    },
    actionLinkView: {
      color: '#3b82f6'
    },
    actionLinkRecord: {
      color: '#10b981'
    },
    // Empty state
    emptyState: {
      padding: '3rem 1.5rem',
      textAlign: 'center'
    },
    emptyStateIcon: {
      width: '3rem',
      height: '3rem',
      margin: '0 auto 1rem',
      color: '#9ca3af'
    },
    emptyStateTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    emptyStateDescription: {
      color: '#6b7280',
      marginBottom: '1.5rem',
      maxWidth: '28rem',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    emptyStateButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out'
    },
    // Quick stats footer
    quickStatsFooter: {
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    quickStatsContent: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    filteredCount: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    statusSummary: {
      display: 'flex',
      gap: '1rem',
      fontSize: '0.875rem'
    },
    statusItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statusDot: {
      width: '0.75rem',
      height: '0.75rem',
      borderRadius: '50%'
    },
    statusDotActive: {
      backgroundColor: '#10b981'
    },
    statusDotLapsed: {
      backgroundColor: '#f59e0b'
    },
    statusDotProspect: {
      backgroundColor: '#3b82f6'
    },
    // Media queries
    mediaQueries: {
      tablet: '@media (min-width: 768px)',
      desktop: '@media (min-width: 1024px)'
    }
  }

  // Function to handle hover states
  const handleHover = (e, isHover) => {
    if (isHover) {
      e.target.style.backgroundColor = '#f3f4f6'
    } else {
      e.target.style.backgroundColor = ''
    }
  }

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading donors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <p style={styles.errorTitle}>Error Loading Data</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={styles.errorRetryButton}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Donor Directory</h1>
          <p style={styles.headerSubtitle}>View and manage all donors in your organization</p>
        </div>

        {/* Stats Overview */}
        <div style={{
          ...styles.statsGrid,
          ...(window.innerWidth >= 768 && { gridTemplateColumns: 'repeat(2, 1fr)' }),
          ...(window.innerWidth >= 1024 && { gridTemplateColumns: 'repeat(4, 1fr)' })
        }}>
          <div 
            style={styles.statCard}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <p style={styles.statLabel}>Total Donors</p>
            <p style={{...styles.statValue, color: '#111827'}}>{stats.totalDonors}</p>
          </div>
          <div 
            style={styles.statCard}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <p style={styles.statLabel}>Active Donors</p>
            <p style={{...styles.statValue, color: '#10b981'}}>{stats.activeDonors}</p>
          </div>
          <div 
            style={styles.statCard}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <p style={styles.statLabel}>Lifetime Donations</p>
            <p style={{...styles.statValue, color: '#3b82f6'}}>
              ${stats?.totalLifetimeDonations?.toLocaleString() ?? '0'}
            </p>
          </div>
          <div 
            style={styles.statCard}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <p style={styles.statLabel}>Avg Donation</p>
            <p style={{...styles.statValue, color: '#8b5cf6'}}>
              ${stats.averageDonation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div style={styles.filtersContainer}>
          <div style={{
            ...styles.searchActionsRow,
            ...(window.innerWidth >= 1024 && { flexDirection: 'row' })
          }}>
            {/* Search */}
            <div style={styles.searchContainer}>
              <div style={styles.searchWrapper}>
                <svg style={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search donors by name, email, or phone..."
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div style={styles.actionsContainer}>
              <button 
                onClick={() => router.push('/donors/new')}
                style={{
                  ...styles.actionButton,
                  ...styles.actionButtonPrimary
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                Add New Donor
              </button>
              <button 
                style={{
                  ...styles.actionButton,
                  ...styles.actionButtonSecondary
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                Export Donors
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div style={{
            ...styles.advancedFiltersGrid,
            ...(window.innerWidth >= 768 && { gridTemplateColumns: 'repeat(2, 1fr)' }),
            ...(window.innerWidth >= 1024 && { gridTemplateColumns: 'repeat(4, 1fr)' })
          }}>
            {/* Status Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select
                style={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="LAPSED">Lapsed</option>
                <option value="PROSPECT">Prospect</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Relationship Stage Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Relationship Stage</label>
              <select
                style={styles.filterSelect}
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="ALL">All Stages</option>
                <option value="NEW">New</option>
                <option value="CULTIVATION">Cultivation</option>
                <option value="ASK_READY">Ask Ready</option>
                <option value="STEWARDSHIP">Stewardship</option>
                <option value="MAJOR_GIFT">Major Gift</option>
                <option value="LEGACY">Legacy</option>
              </select>
            </div>

            {/* Amount Range */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Min Amount</label>
              <input
                type="number"
                placeholder="$0"
                style={styles.filterInput}
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Max Amount</label>
              <input
                type="number"
                placeholder="Any"
                style={styles.filterInput}
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div style={styles.filterActions}>
            <button
              onClick={clearFilters}
              style={styles.clearFiltersButton}
              onMouseOver={(e) => e.target.style.color = '#111827'}
              onMouseOut={(e) => e.target.style.color = '#6b7280'}
            >
              Clear all filters
            </button>
            <div style={styles.filterResults}>
              Showing {filteredDonors.length} of {donors.length} donors
            </div>
          </div>
        </div>

        {/* Donors Table */}
        <div style={styles.donorsTableContainer}>
          <div style={styles.tableWrapper}>
            <table style={styles.donorsTable}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th 
                    style={styles.tableHeaderTh}
                    onClick={() => toggleSort('lastName')}
                    onMouseOver={(e) => handleHover(e, true)}
                    onMouseOut={(e) => handleHover(e, false)}
                  >
                    <div>
                      Donor
                      {sortBy === 'lastName' && (
                        <span style={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    style={styles.tableHeaderTh}
                    onClick={() => toggleSort('status')}
                    onMouseOver={(e) => handleHover(e, true)}
                    onMouseOut={(e) => handleHover(e, false)}
                  >
                    <div>
                      Status
                      {sortBy === 'status' && (
                        <span style={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th style={styles.tableHeaderTh}>
                    Stage
                  </th>
                  <th 
                    style={styles.tableHeaderTh}
                    onClick={() => toggleSort('totalDonations')}
                    onMouseOver={(e) => handleHover(e, true)}
                    onMouseOut={(e) => handleHover(e, false)}
                  >
                    <div>
                      Total Donations
                      {sortBy === 'totalDonations' && (
                        <span style={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    style={styles.tableHeaderTh}
                    onClick={() => toggleSort('lastDonation')}
                    onMouseOver={(e) => handleHover(e, true)}
                    onMouseOut={(e) => handleHover(e, false)}
                  >
                    <div>
                      Last Donation
                      {sortBy === 'lastDonation' && (
                        <span style={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th style={styles.tableHeaderTh}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((donor) => (
                  <tr 
                    key={donor.id}
                    style={styles.tableBodyTr}
                    onClick={() => handleDonorSelect(donor.id)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <td style={styles.tableBodyTd}>
                      <div style={styles.donorCell}>
                        <div style={styles.donorAvatar}>
                          <span>
                            {donor.firstName.charAt(0)}{donor.lastName.charAt(0)}
                          </span>
                        </div>
                        <div style={styles.donorInfo}>
                          <div style={styles.donorName}>
                            {donor.firstName} {donor.lastName}
                          </div>
                          <div style={styles.donorEmail}>{donor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.tableBodyTd}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(donor.status === 'ACTIVE' ? styles.statusActive :
                            donor.status === 'LAPSED' ? styles.statusLapsed :
                            donor.status === 'PROSPECT' ? styles.statusProspect :
                            styles.statusInactive)
                      }}>
                        {donor.status}
                      </span>
                    </td>
                    <td style={{...styles.tableBodyTd, ...styles.stageText}}>
                      {donor.relationshipStage.replace('_', ' ')}
                    </td>
                    <td style={{...styles.tableBodyTd, ...styles.amountCell}}>
                      ${donor.totalDonations.toLocaleString()}
                    </td>
                    <td style={{...styles.tableBodyTd, ...styles.dateCell}}>
                      {donor.lastDonationDate 
                        ? new Date(donor.lastDonationDate).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td style={styles.tableBodyTd}>
                      <div style={styles.actionsCell}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDonorSelect(donor.id)
                          }}
                          style={{
                            ...styles.actionLink,
                            ...styles.actionLinkView
                          }}
                          onMouseOver={(e) => e.target.style.color = '#2563eb'}
                          onMouseOut={(e) => e.target.style.color = '#3b82f6'}
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => handleQuickRecordDonation(donor.id, e)}
                          style={{
                            ...styles.actionLink,
                            ...styles.actionLinkRecord
                          }}
                          onMouseOver={(e) => e.target.style.color = '#34d399'}
                          onMouseOut={(e) => e.target.style.color = '#10b981'}
                        >
                          Record Donation
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredDonors.length === 0 && (
              <div style={styles.emptyState}>
                <svg style={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 style={styles.emptyStateTitle}>No donors found</h3>
                <p style={styles.emptyStateDescription}>
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <div>
                  <button
                    onClick={clearFilters}
                    style={styles.emptyStateButton}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div style={styles.quickStatsFooter}>
          <div style={styles.quickStatsContent}>
            <div style={styles.filteredCount}>
              <strong>{filteredDonors.length}</strong> donors match your filters
            </div>
            <div style={styles.statusSummary}>
              <div style={styles.statusItem}>
                <div style={{...styles.statusDot, ...styles.statusDotActive}}></div>
                <span>Active: {filteredDonors.filter(d => d.status === 'ACTIVE').length}</span>
              </div>
              <div style={styles.statusItem}>
                <div style={{...styles.statusDot, ...styles.statusDotLapsed}}></div>
                <span>Lapsed: {filteredDonors.filter(d => d.status === 'LAPSED').length}</span>
              </div>
              <div style={styles.statusItem}>
                <div style={{...styles.statusDot, ...styles.statusDotProspect}}></div>
                <span>Prospects: {filteredDonors.filter(d => d.status === 'PROSPECT').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}