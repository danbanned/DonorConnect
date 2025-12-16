'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { getDonors, calculateLYBUNT } from '@/lib/donors'
import styles from './donors.module.css'

const filters = [
  { id: 'all', name: 'All Donors' },
  { id: 'active', name: 'Active' },
  { id: 'lybunt', name: 'LYBUNT' },
  { id: 'major', name: 'Major Donors' },
  { id: 'recurring', name: 'Recurring' },
]

export default function DonorsPage() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [lybuntDonors, setLybuntDonors] = useState([])

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDonors()
        setDonors(data)
        
        const lybunt = await calculateLYBUNT()
        setLybuntDonors(lybunt)
      } catch (error) {
        console.error('Failed to load donors:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getFilteredDonors = () => {
    let filtered = donors

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(donor => 
        donor.firstName.toLowerCase().includes(searchLower) ||
        donor.lastName.toLowerCase().includes(searchLower) ||
        donor.email?.toLowerCase().includes(searchLower) ||
        donor.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(donor => donor.status === 'ACTIVE')
        break
      case 'lybunt':
        filtered = filtered.filter(donor => 
          lybuntDonors.some(lybunt => lybunt.id === donor.id)
        )
        break
      case 'major':
        filtered = filtered.filter(donor => donor.totalGiven > 10000)
        break
      case 'recurring':
        filtered = filtered.filter(donor => donor.tags?.includes('recurring'))
        break
      default:
        break
    }

    return filtered
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getDonorStatus = (donor) => {
    if (lybuntDonors.some(d => d.id === donor.id)) {
      return { label: 'LYBUNT', style: styles.statusLybunt }
    }
    if (donor.hasActivePledge) {
      return { label: 'Active Pledge', style: styles.statusPledge }
    }
    if (donor.totalGiven > 10000) {
      return { label: 'Major Donor', style: styles.statusMajor }
    }
    return { label: 'Active', style: styles.statusActive }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    )
  }

  const filteredDonors = getFilteredDonors()

  return (
    <div className={styles.donorsContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Donors</h1>
          <p className={styles.pageDescription}>
            Manage and cultivate relationships with {filteredDonors.length} donors
          </p>
        </div>
        <Link
          href="/donors/new"
          className={styles.addDonorButton}
        >
          <PlusIcon className={styles.addDonorIcon} />
          Add Donor
        </Link>
      </div>

      {/* Filters & Search */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersContainer}>
          {/* Search */}
          <div className={styles.searchContainer}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search donors by name, email, or tags..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`${styles.filterTab} ${
                  selectedFilter === filter.id 
                    ? styles.filterTabActive 
                    : styles.filterTabInactive
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Donors Grid */}
      <div className={styles.donorsGrid}>
        {filteredDonors.map((donor) => {
          const status = getDonorStatus(donor)
          const lastGiftDate = donor.lastGiftDate 
            ? new Date(donor.lastGiftDate).toLocaleDateString()
            : 'Never'

          const pledgePercentage = donor.pledgeTotal 
            ? (donor.pledgePaid / donor.pledgeTotal) * 100 
            : 0

          return (
            <Link
              key={donor.id}
              href={`/donors/${donor.id}`}
              className={styles.donorCard}
            >
              <div className={styles.donorHeader}>
                <div className={styles.donorInfo}>
                  <div className={styles.donorAvatar}>
                    <UserCircleIcon className={styles.avatarIcon} />
                  </div>
                  <div>
                    <h3>{donor.firstName} {donor.lastName}</h3>
                    <p className={styles.donorEmail}>{donor.email}</p>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${status.style}`}>
                  {status.label}
                </span>
              </div>

              <div className={styles.donorStats}>
                <div className={styles.statRow}>
                  <div className={styles.statLabel}>
                    <CurrencyDollarIcon className={styles.statIcon} />
                    <span>Total Given</span>
                  </div>
                  <span className={styles.statValue}>
                    {formatCurrency(donor.totalGiven)}
                  </span>
                </div>

                <div className={styles.statRow}>
                  <div className={styles.statLabel}>
                    <CalendarIcon className={styles.statIcon} />
                    <span>Last Gift</span>
                  </div>
                  <span className={styles.textSm}>{lastGiftDate}</span>
                </div>

                {donor.hasActivePledge && donor.pledgeTotal && (
                  <div className={styles.pledgeContainer}>
                    <div className={styles.pledgeHeader}>
                      <span className={styles.pledgeLabel}>Active Pledge</span>
                      <span className={styles.pledgeAmount}>
                        {formatCurrency(donor.pledgeTotal - donor.pledgePaid)} remaining
                      </span>
                    </div>
                    <div className={styles.mt2}>
                      <div className={styles.pledgeBar}>
                        <div 
                          className={styles.pledgeFill}
                          style={{ width: `${pledgePercentage}%` }}
                        />
                      </div>
                      <p className={styles.pledgeText}>
                        {formatCurrency(donor.pledgePaid)} of {formatCurrency(donor.pledgeTotal)}
                      </p>
                    </div>
                  </div>
                )}

                {donor.interests && donor.interests.length > 0 && (
                  <div className={styles.interestsContainer}>
                    <span className={styles.interestsLabel}>Interests</span>
                    <div className={styles.interestsList}>
                      {donor.interests.slice(0, 3).map((interest, index) => (
                        <span
                          key={index}
                          className={styles.interestTag}
                        >
                          {interest}
                        </span>
                      ))}
                      {donor.interests.length > 3 && (
                        <span className={styles.moreTags}>
                          +{donor.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.viewProfile}>
                <button className={styles.viewProfileButton}>
                  View Profile →
                </button>
              </div>
            </Link>
          )
        })}
      </div>

      {filteredDonors.length === 0 && (
        <div className={styles.emptyState}>
          <UserCircleIcon className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No donors found</h3>
          <p className={styles.emptyDescription}>
            {search ? 'Try adjusting your search terms' : 'Get started by adding your first donor'}
          </p>
          <Link
            href="/donors/new"
            className={styles.addDonorButton}
          >
            <PlusIcon className={styles.addDonorIcon} />
            Add First Donor
          </Link>
        </div>
      )}
    </div>
  )
}