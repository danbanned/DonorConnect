'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import './DonorDirectory.css'

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

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading donors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <p className="error-title">Error Loading Data</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="error-retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="donor-directory">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="header-title">Donor Directory</h1>
          <p className="header-subtitle">View and manage all donors in your organization</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Donors</p>
            <p className="stat-value stat-total-donors">{stats.totalDonors}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Active Donors</p>
            <p className="stat-value stat-active-donors">{stats.activeDonors}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Lifetime Donations</p>
            <p className="stat-value stat-lifetime-donations">
              ${stats?.totalLifetimeDonations?.toLocaleString() ?? '0'}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Avg Donation</p>
            <p className="stat-value stat-average-donation">
              ${stats.averageDonation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="filters-container">
          <div className="search-actions-row">
            {/* Search */}
            <div className="search-container">
              <div className="search-wrapper">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search donors by name, email, or phone..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="actions-container">
              <button 
                onClick={() => router.push('/donors/new')}
                className="action-button action-button-primary"
              >
                Add New Donor
              </button>
              <button className="action-button action-button-secondary">
                Export Donors
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="advanced-filters-grid">
            {/* Status Filter */}
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="LAPSED">Lapsed</option>
                <option value="PROSPECT">Prospect</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Relationship Stage Filter */}
            <div className="filter-group">
              <label className="filter-label">Relationship Stage</label>
              <select
                className="filter-select"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
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
            <div className="filter-group">
              <label className="filter-label">Min Amount</label>
              <input
                type="number"
                placeholder="$0"
                className="filter-input"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Max Amount</label>
              <input
                type="number"
                placeholder="Any"
                className="filter-input"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="filter-actions">
            <button
              onClick={clearFilters}
              className="clear-filters-button"
            >
              Clear all filters
            </button>
            <div className="filter-results">
              Showing {filteredDonors.length} of {donors.length} donors
            </div>
          </div>
        </div>

        {/* Donors Table */}
        <div className="donors-table-container">
          <div className="table-wrapper">
            <table className="donors-table">
              <thead className="table-header">
                <tr>
                  <th 
                    onClick={() => toggleSort('lastName')}
                  >
                    <div>
                      Donor
                      {sortBy === 'lastName' && (
                        <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('status')}
                  >
                    <div>
                      Status
                      {sortBy === 'status' && (
                        <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th>
                    Stage
                  </th>
                  <th 
                    onClick={() => toggleSort('totalDonations')}
                  >
                    <div>
                      Total Donations
                      {sortBy === 'totalDonations' && (
                        <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('lastDonation')}
                  >
                    <div>
                      Last Donation
                      {sortBy === 'lastDonation' && (
                        <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredDonors.map((donor) => (
                  <tr 
                    key={donor.id} 
                    onClick={() => handleDonorSelect(donor.id)}
                  >
                    <td>
                      <div className="donor-cell">
                        <div className="donor-avatar">
                          <span>
                            {donor.firstName.charAt(0)}{donor.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="donor-info">
                          <div className="donor-name">
                            {donor.firstName} {donor.lastName}
                          </div>
                          <div className="donor-email">{donor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        donor.status === 'ACTIVE' ? 'status-active' :
                        donor.status === 'LAPSED' ? 'status-lapsed' :
                        donor.status === 'PROSPECT' ? 'status-prospect' :
                        'status-inactive'
                      }`}>
                        {donor.status}
                      </span>
                    </td>
                    <td className="stage-text">
                      {donor.relationshipStage.replace('_', ' ')}
                    </td>
                    <td className="amount-cell">
                      ${donor.totalDonations.toLocaleString()}
                    </td>
                    <td className="date-cell">
                      {donor.lastDonationDate 
                        ? new Date(donor.lastDonationDate).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDonorSelect(donor.id)
                          }}
                          className="action-link action-link-view"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => handleQuickRecordDonation(donor.id, e)}
                          className="action-link action-link-record"
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
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="empty-state-title">No donors found</h3>
                <p className="empty-state-description">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <div>
                  <button
                    onClick={clearFilters}
                    className="empty-state-button"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="quick-stats-footer">
          <div className="quick-stats-content">
            <div className="filtered-count">
              <strong>{filteredDonors.length}</strong> donors match your filters
            </div>
            <div className="status-summary">
              <div className="status-item">
                <div className="status-dot status-dot-active"></div>
                <span>Active: {filteredDonors.filter(d => d.status === 'ACTIVE').length}</span>
              </div>
              <div className="status-item">
                <div className="status-dot status-dot-lapsed"></div>
                <span>Lapsed: {filteredDonors.filter(d => d.status === 'LAPSED').length}</span>
              </div>
              <div className="status-item">
                <div className="status-dot status-dot-prospect"></div>
                <span>Prospects: {filteredDonors.filter(d => d.status === 'PROSPECT').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}