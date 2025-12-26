'use client'

import { useState } from 'react'
import { ChevronRightIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '@/utils/formatCurrency'
import dateHelpers from '@/utils/dateHelpers'
import { useDonations } from '@/app/hooks/usedonation'
import './DonationHistory.css'

export default function DonationHistory({ donorId }) {
  const [showAll, setShowAll] = useState(false)
  const { donations, loading, error } = useDonations(donorId)

  const displayDonations = showAll ? donations : donations.slice(0, 5)

  const getTypeBadge = (type) => {
    const colors = {
      ONE_TIME: 'donation-type-one-time',
      PLEDGE_PAYMENT: 'donation-type-pledge',
      RECURRING: 'donation-type-recurring',
      MATCHING: 'donation-type-matching',
    }
    return colors[type] || 'donation-type-default'
  }

  const getStatusBadge = (status) => {
    const colors = {
      COMPLETED: 'donation-status-completed',
      PENDING: 'donation-status-pending',
      FAILED: 'donation-status-failed',
      REFUNDED: 'donation-status-refunded',
    }
    return colors[status] || 'donation-status-default'
  }

  const calculateYearlyTotal = () => {
    const currentYear = new Date().getFullYear()
    return donations
      .filter(d => new Date(d.date).getFullYear() === currentYear)
      .reduce((sum, d) => sum + d.amount, 0)
  }

  if (loading) {
    return (
      <div className="donation-history-card">
        <div className="donation-history-loading">
          <div className="donation-history-loading-title"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="donation-history-loading-item"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="donation-history-card">
        <p className="donation-history-error">Failed to load donations: {error}</p>
      </div>
    )
  }

  return (
    <div className="donation-history-card">
      <div className="donation-history-header">
        <div>
          <h3 className="donation-history-title">Donation History</h3>
          <p className="donation-history-subtitle">
            {donations.length} total gifts • {formatCurrency(calculateYearlyTotal())} this year
          </p>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="donation-history-view-btn"
        >
          {showAll ? 'Show Less' : 'View All'}
          <ChevronRightIcon className="donation-history-view-icon" />
        </button>
      </div>

      {displayDonations.length === 0 ? (
        <div className="donation-history-empty">
          <CalendarIcon className="donation-history-empty-icon" />
          <p className="donation-history-empty-text">No donations recorded yet</p>
        </div>
      ) : (
        <div className="donation-history-list">
          {displayDonations.map((donation) => (
            <div key={donation.id} className="donation-history-item">
              <div className="donation-history-item-left">
                <div className="donation-history-amount-circle">
                  <span className="donation-history-amount-number">
                    {formatCurrency(donation.amount, 0).replace('$', '')}
                  </span>
                </div>
                <div className="donation-history-item-details">
                  <div className="donation-history-item-header">
                    <p className="donation-history-campaign">
                      {donation.campaign?.name || 'General Fund'}
                    </p>
                    <span className={`donation-badge ${getTypeBadge(donation.type)}`}>
                      {donation.type.replace('_', ' ')}
                    </span>
                    <span className={`donation-badge ${getStatusBadge(donation.status)}`}>
                      {donation.status}
                    </span>
                  </div>
                  <div className="donation-history-item-meta">
                    <span className="donation-history-meta-item">
                      <CalendarIcon className="donation-history-meta-icon" />
                      {dateHelpers.formatDate(donation.date, 'MMM d, yyyy')}
                    </span>
                    {donation.paymentMethod && (
                      <span className="donation-history-meta-item">
                        <TagIcon className="donation-history-meta-icon" />
                        {donation.paymentMethod.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="donation-history-item-right">
                <p className="donation-history-item-amount">
                  {formatCurrency(donation.amount)}
                </p>
                {donation.netAmount && donation.netAmount !== donation.amount && (
                  <p className="donation-history-net-amount">
                    Net: {formatCurrency(donation.netAmount)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {donations.length > 0 && (
        <div className="donation-history-stats">
          <div className="donation-history-stat">
            <p className="donation-history-stat-number">{donations.length}</p>
            <p className="donation-history-stat-label">Total Gifts</p>
          </div>
          <div className="donation-history-stat">
            <p className="donation-history-stat-number">
              {formatCurrency(donations.reduce((sum, d) => sum + d.amount, 0), 0)}
            </p>
            <p className="donation-history-stat-label">Lifetime Value</p>
          </div>
          <div className="donation-history-stat">
            <p className="donation-history-stat-number">
              {formatCurrency(
                donations.reduce((sum, d) => sum + d.amount, 0) / donations.length,
                0
              )}
            </p>
            <p className="donation-history-stat-label">Average Gift</p>
          </div>
          <div className="donation-history-stat">
            <p className="donation-history-stat-number">
              {calculateYearlyTotal() > 0 ? '✅' : '❌'}
            </p>
            <p className="donation-history-stat-label">Given This Year</p>
          </div>
        </div>
      )}
    </div>
  )
}
