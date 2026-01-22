'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Legend, Cell, PieChart, Pie
} from 'recharts'

export default function DonorInsights({ donor }) {
  const [timeframe, setTimeframe] = useState('year')
  const [insights, setInsights] = useState(null)

  useEffect(() => {
    console.log('🎯 DonorInsights Component - Received donor data:')
    console.log('  - Donor ID:', donor?.id)
    console.log('  - Donor Name:', donor?.firstName, donor?.lastName)
    console.log('  - Donation Count:', donor?.donationCount)
    console.log('  - Total Donations:', donor?.totalDonations)
    console.log('  - Relationship Stage:', donor?.relationshipStage)
    console.log('  - Communications Count:', donor?.communications?.length)
    console.log('  - Activities Count:', donor?.activities?.length)
    
    if (donor?.donations) {
      console.log('  - Donations sample:', donor.donations.slice(0, 2))
    }
  }, [donor])

  // Calculate insights from donor data
  const donationsByMonth = processDonationsByTime(donor?.donations || [], timeframe)
  const givingFrequency = calculateGivingFrequency(donor?.donations || [])
  const campaignPreferences = getCampaignPreferences(donor?.donations || [])
  const communicationHistory = donor?.communications || []
  
  // Get giving patterns analysis
  const givingPatterns = analyzeGivingPatterns(donor?.donations || [])
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Donor Insights & Analytics
      </h2>
      
      <div className="space-y-6">
        {/* Giving Patterns Chart */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Giving Patterns Over Time</h3>
            <div className="flex space-x-2">
              {['month', 'quarter', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    timeframe === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64">
            {donationsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Amount']}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="amount" 
                    name="Donation Amount" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Number of Donations" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No donation data available for the selected timeframe
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg Gift Size</p>
            <p className="text-xl font-bold">
              ${givingFrequency.averageGift?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Based on {givingFrequency.totalDonations || 0} donations
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Days Since Last</p>
            <p className="text-xl font-bold">
              {givingFrequency.daysSinceLast || '0'} days
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {givingFrequency.daysSinceLast === 0 ? 'Today' : 
               givingFrequency.daysSinceLast < 7 ? 'This week' : 
               givingFrequency.daysSinceLast < 30 ? 'This month' : 'Long time'}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Giving Streak</p>
            <p className="text-xl font-bold">
              {givingFrequency.currentStreak || '0'} months
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Consecutive months with donations
            </p>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Preferred Method</p>
            <p className="text-xl font-bold capitalize">
              {givingFrequency.preferredMethod?.toLowerCase() || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Most used payment method
            </p>
          </div>
        </div>

        {/* Giving Pattern Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Giving Pattern Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Pattern:</span>
                <span className="font-medium">{givingPatterns.pattern}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Days Between:</span>
                <span className="font-medium">{givingPatterns.avgDaysBetween} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Consistency:</span>
                <span className="font-medium">{givingPatterns.consistency}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trend:</span>
                <span className="font-medium capitalize">{givingPatterns.trend}</span>
              </div>
            </div>
          </div>

          {/* Campaign Preferences */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Campaign Preferences</h3>
            {campaignPreferences.length > 0 ? (
              <div className="space-y-2">
                {campaignPreferences.slice(0, 3).map((campaign, index) => (
                  <div key={campaign.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                    <div>
                      <span className="font-medium block">{campaign.name}</span>
                      <span className="text-sm text-gray-500">
                        {campaign.count} donation{campaign.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-blue-600 font-semibold">
                      ${campaign.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No campaign-specific donations
              </div>
            )}
          </div>
        </div>

        {/* Communication Summary */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Recent Communications</h3>
          {communicationHistory.length > 0 ? (
            <div className="space-y-2">
              {communicationHistory.slice(0, 5).map((comm) => (
                <div key={comm.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    comm.status === 'SENT' ? 'bg-green-500' :
                    comm.status === 'OPENED' ? 'bg-blue-500' :
                    comm.status === 'FAILED' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium capitalize">{comm.type?.toLowerCase()}</p>
                    <p className="text-sm text-gray-600">{comm.subject || 'No subject'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(comm.sentAt || comm.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{comm.direction || 'outbound'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 border rounded-lg">
              No communications yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions for DonorInsights.js

function processDonationsByTime(donations, timeframe) {
  if (!donations || donations.length === 0) {
    console.log('No donations to process')
    return []
  }
  
  console.log(`Processing ${donations.length} donations for timeframe: ${timeframe}`)
  
  const now = new Date()
  let groups = []
  
  if (timeframe === 'month') {
    // Last 12 months of data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      const year = date.getFullYear()
      const month = date.getMonth()
      
      // Filter donations for this specific month/year
      const monthDonations = donations.filter(d => {
        const dDate = new Date(d.date)
        return dDate.getMonth() === month && dDate.getFullYear() === year
      })
      
      const totalAmount = monthDonations.reduce((sum, d) => sum + d.amount, 0)
      
      groups.push({
        period: `${monthName} ${year}`,
        amount: totalAmount,
        count: monthDonations.length,
        month: month,
        year: year
      })
    }
  } 
  else if (timeframe === 'quarter') {
    // Last 4 quarters
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1
    const currentYear = now.getFullYear()
    
    for (let i = 3; i >= 0; i--) {
      let quarter = currentQuarter - i
      let year = currentYear
      
      // Adjust for negative quarters (previous year)
      if (quarter <= 0) {
        quarter += 4
        year -= 1
      }
      
      // Calculate month range for this quarter
      const startMonth = (quarter - 1) * 3
      const endMonth = startMonth + 2
      
      const quarterDonations = donations.filter(d => {
        const dDate = new Date(d.date)
        const dMonth = dDate.getMonth()
        const dYear = dDate.getFullYear()
        return dYear === year && dMonth >= startMonth && dMonth <= endMonth
      })
      
      const totalAmount = quarterDonations.reduce((sum, d) => sum + d.amount, 0)
      
      groups.push({
        period: `Q${quarter} ${year}`,
        amount: totalAmount,
        count: quarterDonations.length,
        quarter: quarter,
        year: year
      })
    }
  } 
  else { // 'year' - default
    // Last 5 years
    const currentYear = now.getFullYear()
    
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i
      
      const yearDonations = donations.filter(d => {
        const dDate = new Date(d.date)
        return dDate.getFullYear() === year
      })
      
      const totalAmount = yearDonations.reduce((sum, d) => sum + d.amount, 0)
      
      groups.push({
        period: year.toString(),
        amount: totalAmount,
        count: yearDonations.length,
        year: year
      })
    }
  }
  
  console.log('Processed donation groups:', groups)
  return groups
}

function calculateGivingFrequency(donations) {
  if (!donations || donations.length === 0) {
    console.log('No donations for frequency calculation')
    return {
      averageGift: 0,
      daysSinceLast: 0,
      currentStreak: 0,
      preferredMethod: 'None'
    }
  }
  
  console.log(`Calculating giving frequency for ${donations.length} donations`)
  
  // Calculate average gift
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
  const averageGift = Math.round(totalAmount / donations.length)
  
  // Calculate days since last donation
  const sortedDonations = [...donations].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )
  const lastDonation = sortedDonations[0]
  const lastDonationDate = new Date(lastDonation.date)
  const daysSinceLast = Math.floor((new Date() - lastDonationDate) / (1000 * 60 * 60 * 24))
  
  // Calculate giving streak (consecutive months with donations)
  const donationsByMonth = {}
  
  donations.forEach(d => {
    const date = new Date(d.date)
    const year = date.getFullYear()
    const month = date.getMonth()
    const key = `${year}-${month.toString().padStart(2, '0')}`
    
    if (!donationsByMonth[key]) {
      donationsByMonth[key] = {
        count: 0,
        total: 0,
        date: date
      }
    }
    donationsByMonth[key].count += 1
    donationsByMonth[key].total += d.amount
  })
  
  // Sort months chronologically
  const monthKeys = Object.keys(donationsByMonth).sort()
  console.log('Monthly donation keys:', monthKeys)
  
  let currentStreak = 0
  let maxStreak = 0
  
  for (let i = 0; i < monthKeys.length; i++) {
    if (i === 0) {
      currentStreak = 1
    } else {
      const prevKey = monthKeys[i - 1]
      const currKey = monthKeys[i]
      
      // Parse year and month from keys
      const [prevYear, prevMonth] = prevKey.split('-').map(Number)
      const [currYear, currMonth] = currKey.split('-').map(Number)
      
      // Calculate month difference
      const monthDiff = (currYear - prevYear) * 12 + (currMonth - prevMonth)
      
      if (monthDiff === 1) {
        // Consecutive months
        currentStreak++
      } else {
        // Break in streak
        currentStreak = 1
      }
    }
    
    maxStreak = Math.max(maxStreak, currentStreak)
  }
  
  // Find preferred payment method
  const methodCounts = {}
  donations.forEach(d => {
    const method = d.paymentMethod || 'UNKNOWN'
    methodCounts[method] = (methodCounts[method] || 0) + 1
  })
  
  const preferredMethod = Object.entries(methodCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
  
  console.log('Giving frequency results:', {
    averageGift,
    daysSinceLast,
    currentStreak: maxStreak,
    preferredMethod,
    methodCounts
  })
  
  return {
    averageGift,
    daysSinceLast,
    currentStreak: maxStreak,
    preferredMethod,
    totalDonations: donations.length,
    totalAmount
  }
}

function getCampaignPreferences(donations) {
  if (!donations || donations.length === 0) {
    console.log('No donations for campaign preferences')
    return []
  }
  
  console.log(`Analyzing campaign preferences for ${donations.length} donations`)
  
  const campaignMap = {}
  
  // Group donations by campaign
  donations.forEach(donation => {
    const campaignId = donation.campaignId || 'no-campaign'
    const campaignName = donation.campaign?.name || 'General Donation'
    
    if (!campaignMap[campaignId]) {
      campaignMap[campaignId] = {
        id: campaignId,
        name: campaignName,
        total: 0,
        count: 0,
        lastDonation: new Date(donation.date)
      }
    }
    
    campaignMap[campaignId].total += donation.amount
    campaignMap[campaignId].count += 1
    
    // Update last donation date if newer
    const donationDate = new Date(donation.date)
    if (donationDate > new Date(campaignMap[campaignId].lastDonation)) {
      campaignMap[campaignId].lastDonation = donationDate
    }
  })
  
  // Convert to array and sort by total amount (descending)
  const campaignArray = Object.values(campaignMap)
    .sort((a, b) => b.total - a.total)
  
  console.log('Campaign preferences:', campaignArray)
  
  return campaignArray
}

// Bonus: Add a function to get donation timeline for the current year
function getCurrentYearDonations(donations) {
  const currentYear = new Date().getFullYear()
  
  return donations.filter(d => {
    const donationYear = new Date(d.date).getFullYear()
    return donationYear === currentYear
  })
}

// Bonus: Add a function to analyze giving patterns
function analyzeGivingPatterns(donations) {
  if (!donations || donations.length < 2) {
    return {
      pattern: 'Insufficient data',
      consistency: 0,
      trend: 'flat'
    }
  }
  
  // Sort by date
  const sortedDonations = [...donations].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  )
  
  // Calculate average days between donations
  const firstDate = new Date(sortedDonations[0].date)
  const lastDate = new Date(sortedDonations[sortedDonations.length - 1].date)
  const totalDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24)
  const avgDaysBetween = totalDays / (sortedDonations.length - 1)
  
  // Determine pattern
  let pattern = 'Irregular'
  if (avgDaysBetween <= 7) pattern = 'Weekly'
  else if (avgDaysBetween <= 31) pattern = 'Monthly'
  else if (avgDaysBetween <= 93) pattern = 'Quarterly'
  else if (avgDaysBetween <= 365) pattern = 'Annual'
  
  // Calculate amount consistency
  const amounts = sortedDonations.map(d => d.amount)
  const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
  const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length
  const consistency = Math.max(0, 100 - (variance / avgAmount * 100))
  
  // Calculate trend (increasing/decreasing)
  const firstHalf = sortedDonations.slice(0, Math.floor(sortedDonations.length / 2))
  const secondHalf = sortedDonations.slice(Math.floor(sortedDonations.length / 2))
  
  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.amount, 0) / firstHalf.length
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.amount, 0) / secondHalf.length
  
  let trend = 'flat'
  if (secondHalfAvg > firstHalfAvg * 1.1) trend = 'increasing'
  else if (secondHalfAvg < firstHalfAvg * 0.9) trend = 'decreasing'
  
  return {
    pattern,
    avgDaysBetween: Math.round(avgDaysBetween),
    consistency: Math.round(consistency),
    trend,
    avgAmount: Math.round(avgAmount)
  }
}
// Paste all the helper functions here (processDonationsByTime, calculateGivingFrequency, etc.)