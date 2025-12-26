'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

import { getDonors, getLYBUNTDonors } from '@/lib/api/donors'
import { useDonations } from '@/app/hooks/usedonation'
import styles from './donations.module.css'

const filters = [
  { id: 'all', name: 'All Donors' },
  { id: 'active', name: 'Active' },
  { id: 'lybunt', name: 'LYBUNT' },
  { id: 'major', name: 'Major Donors' },
]

export default function DonorsPage() {
  const [donors, setDonors] = useState([])
  const [lybuntDonors, setLybuntDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // 1️⃣ Load donors
  useEffect(() => {
    async function load() {
      try {
        const donorData = await getDonors()
        const lybunt = await getLYBUNTDonors()
        setDonors(donorData)
        setLybuntDonors(lybunt)
      } catch (err) {
        console.error('Failed to load donors:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // 2️⃣ Batch donation hook - use donorIds parameter
  const donorIds = useMemo(() => donors.map(d => d.id), [donors])
  const { donationsByDonor, loading: donationsLoading } = useDonations({ 
    donorIds,
    timeframe: 'all' // Get all donations for accurate totals
  })

  // 3️⃣ Attach derived stats
  const donorsWithStats = useMemo(() => {
    return donors.map((donor) => {
      const donations = donationsByDonor?.[donor.id] || []

      const totalGiven = donations.reduce(
        (sum, d) => sum + (d.amount || 0),
        0
      )

      const giftsCount = donations.length

      const lastGiftDate =
        donations.length > 0
          ? new Date(
              Math.max(...donations.map(d => new Date(d.date)))
            )
          : null

      const lastGiftAmount = donations.length > 0
        ? donations.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.amount || 0
        : 0

      const averageGift = giftsCount > 0 ? totalGiven / giftsCount : 0

      return {
        ...donor,
        totalGiven,
        giftsCount,
        lastGiftDate,
        lastGiftAmount,
        averageGift,
        isLYBUNT: lybuntDonors.some(d => d.id === donor.id),
      }
    })
  }, [donors, donationsByDonor, lybuntDonors])

  // 4️⃣ Filtering
  const filteredDonors = donorsWithStats.filter((donor) => {
    const searchLower = search.toLowerCase()

    if (search) {
      const match =
        donor.firstName?.toLowerCase().includes(searchLower) ||
        donor.lastName?.toLowerCase().includes(searchLower) ||
        donor.email?.toLowerCase().includes(searchLower) ||
        donor.phone?.toLowerCase().includes(searchLower)

      if (!match) return false
    }

    switch (selectedFilter) {
      case 'active':
        return donor.status === 'ACTIVE'
      case 'lybunt':
        return donor.isLYBUNT
      case 'major':
        return donor.totalGiven >= 10000
      default:
        return true
    }
  })

  // 5️⃣ Sort by total given (highest first)
  const sortedDonors = [...filteredDonors].sort((a, b) => b.totalGiven - a.totalGiven)

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDate = (date) => {
    if (!date) return 'Never'
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading || donationsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading donors...</p>
      </div>
    )
  }

  return (
    <div className={styles.donorsContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Donations</h1>
          <p className={styles.pageDescription}>
            Managing {filteredDonors.length} {filteredDonors.length === 1 ? 'donor' : 'donors'}
          </p>
        </div>

        <Link href="/donors/new" className={styles.addDonorButton}>
          <PlusIcon className={styles.addDonorIcon} />
          Add Donor
        </Link>
      </div>

      {/* Search and Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.searchContainer}>
          <MagnifyingGlassIcon className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search donors by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className={styles.filterButtons}>
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`${styles.filterButton} ${
                selectedFilter === filter.id ? styles.filterButtonActive : ''
              }`}
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.statsSummary}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {formatCurrency(donorsWithStats.reduce((sum, donor) => sum + donor.totalGiven, 0))}
          </div>
          <div className={styles.statLabel}>Total Given</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {donorsWithStats.reduce((sum, donor) => sum + donor.giftsCount, 0)}
          </div>
          <div className={styles.statLabel}>Total Gifts</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {lybuntDonors.length}
          </div>
          <div className={styles.statLabel}>LYBUNT Donors</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {donorsWithStats.filter(d => d.totalGiven >= 10000).length}
          </div>
          <div className={styles.statLabel}>Major Donors</div>
        </div>
      </div>

      {/* Donor Grid */}
      <div className={styles.donorsGrid}>
        {sortedDonors.map((donor) => (
          <Link
            key={donor.id}
            href={`/donors/${donor.id}`}
            className={styles.donorCard}
          >
            <div className={styles.donorHeader}>
              <div className={styles.avatarContainer}>
                <UserCircleIcon className={styles.avatarIcon} />
                {donor.totalGiven >= 10000 && (
                  <div className={styles.majorDonorBadge}>Major Donor</div>
                )}
                {donor.isLYBUNT && (
                  <div className={styles.lybuntBadge}>LYBUNT</div>
                )}
              </div>
              <div className={styles.donorInfo}>
                <h3 className={styles.donorName}>
                  {donor.firstName} {donor.lastName}
                </h3>
                <p className={styles.donorEmail}>{donor.email}</p>
                {donor.phone && (
                  <p className={styles.donorPhone}>{donor.phone}</p>
                )}
                <div className={styles.donorStatus}>
                  <span className={`${styles.statusBadge} ${
                    donor.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                  }`}>
                    {donor.status}
                  </span>
                  <span className={styles.relationshipStage}>
                    {donor.relationshipStage?.replace('_', ' ') || 'NEW'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.donorStats}>
              <div className={styles.statRow}>
                <CurrencyDollarIcon className={styles.statIcon} />
                <div>
                  <div className={styles.statValue}>{formatCurrency(donor.totalGiven)}</div>
                  <div className={styles.statLabel}>Total Given</div>
                </div>
              </div>

              <div className={styles.statRow}>
                <CalendarIcon className={styles.statIcon} />
                <div>
                  <div className={styles.statValue}>
                    {formatDate(donor.lastGiftDate)}
                  </div>
                  <div className={styles.statLabel}>Last Gift</div>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.smallStat}>
                  <div className={styles.smallStatValue}>{donor.giftsCount}</div>
                  <div className={styles.smallStatLabel}>Gifts</div>
                </div>
                <div className={styles.smallStat}>
                  <div className={styles.smallStatValue}>
                    {formatCurrency(donor.averageGift)}
                  </div>
                  <div className={styles.smallStatLabel}>Avg. Gift</div>
                </div>
              </div>
            </div>

            <div className={styles.viewProfile}>
              View Profile →
            </div>
          </Link>
        ))}
      </div>

      {sortedDonors.length === 0 && (
        <div className={styles.emptyState}>
          <UserCircleIcon className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No donors found</h3>
          <p className={styles.emptyDescription}>
            {search || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Add your first donor to get started'
            }
          </p>
          {!search && selectedFilter === 'all' && (
            <Link href="/donors/new" className={styles.primaryButton}>
              <PlusIcon className={styles.buttonIcon} />
              Add First Donor
            </Link>
          )}
        </div>
      )}
    </div>
  )
}