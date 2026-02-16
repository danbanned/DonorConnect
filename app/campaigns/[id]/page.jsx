'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  RocketLaunchIcon,
  UsersIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useCampaigns } from '../../hooks/useCampaigns'
import { useDonations } from '../../hooks/usedonation'
import './CampaignDetail.css'

// Chart imports - matching campaigns/page.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

// Campaign status options - matching campaigns/page.jsx
const campaignStatuses = [
  { value: 'ALL', label: 'All Campaigns', color: '#6b7280' },
  { value: 'DRAFT', label: 'Draft', color: '#9ca3af' },
  { value: 'ACTIVE', label: 'Active', color: '#10b981' },
  { value: 'COMPLETED', label: 'Completed', color: '#3b82f6' },
  { value: 'ARCHIVED', label: 'Archived', color: '#6b7280' }
]

// Campaign type options - matching campaigns/page.jsx
const campaignTypes = [
  { id: 'annual_fund', name: 'Annual Fund', icon: CurrencyDollarIcon },
  { id: 'capital_campaign', name: 'Capital Campaign', icon: RocketLaunchIcon },
  { id: 'endowment', name: 'Endowment', icon: ChartBarIcon },
  { id: 'scholarship', name: 'Scholarship', icon: UsersIcon },
  { id: 'event', name: 'Event', icon: CalendarIcon },
  { id: 'emergency', name: 'Emergency Relief', icon: SparklesIcon }
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function CampaignDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    goal: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    type: 'annual_fund'
  })
  const [donationPage, setDonationPage] = useState(1)

  // Use the campaigns hook
  const {
    getCampaignById,
    updateCampaign,
    deleteCampaign
  } = useCampaigns()

  // Use donations hook filtered for this campaign
  const {
    donations,
    loading: donationsLoading,
    summary: donationSummary,
    pagination: donationPagination,
    fetchDonations
  } = useDonations({
    campaignId: id,
    timeframe: 'all',
    limit: 10,
    page: donationPage,
    sortBy: 'date',
    sortOrder: 'desc'
  })

  // Fetch campaign data
  const fetchCampaign = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCampaignById(id)
      setCampaign(data)
    } catch (err) {
      console.error('Error fetching campaign:', err)
      setError(err.message || 'Failed to load campaign')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (id) {
      fetchCampaign()
    }
  }, [id])

  // Initialize edit form when campaign loads
  useEffect(() => {
    if (campaign) {
      setEditFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        goal: campaign.goal?.toString() || '',
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
        status: campaign.status || 'DRAFT',
        type: campaign.type || 'annual_fund'
      })
    }
  }, [campaign])

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCampaign()
    await fetchDonations({ campaignId: id, page: 1 })
  }

  // Handle delete
  const handleDelete = async () => {
    const result = await deleteCampaign(id)
    if (result.success) {
      router.push('/campaigns')
    } else {
      alert(result.error || 'Failed to delete campaign')
    }
  }

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault()
    const result = await updateCampaign(id, {
      ...editFormData,
      goal: parseFloat(editFormData.goal) || 0
    })
    
    if (result.success) {
      setShowEditModal(false)
      await fetchCampaign()
      await fetchDonations({ campaignId: id, page: 1 })
    } else {
      alert(result.error || 'Failed to update campaign')
    }
  }

  // Handle donation page change
  const handleDonationPageChange = (newPage) => {
    setDonationPage(newPage)
    fetchDonations({ campaignId: id, page: newPage })
  }

  // Get status badge class - matching campaigns/page.jsx
  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE': return 'status-badge status-active'
      case 'DRAFT': return 'status-badge status-draft'
      case 'COMPLETED': return 'status-badge status-completed'
      case 'ARCHIVED': return 'status-badge status-archived'
      default: return 'status-badge'
    }
  }

  // Format currency - matching campaigns/page.jsx
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  // Format date - matching campaigns/page.jsx
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate days remaining - matching campaigns/page.jsx
  const getDaysRemaining = (endDate) => {
    if (!endDate) return null
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Prepare donation trend data for chart
  const donationTrendData = donations
    .filter(d => d.status === 'COMPLETED')
    .reduce((acc, donation) => {
      const date = new Date(donation.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          year: date.getFullYear(),
          amount: 0,
          count: 0
        }
      }
      acc[monthKey].amount += donation.amount || 0
      acc[monthKey].count += 1
      return acc
    }, {})

  const trendData = Object.values(donationTrendData).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return new Date(`${a.month} 1, ${a.year}`) - new Date(`${b.month} 1, ${b.year}`)
  })

  // Prepare donor distribution data for pie chart
  const donorTiers = donations
    .filter(d => d.status === 'COMPLETED')
    .reduce((acc, donation) => {
      const tier = donation.amount >= 1000 ? 'Major (1000+)' :
                   donation.amount >= 500 ? 'Major (500-999)' :
                   donation.amount >= 100 ? 'Mid (100-499)' :
                   'Small (<100)'
      
      if (!acc[tier]) {
        acc[tier] = { name: tier, value: 0, count: 0 }
      }
      acc[tier].value += donation.amount || 0
      acc[tier].count += 1
      return acc
    }, {})

  const tierChartData = Object.values(donorTiers)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading campaign details...</p>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="error-container">
        <XMarkIcon className="error-icon" />
        <h2>Campaign Not Found</h2>
        <p>{error || 'The campaign you\'re looking for doesn\'t exist.'}</p>
        <Link href="/campaigns" className="btn-primary">
          <ArrowLeftIcon className="icon" />
          Back to Campaigns
        </Link>
      </div>
    )
  }

  const TypeIcon = campaignTypes.find(t => t.id === campaign.type)?.icon || RocketLaunchIcon
  const daysRemaining = getDaysRemaining(campaign.endDate)
  const progress = campaign.goal ? ((campaign.raised || 0) / campaign.goal) * 100 : 0
  const remainingAmount = Math.max(0, (campaign.goal || 0) - (campaign.raised || 0))

  return (
    <div className="campaign-detail-page">
      {/* Header with Back Link - Matching campaigns/page.jsx style */}
      <div className="detail-header">
        <div className="header-left">
          <Link href="/campaigns" className="back-link">
            <ArrowLeftIcon className="icon" />
            Back to Campaigns
          </Link>
          <div className="title-section">
            <div className="campaign-type-icon-large" style={{ background: `${campaignStatuses.find(s => s.value === campaign.status)?.color}20` }}>
              <TypeIcon style={{ color: campaignStatuses.find(s => s.value === campaign.status)?.color }} />
            </div>
            <div className="title-with-status">
              <h1>{campaign.name}</h1>
              <span className={getStatusClass(campaign.status)}>
                {campaign.status}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-secondary"
            disabled={refreshing}
          >
            <PencilIcon className="icon" />
            Edit Campaign
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn-danger"
            disabled={refreshing}
          >
            <TrashIcon className="icon" />
            Delete
          </button>
          <button
            onClick={handleRefresh}
            className="btn-secondary"
            disabled={refreshing}
          >
            <ArrowPathIcon className={`icon ${refreshing ? 'spinning' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid - Matching campaigns/page.jsx stats style */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <CurrencyDollarIcon />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Raised</span>
            <span className="stat-value">{formatCurrency(campaign.raised || 0)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
            <ChartBarIcon />
          </div>
          <div className="stat-content">
            <span className="stat-label">Goal</span>
            <span className="stat-value">{formatCurrency(campaign.goal || 0)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <UsersIcon />
          </div>
          <div className="stat-content">
            <span className="stat-label">Donors</span>
            <span className="stat-value">{campaign.uniqueDonors || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
            <CheckCircleIcon />
          </div>
          <div className="stat-content">
            <span className="stat-label">Donations</span>
            <span className="stat-value">{campaign.donationCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Progress Section - Matching campaigns/page.jsx progress bar style */}
      <div className="progress-section">
        <div className="progress-header">
          <h3>Campaign Progress</h3>
          <span className="progress-percentage">{progress.toFixed(1)}%</span>
        </div>
        <div className="progress-bar-large">
          <div 
            className="progress-fill-large"
            style={{ 
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: progress >= 100 ? '#10b981' : '#3b82f6'
            }}
          />
        </div>
        
        <div className="progress-details">
          <div className="progress-detail">
            <span className="detail-label">Raised:</span>
            <span className="detail-value">{formatCurrency(campaign.raised || 0)}</span>
          </div>
          <div className="progress-detail">
            <span className="detail-label">Goal:</span>
            <span className="detail-value">{formatCurrency(campaign.goal || 0)}</span>
          </div>
          <div className="progress-detail">
            <span className="detail-label">Remaining:</span>
            <span className="detail-value">{formatCurrency(remainingAmount)}</span>
          </div>
          <div className="progress-detail">
            <span className="detail-label">Average Gift:</span>
            <span className="detail-value">{formatCurrency(campaign.averageGift || 0)}</span>
          </div>
        </div>
      </div>

      {/* Info Grid - Campaign Details */}
      <div className="info-grid">
        {/* Description Card */}
        <div className="info-card description-card">
          <h3>
            <DocumentTextIcon className="icon" />
            Description
          </h3>
          <p>{campaign.description || 'No description provided.'}</p>
        </div>

        {/* Dates Card */}
        <div className="info-card dates-card">
          <h3>
            <CalendarIcon className="icon" />
            Campaign Dates
          </h3>
          <div className="date-list">
            <div className="date-item">
              <span className="date-label">Start Date:</span>
              <span className="date-value">{formatDate(campaign.startDate)}</span>
            </div>
            <div className="date-item">
              <span className="date-label">End Date:</span>
              <span className="date-value">{formatDate(campaign.endDate)}</span>
            </div>
            {daysRemaining !== null && daysRemaining > 0 && campaign.status === 'ACTIVE' && (
              <div className="days-remaining">
                <ClockIcon className="icon" />
                <span>{daysRemaining} days remaining</span>
              </div>
            )}
            {campaign.status === 'COMPLETED' && (
              <div className="days-remaining completed">
                <CheckCircleIcon className="icon" />
                <span>Campaign Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="info-card stats-card">
          <h3>
            <ChartBarIcon className="icon" />
            Quick Stats
          </h3>
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="stat-label">Campaign Type</span>
              <span className="stat-number">
                {campaignTypes.find(t => t.id === campaign.type)?.name || campaign.type || 'Not specified'}
              </span>
            </div>
            <div className="quick-stat">
              <span className="stat-label">Created</span>
              <span className="stat-number">{formatDate(campaign.createdAt)}</span>
            </div>
            <div className="quick-stat">
              <span className="stat-label">Last Updated</span>
              <span className="stat-number">{formatDate(campaign.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Matching campaigns/page.jsx chart style */}
      <div className="charts-section">
        {/* Donation Trend Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Donation Trend</h3>
            <span className="chart-subtitle">Monthly donations over time</span>
          </div>
          <div className="chart-container">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Amount']}
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    name="Donations" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-chart-data">
                <ChartBarIcon className="no-data-icon" />
                <p>No donation data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Donor Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Donor Distribution</h3>
            <span className="chart-subtitle">By giving amount</span>
          </div>
          <div className="pie-chart-container">
            {tierChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={tierChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tierChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-chart-data">
                <UserGroupIcon className="no-data-icon" />
                <p>No donor distribution data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Donations Section - Matching campaigns/page.jsx table style */}
      <div className="recent-donations-section">
        <div className="section-header">
          <h3>Recent Donations</h3>
          <Link href={`/donations?campaignId=${campaign.id}`} className="view-all-link">
            View All Donations →
          </Link>
        </div>

        {donationsLoading ? (
          <div className="loading-small">
            <div className="spinner-small" />
            <span>Loading donations...</span>
          </div>
        ) : donations.length > 0 ? (
          <>
            <div className="donations-table-container">
              <table className="donations-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(donation => (
                    <tr key={donation.id}>
                      <td>
                        <Link href={`/donors/${donation.donorId}`} className="donor-link">
                          {donation.donor?.firstName} {donation.donor?.lastName}
                        </Link>
                      </td>
                      <td className="amount-cell">{formatCurrency(donation.amount)}</td>
                      <td>{new Date(donation.date).toLocaleDateString()}</td>
                      <td>{donation.paymentMethod?.replace('_', ' ')}</td>
                      <td>
                        <span className={`status-badge-small status-${donation.status?.toLowerCase()}`}>
                          {donation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for donations - matching campaigns/page.jsx pagination style */}
            {donationPagination && donationPagination.totalPages > 1 && (
              <div className="pagination-small">
                <button
                  onClick={() => handleDonationPageChange(donationPage - 1)}
                  disabled={!donationPagination.hasPrevPage}
                  className="pagination-btn-small"
                >
                  Previous
                </button>
                <span className="page-info-small">
                  Page {donationPagination.page} of {donationPagination.totalPages}
                </span>
                <button
                  onClick={() => handleDonationPageChange(donationPage + 1)}
                  disabled={!donationPagination.hasNextPage}
                  className="pagination-btn-small"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-donations">
            <CurrencyDollarIcon className="empty-icon" />
            <p>No donations yet for this campaign</p>
            <Link 
              href={`/donations/new?campaignId=${campaign.id}&campaignName=${encodeURIComponent(campaign.name)}`} 
              className="btn-primary"
            >
              Add First Donation
            </Link>
          </div>
        )}
      </div>

      {/* Edit Modal - Matching campaigns/page.jsx modal style */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content campaign-modal">
            <div className="modal-header">
              <h2>Edit Campaign</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditFormData({
                    name: campaign.name || '',
                    description: campaign.description || '',
                    goal: campaign.goal?.toString() || '',
                    startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
                    endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
                    status: campaign.status || 'DRAFT',
                    type: campaign.type || 'annual_fund'
                  })
                }}
                className="close-button"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="campaignName">Campaign Name *</label>
                  <input
                    type="text"
                    id="campaignName"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="campaignDescription">Description</label>
                  <textarea
                    id="campaignDescription"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="campaignType">Campaign Type</label>
                  <select
                    id="campaignType"
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="form-select"
                  >
                    {campaignTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="campaignStatus">Status</label>
                  <select
                    id="campaignStatus"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="campaignGoal">Goal Amount ($)</label>
                  <input
                    type="number"
                    id="campaignGoal"
                    value={editFormData.goal}
                    onChange={(e) => setEditFormData({ ...editFormData, goal: e.target.value })}
                    className="form-input"
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={refreshing}
                >
                  {refreshing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal - Matching campaigns/page.jsx delete modal style */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h2>Delete Campaign</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="close-button"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>

            <div className="delete-content">
              <TrashIcon className="delete-icon" />
              <p>Are you sure you want to delete <strong>{campaign.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
              {campaign.donationCount > 0 && (
                <p className="warning-text">
                  This campaign has {campaign.donationCount} donation(s). It will be archived instead of deleted.
                </p>
              )}
            </div>

            <div className="delete-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
                disabled={refreshing}
              >
                {refreshing ? 'Processing...' : 'Delete Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}