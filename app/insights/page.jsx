'use client'

import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'

import styles from './insights.module.css'


export default function InsightsPage() {

    console.log({
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
})

  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30days')
  const [chartType, setChartType] = useState('donations')
  const [lybuntCount, setLybuntCount] = useState(0)

  async function fetchLYBUNT() {
        const res = await fetch('/api/insights/lybunt')
        if (!res.ok) throw new Error('Failed')
        return res.json()
        }


 useEffect(() => {
  async function load() {
    try {
      const data = await fetchLYBUNT()
      setLybuntCount(data.count)
    } catch (e) {
      console.error(e)
    }
    finally {
    setLoading(false)
  }
}
    load() 
}, [])


  const getMockInsights = () => ({
    summary: {
      totalDonations: 125000,
      donationChange: 12.5,
      averageDonation: 250,
      averageChange: 5.2,
      totalDonors: 500,
      donorChange: 8.3,
      retentionRate: 78,
      retentionChange: 2.1,
    },
    segments: [
      { label: 'New Donors', value: 85, color: '#3b82f6' },
      { label: 'Repeat Donors', value: 215, color: '#10b981' },
      { label: 'LYBUNT Donors', value: 45, color: '#f59e0b' },
      { label: 'Major Donors', value: 12, color: '#8b5cf6' },
    ],
    campaigns: [
      { name: 'Annual Fund', goal: 100000, raised: 75000 },
      { name: 'Scholarship', goal: 50000, raised: 42500 },
      { name: 'Building Fund', goal: 200000, raised: 125000 },
      { name: 'Emergency Relief', goal: 75000, raised: 62000 },
    ],
    topDonors: [
      { id: 1, name: 'John Smith', email: 'john@example.com', amount: 10000 },
      { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', amount: 7500 },
      { id: 3, name: 'Michael Chen', email: 'michael@example.com', amount: 5000 },
      { id: 4, name: 'Emily Davis', email: 'emily@example.com', amount: 4500 },
      { id: 5, name: 'Robert Wilson', email: 'robert@example.com', amount: 4000 },
    ],
    monthlyTrends: [
      { month: 'Jan', donations: 15000, donors: 45 },
      { month: 'Feb', donations: 18000, donors: 52 },
      { month: 'Mar', donations: 22000, donors: 61 },
      { month: 'Apr', donations: 19500, donors: 58 },
      { month: 'May', donations: 24000, donors: 67 },
      { month: 'Jun', donations: 26500, donors: 72 },
    ]
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value}%`
  }

  const getTrendIcon = (value) => {
    if (value > 0) {
      return <ArrowTrendingUpIcon className={styles.trendIcon} />
    } else if (value < 0) {
      return <ArrowTrendingDownIcon className={styles.trendIcon} />
    }
    return null
  }

  const getTrendClass = (value) => {
    if (value > 0) return styles.positive
    if (value < 0) return styles.negative
    return styles.neutral
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    )
  }

  const displayInsights = insights || getMockInsights()

  return (
    <div className={styles.insightsPage}>
      {/* Header */}
      <div className={styles.insightsHeader}>
        <div>
          <h1 className={styles.insightsTitle}>Analytics & Insights</h1>
          <p className={styles.insightsDescription}>
            Key metrics and trends to optimize your fundraising strategy
          </p>
        </div>
        <div className={styles.timeFilter}>
          {['7days', '30days', '90days', 'year'].map((period) => (
            <button
              key={period}
              className={`${styles.timeButton} ${
                timeframe === period ? styles.timeButtonActive : ''
              }`}
              onClick={() => setTimeframe(period)}
            >
              {period === '7days' && '7 Days'}
              {period === '30days' && '30 Days'}
              {period === '90days' && '90 Days'}
              {period === 'year' && 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.summaryStats}>
        <div className={`${styles.statCard} ${styles.primary}`}>
          <div className={styles.statLabel}>
            <span>Total Donations</span>
            <CurrencyDollarIcon className={styles.statIcon} />
          </div>
          <p className={styles.statValue}>
            {formatCurrency(displayInsights.summary.totalDonations)}
          </p>
          <div className={`${styles.statChange} ${getTrendClass(displayInsights.summary.donationChange)}`}>
            {getTrendIcon(displayInsights.summary.donationChange)}
            {formatPercent(displayInsights.summary.donationChange)} from last period
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.statLabel}>
            <span>Average Donation</span>
            <ChartBarIcon className={styles.statIcon} />
          </div>
          <p className={styles.statValue}>
            {formatCurrency(displayInsights.summary.averageDonation)}
          </p>
          <div className={`${styles.statChange} ${getTrendClass(displayInsights.summary.averageChange)}`}>
            {getTrendIcon(displayInsights.summary.averageChange)}
            {formatPercent(displayInsights.summary.averageChange)} change
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statLabel}>
            <span>Total Donors</span>
            <UserGroupIcon className={styles.statIcon} />
          </div>
          <p className={styles.statValue}>
            {displayInsights.summary.totalDonors}
          </p>
          <div className={`${styles.statChange} ${getTrendClass(displayInsights.summary.donorChange)}`}>
            {getTrendIcon(displayInsights.summary.donorChange)}
            {formatPercent(displayInsights.summary.donorChange)} growth
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.danger}`}>
          <div className={styles.statLabel}>
            <span>Retention Rate</span>
            <HeartIcon className={styles.statIcon} />
          </div>
          <p className={styles.statValue}>
            {displayInsights.summary.retentionRate.toFixed(1)}%
          </p>
          <div className={`${styles.statChange} ${getTrendClass(displayInsights.summary.retentionChange)}`}>
            {getTrendIcon(displayInsights.summary.retentionChange)}
            {formatPercent(displayInsights.summary.retentionChange)} from last year
          </div>
        </div>
      </div>

      {/* Charts & Segments */}
      <div className={styles.chartsGrid}>
        {/* Donation Trends Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Donation Trends</h2>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className={styles.chartSelect}
            >
              <option value="donations">By Amount</option>
              <option value="donors">By Donor Count</option>
              <option value="campaigns">By Campaign</option>
            </select>
          </div>
          <div className={styles.chartPlaceholder}>
            <div style={{ textAlign: 'center' }}>
              <ChartBarIcon style={{ width: '3rem', height: '3rem', marginBottom: '1rem', color: '#9ca3af' }} />
              <p>Chart visualization would appear here</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Showing trends for {timeframe === '7days' ? '7 days' : 
                timeframe === '30days' ? '30 days' : 
                timeframe === '90days' ? '90 days' : 'this year'}
              </p>
            </div>
          </div>
        </div>

        {/* Donor Segments */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Donor Segments</h2>
          <div className={styles.donorSegments}>
            {displayInsights.segments.map((segment, index) => (
              <div key={index} className={styles.segmentCard}>
                <h3 className={styles.segmentTitle}>{segment.label}</h3>
                <ul className={styles.segmentList}>
                  <li className={styles.segmentItem}>
                    <div className={styles.segmentLabel}>
                      <div 
                        className={styles.segmentColor} 
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className={styles.segmentText}>Count</span>
                    </div>
                    <span className={styles.segmentValue}>{segment.value}</span>
                  </li>
                  <li className={styles.segmentItem}>
                    <span className={styles.segmentText}>Percentage</span>
                    <span className={styles.segmentValue}>
                      {((segment.value / displayInsights.summary.totalDonors) * 100).toFixed(1)}%
                    </span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className={styles.campaignsGrid}>
        <div className={styles.campaignCard}>
          <h2 className={styles.chartTitle}>Campaign Performance</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {displayInsights.campaigns.map((campaign, index) => {
              const percentage = (campaign.raised / campaign.goal) * 100
              const progressColors = [
                styles.progressBlue,
                styles.progressGreen,
                styles.progressPurple,
                styles.progressYellow
              ]
              
              return (
                <div key={index}>
                  <div className={styles.campaignHeader}>
                    <h3 className={styles.campaignName}>{campaign.name}</h3>
                    <span className={styles.campaignAmount}>
                      {formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={`${styles.progressFill} ${progressColors[index % progressColors.length]}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className={styles.progressInfo}>
                    <span>{percentage.toFixed(1)}% funded</span>
                    <span>{formatCurrency(campaign.goal - campaign.raised)} to go</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* LYBUNT Alert */}
      {lybuntCount > 0 && (
        <div className={styles.lybuntAlert}>
          <div className={styles.alertHeader}>
            <ExclamationTriangleIcon className={styles.alertIcon} />
            <div>
              <h3 className={styles.alertTitle}>Attention Needed: LYBUNT Donors</h3>
              <p className={styles.alertDescription}>
                {lybuntCount} donors who gave last year haven't donated this year. 
                These donors represent a potential loss of {formatCurrency(lybuntCount * 250)} 
                in annual revenue.
              </p>
            </div>
          </div>
          <div className={styles.alertActions}>
            <button className={`${styles.alertButton} ${styles.primary}`}>
              Create Re-engagement Campaign
            </button>
            <button className={`${styles.alertButton} ${styles.secondary}`}>
              View LYBUNT Report
            </button>
          </div>
        </div>
      )}

      {/* Top Performers */}
      <div className={styles.topPerformers}>
        {/* Top Donors */}
        <div className={styles.performerCard}>
          <h2 className={styles.performerTitle}>Top Donors This Period</h2>
          <ul className={styles.performerList}>
            {displayInsights.topDonors.map((donor) => (
              <li key={donor.id} className={styles.performerItem}>
                <div className={styles.performerAvatar}>
                  <UserCircleIcon className={styles.performerIcon} />
                </div>
                <div className={styles.performerInfo}>
                  <p className={styles.performerName}>{donor.name}</p>
                  <p className={styles.performerEmail}>{donor.email}</p>
                </div>
                <span className={styles.performerValue}>
                  {formatCurrency(donor.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Monthly Trends Summary */}
        <div className={styles.performerCard}>
          <h2 className={styles.performerTitle}>Monthly Performance</h2>
          <ul className={styles.performerList}>
            {displayInsights.monthlyTrends.slice(-6).map((month, index) => (
              <li key={index} className={styles.performerItem}>
                <div className={styles.performerInfo}>
                  <p className={styles.performerName}>{month.month} {new Date().getFullYear()}</p>
                  <p className={styles.performerEmail}>{month.donors} donors</p>
                </div>
                <span className={styles.performerValue}>
                  {formatCurrency(month.donations)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}