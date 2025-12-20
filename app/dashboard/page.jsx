'use client'

import { useEffect, useState } from 'react'
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import './Dashboard.css'

// Static data for charts
const chartdata = [
  { month: 'Jan', amount: 40250 },
  { month: 'Feb', amount: 38920 },
  { month: 'Mar', amount: 45670 },
  { month: 'Apr', amount: 51230 },
  { month: 'May', amount: 48910 },
  { month: 'Jun', amount: 56780 },
]

const donorData = [
  { category: 'Major Donors', value: 15 },
  { category: 'Recurring', value: 32 },
  { category: 'Single Gift', value: 28 },
  { category: 'LYBUNT', value: 25 },
]

const stats = [
  { name: 'Total Donors', value: '1,234', change: '+12%', icon: UserGroupIcon },
  { name: 'Year to Date', value: '$245,231', change: '+8.2%', icon: CurrencyDollarIcon },
  { name: 'LYBUNT Donors', value: '47', change: '-3.2%', icon: ExclamationTriangleIcon },
  { name: 'Avg Gift Size', value: '$421', change: '+5.1%', icon: ArrowTrendingUpIcon },
]

const recentActivity = [
  { id: 1, donor: 'John Smith', action: 'Made a donation', amount: '$10,000', time: '2 hours ago' },
  { id: 2, donor: 'Sarah Johnson', action: 'Meeting scheduled', amount: '', time: '4 hours ago' },
  { id: 3, donor: 'Robert Chen', action: 'Thank you note sent', amount: '', time: '1 day ago' },
  { id: 4, donor: 'Maria Garcia', action: 'Made a donation', amount: '$500', time: '2 days ago' },
  { id: 5, donor: 'David Wilson', action: 'Updated contact info', amount: '', time: '3 days ago' },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your donors.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="stat-card">
              <div className="stat-card-content">
                <div className="stat-text">
                  <p className="stat-name">{stat.name}</p>
                  <p className="stat-value">{stat.value}</p>
                  <p className={`stat-change ${stat.change.startsWith('+') ? 'stat-change-positive' : 'stat-change-negative'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <Icon className="stat-icon" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h2 className="chart-title">Donations Over Time</h2>
          <div className="chart-wrapper">
            <div className="bar-chart">
              {chartdata.map((item, index) => {
                const maxAmount = Math.max(...chartdata.map(d => d.amount))
                const height = (item.amount / maxAmount) * 100
                return (
                  <div key={index} className="bar" style={{ height: `${height}%` }}>
                    <span className="bar-label">{item.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h2 className="chart-title">Donor Composition</h2>
          <div className="chart-wrapper">
            <div className="donut-chart">
              <div className="donut-center"></div>
            </div>
            <div className="donut-legend">
              {donorData.map((item, index) => (
                <div key={index} className="donut-legend-item">
                  <div className={`donut-legend-color donut-legend-color-${item.category.toLowerCase().replace(' ', '-')}`}></div>
                  <span>{item.category}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="dashboard-main-grid">
        <div className="recent-activity-card">
          <h2 className="recent-activity-title">Recent Activity</h2>
          <div className="recent-activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-info">
                  <p className="activity-donor">{activity.donor}</p>
                  <p className="activity-action">{activity.action}</p>
                </div>
                <div className="activity-details">
                  {activity.amount && <p className="activity-amount">{activity.amount}</p>}
                  <p className="activity-time">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/communications" className="recent-activity-link">
            View all activity →
          </Link>
        </div>

        <div className="quick-actions-card">
          <h2 className="quick-actions-title">Quick Actions</h2>
          <div className="quick-actions-list">
          

            <Link
              href={`/recorddonorpage`}
              className="quick-action-link quick-action-link-blue"
            >
              <CurrencyDollarIcon className="quick-action-icon quick-action-icon-blue" />
              <span className="quick-action-text">Record Donation</span>
            </Link>
            <Link
              href="/communications/new"
              className="quick-action-link quick-action-link-green"
            >
              <EnvelopeIcon className="quick-action-icon quick-action-icon-green" />
              <span className="quick-action-text">Send Thank You</span>
            </Link>
            <Link
              href="/donors?filter=lybunt"
              className="quick-action-link quick-action-link-yellow"
            >
              <ExclamationTriangleIcon className="quick-action-icon quick-action-icon-yellow" />
              <span className="quick-action-text">Review LYBUNT Donors</span>
            </Link>
            <Link
              href="/communications/schedule"
              className="quick-action-link quick-action-link-purple"
            >
              <CalendarIcon className="quick-action-icon quick-action-icon-purple" />
              <span className="quick-action-text">Schedule Meeting</span>
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  )
}