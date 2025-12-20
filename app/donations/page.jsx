'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline'
import { useDonations } from '@/lib/api/hooks/usedonation'
import styles from './donations.module.css'

export default function DonationsPage() {
  const [search, setSearch] = useState('')
  const [timeframe, setTimeframe] = useState('30days')
  const { donations, summary, pagination, loading, error } = useDonations({ timeframe })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED': return styles.statusCompleted
      case 'PENDING': return styles.statusPending
      case 'FAILED': return styles.statusFailed
      default: return styles.statusDefault
    }
  }

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
    </div>
  )

  if (error) return (
    <div className={styles.errorMessage}>
      <p>Error loading donations: {error}</p>
    </div>
  )

  return (
    <div className={styles.donationsPage}>
      {/* Header */}
      <div className={styles.donationsHeader}>
        <div>
          <h1 className={styles.donationsTitle}>Donations</h1>
          <p className={styles.donationsDescription}>
            Track and manage all donations {summary && `(${formatCurrency(summary.total)})`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/recorddonorpage" className={styles.primaryButton}>
            <PlusIcon className={styles.buttonIcon} />
            Record Donation
          </Link>
          <Link href="/donations/reports" className={styles.secondaryButton}>
            <ChartBarIcon className={styles.buttonIcon} />
            Reports
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className={styles.summaryStats}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Received</p>
            <p className={styles.statValue}>
              {formatCurrency(summary.total)}
            </p>
            <p className={`${styles.statGrowth} ${styles.positive}`}>
              +{summary.growth}% from last period
            </p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Average Gift</p>
            <p className={styles.statValue}>
              {formatCurrency(summary.average)}
            </p>
            <p className={`${styles.statGrowth} ${styles.neutral}`}>
              {summary.count} total gifts
            </p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Recurring</p>
            <p className={styles.statValue}>
              {formatCurrency(summary.recurring)}
            </p>
            <p className={`${styles.statGrowth} ${styles.neutral}`}>
              {summary.recurringCount} active subscriptions
            </p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>LYBUNT Impact</p>
            <p className={styles.statValue}>
              {formatCurrency(summary.lybuntValue)}
            </p>
            <p className={`${styles.statGrowth} ${styles.negative}`}>
              {summary.lybuntCount} at-risk donors
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.searchBox}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search donations by donor name, amount, or campaign..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterControls}>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className={styles.timeframeSelect}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="year">This year</option>
              <option value="all">All time</option>
            </select>
            <button className={styles.secondaryButton}>
              <FunnelIcon className={styles.buttonIcon} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className={styles.donationsTableSection}>
        <div className={styles.tableWrapper}>
          <table className={styles.donationsTable}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Donor</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Campaign</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td className={styles.donorCell}>
                    <div>
                      <div className={styles.donorName}>
                        {donation.donor?.firstName} {donation.donor?.lastName}
                      </div>
                      <div className={styles.donorEmail}>
                        {donation.donor?.email}
                      </div>
                    </div>
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(donation.date).toLocaleDateString()}
                  </td>
                  <td className={styles.amountCell}>
                    {formatCurrency(donation.amount)}
                  </td>
                  <td className={styles.campaignCell}>
                    {donation.campaign?.name || 'General Fund'}
                  </td>
                  <td className={styles.typeCell}>
                    {donation.type.replace('_', ' ')}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(donation.status)}`}>
                      {donation.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionLinks}>
                      <Link
                        href={`/donations/${donation.id}`}
                        className={`${styles.actionLink} ${styles.actionLinkView}`}
                      >
                        View
                      </Link>
                      <Link
                        href={`/communications/new?donationId=${donation.id}`}
                        className={`${styles.actionLink} ${styles.actionLinkThank}`}
                      >
                        Thank
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {donations.length === 0 && (
          <div className={styles.emptyState}>
            <ReceiptPercentIcon className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No donations found</h3>
            <p className={styles.emptyDescription}>
              Record your first donation to get started
            </p>
            <Link href="/recorddonorpage" className={styles.primaryButton}>
              <PlusIcon className={styles.buttonIcon} />
              Record First Donation
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
