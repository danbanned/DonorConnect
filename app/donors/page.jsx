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

import { getDonors, getLYBUNTDonors } from '../../lib/api/donors'
import { useDonations } from '../hooks/usedonation'
import styles from './donors.module.css'

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
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // 2️⃣ Batch donation hook (LEGAL)
  const donorIds = useMemo(() => donors.map(d => d.id), [donors])
  const { donationsByDonor, loading: donationsLoading } = useDonations({ 
  donorIds,
  limit: 100, // Increase limit to get all donations
  timeframe: 'all' // Get all time donations, not just 30 days
});



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

      return {
        ...donor,
        totalGiven,
        giftsCount,
        lastGiftDate,
      }
    })
  }, [donors, donationsByDonor])

  // 4️⃣ Filtering
  const filteredDonors = donorsWithStats.filter((donor) => {
    const searchLower = search.toLowerCase()

    if (search) {
      const match =
        donor.firstName.toLowerCase().includes(searchLower) ||
        donor.lastName.toLowerCase().includes(searchLower) ||
        donor.email?.toLowerCase().includes(searchLower)

      if (!match) return false
    }

    switch (selectedFilter) {
      case 'active':
        return donor.status === 'ACTIVE'
      case 'lybunt':
        return lybuntDonors.some(d => d.id === donor.id)
      case 'major':
        return donor.totalGiven >= 10000
      default:
        return true
    }
  })

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)

  if (loading || donationsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    )
  }

  return (
    <div className={styles.donorsContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Donors</h1>
          <p className={styles.pageDescription}>
            Managing {filteredDonors.length} donors
          </p>
        </div>

        <Link href="/donors/new" className={styles.addDonorButton}>
          <PlusIcon className={styles.addDonorIcon} />
          Add Donor
        </Link>
      </div>

      {/* Search */}
      <div className={styles.filtersCard}>
        <div className={styles.searchContainer}>
          <MagnifyingGlassIcon className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search donors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Donor Grid */}
      <div className={styles.donorsGrid}>
        {filteredDonors.map((donor) => (
          <Link
            key={donor.id}
            href={`/donors/${donor.id}`}
            className={styles.donorCard}
          >
            <div className={styles.donorHeader}>
              <UserCircleIcon className={styles.avatarIcon} />
              <div>
                <h3>{donor.firstName} {donor.lastName}</h3>
                <p className={styles.donorEmail}>{donor.email}</p>
              </div>
            </div>

            <div className={styles.donorStats}>
              <div className={styles.statRow}>
                <CurrencyDollarIcon className={styles.statIcon} />
                <span>{formatCurrency(donor.totalGiven)}</span>
              </div>

              <div className={styles.statRow}>
                <CalendarIcon className={styles.statIcon} />
                <span>
                  {donor.lastGiftDate
                    ? donor.lastGiftDate.toLocaleDateString()
                    : 'Never'}
                </span>
              </div>

              <p className={styles.textSm}>
                Gifts: {donor.giftsCount}
              </p>
            </div>

            <div className={styles.viewProfile}>
              View Profile →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
