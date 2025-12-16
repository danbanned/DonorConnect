'use client'

import { useState, useEffect } from 'react'
import { ChevronRightIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '@/utils/formatCurrency'
import { dateHelpers } from '@/utils/dateHelpers'
import { getDonationsByDonor } from '@/lib/donations'

export default function DonationHistory({ donorId }) {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function loadDonations() {
      try {
        const data = await getDonationsByDonor(donorId)
        setDonations(data)
      } catch (error) {
        console.error('Failed to load donations:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDonations()
  }, [donorId])

  const displayDonations = showAll ? donations : donations.slice(0, 5)

  const getTypeBadge = (type) => {
    const colors = {
      ONE_TIME: 'bg-blue-100 text-blue-800',
      PLEDGE_PAYMENT: 'bg-green-100 text-green-800',
      RECURRING: 'bg-purple-100 text-purple-800',
      MATCHING: 'bg-yellow-100 text-yellow-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status) => {
    const colors = {
      COMPLETED: 'badge-success',
      PENDING: 'badge-warning',
      FAILED: 'badge-danger',
      REFUNDED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const calculateYearlyTotal = () => {
    const currentYear = new Date().getFullYear()
    return donations
      .filter(d => new Date(d.date).getFullYear() === currentYear)
      .reduce((sum, d) => sum + d.amount, 0)
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Donation History</h3>
          <p className="text-sm text-gray-600 mt-1">
            {donations.length} total gifts • {formatCurrency(calculateYearlyTotal())} this year
          </p>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
        >
          {showAll ? 'Show Less' : 'View All'}
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </button>
      </div>

      {displayDonations.length === 0 ? (
        <div className="text-center py-8">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-2">No donations recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayDonations.map((donation) => (
            <div
              key={donation.id}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                  <span className="font-bold text-gray-900">
                    {formatCurrency(donation.amount, 0).replace('$', '')}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {donation.campaign?.name || 'General Fund'}
                    </p>
                    <span className={`badge ${getTypeBadge(donation.type)}`}>
                      {donation.type.replace('_', ' ')}
                    </span>
                    <span className={`badge ${getStatusBadge(donation.status)}`}>
                      {donation.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {dateHelpers.formatDate(donation.date, 'MMM d, yyyy')}
                    </span>
                    {donation.paymentMethod && (
                      <span className="flex items-center gap-1">
                        <TagIcon className="h-4 w-4" />
                        {donation.paymentMethod.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-lg">
                  {formatCurrency(donation.amount)}
                </p>
                {donation.netAmount && donation.netAmount !== donation.amount && (
                  <p className="text-sm text-gray-500">
                    Net: {formatCurrency(donation.netAmount)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {donations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{donations.length}</p>
            <p className="text-sm text-gray-600">Total Gifts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(donations.reduce((sum, d) => sum + d.amount, 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Lifetime Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                donations.reduce((sum, d) => sum + d.amount, 0) / donations.length,
                0
              )}
            </p>
            <p className="text-sm text-gray-600">Average Gift</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {calculateYearlyTotal() > 0 ? '✅' : '❌'}
            </p>
            <p className="text-sm text-gray-600">Given This Year</p>
          </div>
        </div>
      )}
    </div>
  )
}