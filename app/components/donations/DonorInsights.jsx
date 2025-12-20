'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts'

export default function DonorInsights({ donor }) {
  const [timeframe, setTimeframe] = useState('year')

  // Calculate insights from donor data
  const donationsByMonth = processDonationsByTime(donor.donations, timeframe)
  const givingFrequency = calculateGivingFrequency(donor.donations)
  const campaignPreferences = getCampaignPreferences(donor.donations)
  const communicationHistory = donor.communications || []

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Maximized Donor Insights
      </h2>
      
      <div className="space-y-6">
        {/* Giving Patterns */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Giving Patterns</h3>
            <div className="flex space-x-2">
              {['month', 'quarter', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    timeframe === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Donations']} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg Gift Size</p>
            <p className="text-xl font-bold">
              ${givingFrequency.averageGift.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Recency</p>
            <p className="text-xl font-bold">
              {givingFrequency.daysSinceLast} days
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Giving Streak</p>
            <p className="text-xl font-bold">
              {givingFrequency.currentStreak} months
            </p>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Preferred Method</p>
            <p className="text-xl font-bold">
              {givingFrequency.preferredMethod || 'N/A'}
            </p>
          </div>
        </div>

        {/* Campaign Preferences */}
        {campaignPreferences.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Campaign Preferences</h3>
            <div className="space-y-2">
              {campaignPreferences.map((campaign) => (
                <div key={campaign.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{campaign.name}</span>
                  <span className="text-blue-600 font-semibold">
                    ${campaign.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Communication Summary */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Recent Communications</h3>
          <div className="space-y-2">
            {communicationHistory.slice(0, 5).map((comm) => (
              <div key={comm.id} className="flex items-center p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  comm.status === 'SENT' ? 'bg-green-500' :
                  comm.status === 'OPENED' ? 'bg-blue-500' :
                  'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="font-medium">{comm.type}</p>
                  <p className="text-sm text-gray-600">{comm.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(comm.sentAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{comm.direction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function processDonationsByTime(donations, timeframe) {
  // Implementation for grouping donations by timeframe
  return []
}

function calculateGivingFrequency(donations) {
  // Implementation for calculating giving patterns
  return {
    averageGift: 0,
    daysSinceLast: 0,
    currentStreak: 0,
    preferredMethod: ''
  }
}

function getCampaignPreferences(donations) {
  // Implementation for campaign analysis
  return []
}