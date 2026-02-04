'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { 
  CurrencyDollarIcon, 
  BellAlertIcon, 
  UserGroupIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline'
import { useQuickActions } from '../providers/QuickActionsProvider'
import styles from './QuickActions.module.css'

export default function QuickActions() {
  const [expanded, setExpanded] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [executing, setExecuting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [showDonorDropdown, setShowDonorDropdown] = useState(false)
  
  const {
    donors = [],
    donations = [],
    loading,
    error,
    stats = {},
    quickActions = [],
    formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount || 0)
    },
    aiStatus = {}
  } = useQuickActions()

  // Get icon component safely
  const getIconComponent = (iconName) => {
    const iconMap = {
      'CurrencyDollarIcon': CurrencyDollarIcon,
      'BellAlertIcon': BellAlertIcon,
      'UserGroupIcon': UserGroupIcon,
      'SparklesIcon': SparklesIcon,
      'CheckCircleIcon': CheckCircleIcon,
      'ArrowRightIcon': ArrowRightIcon,
      'XMarkIcon': XMarkIcon,
      'UserCircleIcon': UserCircleIcon,
      'EnvelopeIcon': EnvelopeIcon,
      'PhoneIcon': PhoneIcon,
      'CalendarIcon': CalendarIcon,
      'DocumentTextIcon': DocumentTextIcon,
      'ClockIcon': ClockIcon,
      'PlusIcon': PlusIcon,
      'MagnifyingGlassIcon': MagnifyingGlassIcon,
      'ExclamationTriangleIcon': ExclamationTriangleIcon,
      'ReceiptPercentIcon': ReceiptPercentIcon
    }
    return iconMap[iconName] || UserCircleIcon
  }

  // Helper functions for donor display
  const getDisplayName = (donor) => {
    if (!donor) return 'Unknown Donor'
    
    if (donor.name) return donor.name
    if (donor.firstName || donor.lastName) {
      return [donor.firstName, donor.lastName].filter(Boolean).join(' ')
    }
    return 'Unknown Donor'
  }

  const getInitials = (donor) => {
    const name = getDisplayName(donor)
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const getEmail = (donor) => {
    if (!donor) return 'No email'
    return donor.email || donor.emailAddress || 'No email'
  }

  // Process donors with stats
  const processedDonors = useMemo(() => {
    if (!Array.isArray(donors) || donors.length === 0) return []

    // Get last donation year per donor
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1

    return donors.map(donor => {
      const donorDonations = Array.isArray(donations) 
        ? donations.filter(d => d && d.donorId === donor.id)
        : []
      
      const totalDonations = donorDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
      
      const lastDonationYear = donorDonations.length 
        ? Math.max(...donorDonations.map(d => {
            try {
              return new Date(d.date).getFullYear()
            } catch {
              return 0
            }
          }))
        : null

      const isLYBUNT = lastDonationYear === lastYear
      const isSYBUNT = !isLYBUNT && donorDonations.length > 0

      return {
        ...donor,
        totalDonations,
        isLYBUNT,
        isSYBUNT,
        displayName: getDisplayName(donor),
        email: getEmail(donor),
        // Original props from your component
        id: donor.id,
        firstName: donor.firstName,
        lastName: donor.lastName,
        name: getDisplayName(donor)
      }
    })
  }, [donors, donations])

  // LYBUNT / SYBUNT counts
  const donationStats = useMemo(() => {
    let lybunt = 0
    let sybunt = 0
    processedDonors.forEach(d => {
      if (d.isLYBUNT) lybunt++
      if (d.isSYBUNT) sybunt++
    })
    return { lybuntDonors: lybunt, sybuntDonors: sybunt }
  }, [processedDonors])

  // Filter donors
  const filteredDonors = useMemo(() => {
    let result = [...processedDonors]

    // Apply search
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      result = result.filter(d =>
        d.displayName.toLowerCase().includes(query) ||
        d.email.toLowerCase().includes(query)
      )
    }

    // Apply filter
    if (filterType === 'highest') {
      result.sort((a, b) => b.totalDonations - a.totalDonations)
    } else if (filterType === 'lybunt') {
      result = result.filter(d => d.isLYBUNT)
    } else if (filterType === 'sybunt') {
      result = result.filter(d => d.isSYBUNT)
    }

    return result
  }, [processedDonors, searchQuery, filterType])

  // Donor selection handlers
  const handleDonorSelect = (donor) => {
    setSelectedDonor(donor)
    setShowDonorDropdown(false)
    setSearchQuery(donor.displayName)
  }

  const handleClearSelection = () => {
    setSelectedDonor(null)
    setSearchQuery('')
    setSelectedAction(null)
  }

  // Quick action handlers
  const handleQuickAction = (action) => {
    if (!selectedDonor) return
    
    switch (action) {
      case 'record':
        window.location.href = `/recorddonorpage/${selectedDonor.id}`
        break
      case 'thank-you':
        window.location.href = `/communications/new/?donorId=${selectedDonor.id}&tab=templates`
        break
      case 'meeting':
        window.location.href = `/communications/schedule/`
        break
      case 'view':
        window.location.href = `/donors/${selectedDonor.id}`
        break
      case 'communications':
        window.location.href = `/communications?donorId=${selectedDonor.id}`
        break
      default:
        break
    }
  }

  // Compact quick action buttons (from your version)
  const donorQuickActions = [
    {
      id: 'record',
      label: 'Donation',
      icon: CurrencyDollarIcon,
      color: 'blue',
    },
    {
      id: 'thank-you',
      label: 'Thank You',
      icon: EnvelopeIcon,
      color: 'green',
    },
    {
      id: 'meeting',
      label: 'Meeting',
      icon: CalendarIcon,
      color: 'purple',
    },
    {
      id: 'communications',
      label: 'Message',
      icon: DocumentTextIcon,
      color: 'indigo',
    },
    {
      id: 'view',
      label: 'Profile',
      icon: UserCircleIcon,
      color: 'gray',
    },
  ]

  // Safe execute suggested action
  const handleExecuteSuggestedAction = useCallback(async (action) => {
    if (!action || executing) return
    
    setExecuting(true)
    try {
      const donorsToUse = action.donors || []
      const donationsToUse = action.donations || []
      
      switch (action.type) {
        case 'followup':
          if (donorsToUse.length > 0) {
            await Promise.all(donorsToUse.slice(0, 3).map(async (donor) => {
              const response = await fetch('/api/communications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  donorId: donor.id,
                  type: 'EMAIL',
                  subject: 'Following up on your past support',
                  content: `Dear ${donor.firstName}, we noticed you supported us last year...`,
                  status: 'DRAFT'
                })
              })
              return response.json()
            }))
          }
          break
        
        case 'thankyou':
          if (donationsToUse.length > 0) {
            await Promise.all(donationsToUse.slice(0, 3).map(async (donation) => {
              const response = await fetch('/api/communications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  donorId: donation.donorId,
                  type: 'EMAIL',
                  subject: 'Thank you for your generous donation',
                  content: 'Thank you for your recent donation...',
                  status: 'DRAFT'
                })
              })
              return response.json()
            }))
          }
          break
        
        case 'reactivation':
          if (donorsToUse.length > 0) {
            await Promise.all(donorsToUse.slice(0, 3).map(async (donor) => {
              const response = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  donorId: donor.id,
                  title: 'Reconnection Call',
                  description: 'Catching up and re-engaging',
                  startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  status: 'SCHEDULED'
                })
              })
              return response.json()
            }))
          }
          break
        
        case 'welcome':
          if (donorsToUse.length > 0) {
            await Promise.all(donorsToUse.map(async (donor) => {
              const response = await fetch('/api/communications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  donorId: donor.id,
                  type: 'EMAIL',
                  subject: 'Welcome to our community!',
                  content: `Welcome ${donor.firstName}, thank you for joining us...`,
                  status: 'DRAFT'
                })
              })
              return response.json()
            }))
          }
          break
      }
      
      // Show success feedback
      setTimeout(() => {
        setExecuting(false)
        setSelectedAction(null)
      }, 1000)
      
    } catch (error) {
      console.error('Error executing action:', error)
      setExecuting(false)
    }
  }, [executing])

  // Loading state
  if (loading) {
    return (
      <div className={styles.quickActions}>
        <div className={styles.header}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonBadge}></div>
        </div>
        <div className={styles.content}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonItem}></div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={styles.quickActions}>
        <div className={styles.header}>
          <h3 className={styles.title}>Quick Actions</h3>
        </div>
        <div className={styles.error}>
          <p>Unable to load actions</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.quickActions} ${expanded ? styles.expanded : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.title}>Quick Actions</h3>
          <div className={styles.statsBadge}>
            <span>{processedDonors.length} donors</span>
          </div>
        </div>
        <button 
          className={styles.expandButton}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <XMarkIcon /> : <PlusIcon />}
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Donor Search and Selection Section */}
        <div className={styles.donorSearchSection}>
          <div className={styles.searchWrapper}>
            <div className={styles.searchInputContainer}>
              <MagnifyingGlassIcon className={styles.searchIcon} />
              <input
                type="text"
                placeholder={processedDonors.length > 0 ? "Search donors..." : "No donors"}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value && !showDonorDropdown) {
                    setShowDonorDropdown(true)
                  }
                }}
                onFocus={() => processedDonors.length > 0 && setShowDonorDropdown(true)}
                className={styles.searchInput}
                disabled={processedDonors.length === 0}
              />
              {selectedDonor && (
                <button 
                  onClick={handleClearSelection} 
                  className={styles.clearSearchButton}
                  type="button"
                >
                  <XMarkIcon className={styles.clearSearchIcon} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className={styles.filterButtons}>
            <button
              type="button"
              className={`${styles.filterButton} ${filterType === 'all' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilterType('all')}
              disabled={processedDonors.length === 0}
            >
              All
            </button>
            <button
              type="button"
              className={`${styles.filterButton} ${filterType === 'highest' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilterType('highest')}
              disabled={processedDonors.length === 0}
            >
              <CurrencyDollarIcon className={styles.filterIcon} />
              Top
            </button>
            <button
              type="button"
              className={`${styles.filterButton} ${filterType === 'lybunt' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilterType('lybunt')}
              disabled={processedDonors.length === 0}
            >
              <ExclamationTriangleIcon className={styles.filterIcon} />
              LYBUNT ({donationStats.lybuntDonors})
            </button>
            <button
              type="button"
              className={`${styles.filterButton} ${filterType === 'sybunt' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilterType('sybunt')}
              disabled={processedDonors.length === 0}
            >
              <BellAlertIcon className={styles.filterIcon} />
              SYBUNT ({donationStats.sybuntDonors})
            </button>
          </div>

          {/* Selected Donor Display */}
          {selectedDonor && (
            <div className={styles.selectedDonor}>
              <div className={styles.selectedDonorContent}>
                <div className={styles.selectedDonorInitials}>
                  {getInitials(selectedDonor)}
                </div>
                <div className={styles.selectedDonorInfo}>
                  <p className={styles.selectedDonorName}>{selectedDonor.displayName}</p>
                  <div className={styles.selectedDonorDetails}>
                    <span className={styles.selectedDonorEmail}>{selectedDonor.email}</span>
                    <span className={styles.selectedDonorAmount}>
                      {formatCurrency(selectedDonor.totalDonations)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Donor Dropdown */}
          {showDonorDropdown && filteredDonors.length > 0 && (
            <div className={styles.donorDropdown}>
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownCount}>
                  {filteredDonors.length} found
                </span>
                <button 
                  onClick={() => setShowDonorDropdown(false)} 
                  className={styles.dropdownCloseButton}
                  type="button"
                >
                  <XMarkIcon className={styles.dropdownCloseIcon} />
                </button>
              </div>

              <div className={styles.donorList}>
                {filteredDonors.map((donor) => (
                  <button
                    key={donor.id}
                    className={styles.donorItem}
                    onClick={() => handleDonorSelect(donor)}
                    type="button"
                  >
                    <div className={styles.donorInitials}>
                      {getInitials(donor)}
                    </div>
                    <div className={styles.donorItemInfo}>
                      <p className={styles.donorItemName}>{donor.displayName}</p>
                      <div className={styles.donorItemDetails}>
                        <span className={styles.donorItemEmail}>{donor.email}</span>
                        <span className={styles.donorItemAmount}>
                          {formatCurrency(donor.totalDonations)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {processedDonors.length === 0 && (
            <div className={styles.emptyDonors}>
              <UserGroupIcon className={styles.emptyDonorsIcon} />
              <p className={styles.emptyDonorsText}>No donors found</p>
              <a href="/donors/new" className={styles.addDonorButton}>
                Add First Donor
              </a>
            </div>
          )}
        </div>

        {/* Action Content */}
        {selectedAction ? (
          // Suggested Action Detail View
          <div className={styles.actionDetail}>
            <div className={styles.actionDetailHeader}>
              <button 
                className={styles.backButton}
                onClick={() => setSelectedAction(null)}
              >
                ← Back
              </button>
              <h4 className={styles.actionDetailTitle}>
                {selectedAction.title || 'Action Details'}
              </h4>
            </div>
            <p className={styles.actionDetailDescription}>
              {selectedAction.description || 'No description available'}
            </p>
            {selectedAction.donors && selectedAction.donors.length > 0 && (
              <div className={styles.actionDonors}>
                {selectedAction.donors.slice(0, 3).map(donor => (
                  <div key={donor.id} className={styles.actionDonor}>
                    <UserCircleIcon className={styles.actionDonorIcon} />
                    <div className={styles.actionDonorInfo}>
                      <span className={styles.actionDonorName}>
                        {donor.firstName} {donor.lastName}
                      </span>
                      {donor.totalDonations > 0 && (
                        <span className={styles.actionDonorAmount}>
                          {formatCurrency(donor.totalDonations)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              className={styles.executeButton}
              onClick={() => handleExecuteSuggestedAction(selectedAction)}
              disabled={executing}
            >
              {executing ? 'Processing...' : 'Execute Action'}
            </button>
          </div>
        ) : selectedDonor ? (
          // Donor-Specific Quick Actions
          <div className={styles.donorActionsSection}>
            <div className={styles.donorActionButtons}>
              {donorQuickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    disabled={executing}
                    className={`${styles.donorActionButton} ${styles[`donorActionButton${action.color.charAt(0).toUpperCase() + action.color.slice(1)}`]}`}
                    type="button"
                    title={`${action.label} for ${selectedDonor.displayName}`}
                  >
                    <Icon className={styles.donorActionIcon} />
                    <span>{action.label}</span>
                  </button>
                )
              })}
            </div>
            
            {/* Hint for donor selection */}
            {!selectedDonor && processedDonors.length > 0 && (
              <div className={styles.donorSelectionHint}>
                <p className={styles.donorSelectionHintText}>
                  Select a donor to enable quick actions
                </p>
              </div>
            )}
            
            {/* Clear donor button */}
            {selectedDonor && (
              <div className={styles.clearDonorSection}>
                <button 
                  onClick={handleClearSelection}
                  className={styles.clearDonorButton}
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        ) : (
          // Suggested Actions (when no donor is selected)
          <>
            {/* AI Status */}
            {aiStatus?.isActive && (
              <div className={styles.aiStatus}>
                <SparklesIcon className={styles.aiStatusIcon} />
                <span className={styles.aiStatusText}>
                  AI Assistant Active
                </span>
              </div>
            )}

            {/* Quick Actions List */}
            {quickActions && quickActions.length > 0 ? (
              <div className={styles.suggestedActions}>
                <h4 className={styles.suggestedActionsTitle}>Suggested Actions</h4>
                {quickActions.map(action => {
                  const Icon = getIconComponent(action.icon)
                  return (
                    <button
                      key={action.id}
                      className={styles.suggestedActionItem}
                      onClick={() => setSelectedAction(action)}
                    >
                      <div className={styles.suggestedActionIcon}>
                        <Icon />
                      </div>
                      <div className={styles.suggestedActionContent}>
                        <h4 className={styles.suggestedActionTitle}>{action.title}</h4>
                        <p className={styles.suggestedActionDescription}>
                          {action.description}
                        </p>
                      </div>
                      <ArrowRightIcon className={styles.suggestedActionArrow} />
                    </button>
                  )
                })}
              </div>
            ) : processedDonors.length > 0 ? (
              <div className={styles.noActions}>
                <p className={styles.noActionsText}>
                  No suggested actions
                </p>
                <p className={styles.noActionsSubtext}>
                  Select a donor to see actions
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Footer Stats */}
      <div className={styles.footer}>
        <div className={styles.footerStats}>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>Donors</span>
            <span className={styles.footerStatValue}>
              {stats.totalDonors || 0}
            </span>
          </div>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>YTD</span>
            <span className={styles.footerStatValue}>
              {formatCurrency(stats.yearToDate || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}