'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserIcon,
  CalendarIcon,
  TagIcon,
  CreditCardIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/utils/formatCurrency'

export default function DonationForm({ donor }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    donorId: donor?.id || '',
    amount: donor?.lastDonation?.amount || 100,
    campaignId: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CREDIT_CARD',
    type: 'ONE_TIME',
    isRecurring: false,
    notes: '',
    isTribute: false,
    tributeName: '',
    tributeType: 'HONOR'
  })

  const campaigns = [
    { id: 'annual', name: 'Annual Fund 2024' },
    { id: 'scholarship', name: 'Scholarship Fund' },
    { id: 'capital', name: 'Capital Campaign' },
    { id: 'general', name: 'General Fund' },
  ]

  const paymentMethods = [
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CHECK', label: 'Check' },
    { value: 'CASH', label: 'Cash' },
    { value: 'STOCK', label: 'Stock' },
  ]

  const donationTypes = [
    { value: 'ONE_TIME', label: 'One-time' },
    { value: 'PLEDGE_PAYMENT', label: 'Pledge Payment' },
    { value: 'RECURRING', label: 'Recurring' },
    { value: 'MATCHING', label: 'Matching Gift' },
  ]

  const tributeTypes = [
    { value: 'HONOR', label: 'In Honor Of' },
    { value: 'MEMORIAL', label: 'In Memory Of' },
    { value: 'CELEBRATION', label: 'Celebration' },
  ]

  const suggestedAmounts = [50, 100, 250, 500, 1000]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/donations/${data.id}`)
      } else {
        throw new Error('Failed to create donation')
      }
    } catch (error) {
      console.error('Error creating donation:', error)
      alert('Failed to create donation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (amount) => {
    setFormData({ ...formData, amount })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Record New Donation</h2>
          <p className="text-gray-600 mt-2">
            {donor ? `Recording donation for ${donor.firstName} ${donor.lastName}` : 'Select a donor to record donation'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donor Selection */}
          {!donor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-5 w-5 inline mr-2" />
                Select Donor
              </label>
              <select
                value={formData.donorId}
                onChange={(e) => setFormData({...formData, donorId: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a donor...</option>
                <option value="donor-1">John Smith</option>
                <option value="donor-2">Sarah Johnson</option>
                <option value="donor-3">Robert Chen</option>
              </select>
            </div>
          )}

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BuildingLibraryIcon className="h-5 w-5 inline mr-2" />
              Donation Amount
            </label>
            
            <div className="mb-4">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-2xl font-bold"
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAmountChange(amount)}
                  className={`px-4 py-2 rounded-lg border ${
                    formData.amount === amount
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TagIcon className="h-5 w-5 inline mr-2" />
              Campaign
            </label>
            <select
              value={formData.campaignId}
              onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a campaign (optional)</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-5 w-5 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {donationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCardIcon className="h-5 w-5 inline mr-2" />
              Payment Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: method.value})}
                  className={`p-3 rounded-lg border ${
                    formData.paymentMethod === method.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tribute Information */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="isTribute"
                checked={formData.isTribute}
                onChange={(e) => setFormData({...formData, isTribute: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="isTribute" className="font-medium text-gray-700">
                This is a tribute donation
              </label>
            </div>

            {formData.isTribute && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tribute Type
                  </label>
                  <select
                    value={formData.tributeType}
                    onChange={(e) => setFormData({...formData, tributeType: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    {tributeTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tribute Name
                  </label>
                  <input
                    type="text"
                    value={formData.tributeName}
                    onChange={(e) => setFormData({...formData, tributeName: e.target.value})}
                    placeholder="Name of person being honored"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add any notes about this donation..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Record Donation'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Stats */}
      {donor && (
        <div className="card mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Donor Giving Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(donor.totalGiven || 0)}
              </p>
              <p className="text-sm text-gray-600">Total Given</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {donor.giftsCount || 0}
              </p>
              <p className="text-sm text-gray-600">Total Gifts</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {donor.lastDonation ? formatCurrency(donor.lastDonation.amount) : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Last Gift</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {donor.avgGift ? formatCurrency(donor.avgGift) : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Average Gift</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}