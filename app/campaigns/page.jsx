'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'
import { useCampaigns } from '../hooks/useCampaigns'
import { useDonations } from '../hooks/usedonation'
import './Campaigns.css'

// Chart imports
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

// Campaign status options
const campaignStatuses = [
  { value: 'ALL', label: 'All Campaigns', color: '#6b7280' },
  { value: 'DRAFT', label: 'Draft', color: '#9ca3af' },
  { value: 'ACTIVE', label: 'Active', color: '#10b981' },
  { value: 'COMPLETED', label: 'Completed', color: '#3b82f6' },
  { value: 'ARCHIVED', label: 'Archived', color: '#6b7280' }
]

// Campaign type options (customize as needed)
const campaignTypes = [
  { id: 'annual_fund', name: 'Annual Fund', icon: CurrencyDollarIcon },
  { id: 'capital_campaign', name: 'Capital Campaign', icon: RocketLaunchIcon },
  { id: 'endowment', name: 'Endowment', icon: ChartBarIcon },
  { id: 'scholarship', name: 'Scholarship', icon: UsersIcon },
  { id: 'event', name: 'Event', icon: CalendarIcon },
  { id: 'emergency', name: 'Emergency Relief', icon: SparklesIcon }
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function CampaignsPage() {
  const router = useRouter()
  
  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')
  const [dateRange, setDateRange] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    description: '',
    goal: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    type: 'annual_fund'
  })

  // Fetch campaigns using custom hook
  const { 
    campaigns, 
    loading, 
    error, 
    summary,
    pagination,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaignById
  } = useCampaigns({
    status: selectedStatus !== 'ALL' ? selectedStatus : null,
    type: selectedType !== 'ALL' ? selectedType : null,
    search: searchTerm,
    dateRange
  })

  console.log('Campaigns loaded:', campaigns)

  // Fetch donations for campaign analytics
  const { donations, summary: donationSummary } = useDonations({
    timeframe: 'year',
    limit: 1000
  })

  // Filter campaigns locally
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = searchTerm === '' || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'ALL' || campaign.status === selectedStatus
    const matchesType = selectedType === 'ALL' || campaign.type === selectedType
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate campaign progress
  const getCampaignProgress = (campaign) => {
    if (!campaign.goal || campaign.goal === 0) return 0
    const raised = campaign.raised || 0
    return Math.min((raised / campaign.goal) * 100, 100)
  }

  // Get status color
  const getStatusColor = (status) => {
    const statusObj = campaignStatuses.find(s => s.value === status)
    return statusObj?.color || '#6b7280'
  }

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE': return 'status-badge status-active'
      case 'DRAFT': return 'status-badge status-draft'
      case 'COMPLETED': return 'status-badge status-completed'
      case 'ARCHIVED': return 'status-badge status-archived'
      default: return 'status-badge'
    }
  }

  // Handle create campaign
  const handleCreateCampaign = async (e) => {
    e.preventDefault()
    try {
      const result = await createCampaign({
        ...campaignFormData,
        goal: parseFloat(campaignFormData.goal) || 0
      })
      
      if (result.success) {
        setShowCreateModal(false)
        resetForm()
        await fetchCampaigns()
        alert('Campaign created successfully!')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign')
    }
  }

  // Handle update campaign
  const handleUpdateCampaign = async (e) => {
    e.preventDefault()
    if (!selectedCampaign) return

    try {
      const result = await updateCampaign(selectedCampaign.id, {
        ...campaignFormData,
        goal: parseFloat(campaignFormData.goal) || 0
      })
      
      if (result.success) {
        setShowEditModal(false)
        resetForm()
        await fetchCampaigns()
        alert('Campaign updated successfully!')
      }
    } catch (error) {
      console.error('Error updating campaign:', error)
      alert('Failed to update campaign')
    }
  }

  // Handle delete campaign
  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return

    try {
      const result = await deleteCampaign(selectedCampaign.id)
      
      if (result.success) {
        setShowDeleteModal(false)
        setSelectedCampaign(null)
        await fetchCampaigns()
        alert('Campaign deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Failed to delete campaign')
    }
  }

  // Handle edit click
  const handleEditClick = async (campaign) => {
    try {
      const fullCampaign = await getCampaignById(campaign.id)
      setSelectedCampaign(fullCampaign)
      setCampaignFormData({
        name: fullCampaign.name || '',
        description: fullCampaign.description || '',
        goal: fullCampaign.goal?.toString() || '',
        startDate: fullCampaign.startDate ? new Date(fullCampaign.startDate).toISOString().split('T')[0] : '',
        endDate: fullCampaign.endDate ? new Date(fullCampaign.endDate).toISOString().split('T')[0] : '',
        status: fullCampaign.status || 'DRAFT',
        type: fullCampaign.type || 'annual_fund'
      })
      setShowEditModal(true)
    } catch (error) {
      console.error('Error loading campaign:', error)
      alert('Failed to load campaign details')
    }
  }

  // Reset form
  const resetForm = () => {
    setCampaignFormData({
      name: '',
      description: '',
      goal: '',
      startDate: '',
      endDate: '',
      status: 'DRAFT',
      type: 'annual_fund'
    })
    setSelectedCampaign(null)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate days remaining
  const getDaysRemaining = (endDate) => {
    if (!endDate) return null
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Prepare chart data
  const campaignPerformanceData = filteredCampaigns
    .filter(c => c.status === 'ACTIVE' || c.status === 'COMPLETED')
    .slice(0, 5)
    .map(c => ({
      name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
      goal: c.goal || 0,
      raised: c.raised || 0,
      progress: getCampaignProgress(c)
    }))

  // Donations by campaign for pie chart
  const donationsByCampaign = campaigns
    .filter(c => c.raised && c.raised > 0)
    .map(c => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
      value: c.raised || 0
    }))
    .slice(0, 5)

  if (loading && campaigns.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading campaigns...</p>
      </div>
    )
  }

  return (
    <div className="campaigns-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Campaigns</h1>
          <p className="subtitle">
            Manage and track your fundraising campaigns
          </p>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="icon" />
            New Campaign
          </button>
          <button
            onClick={() => fetchCampaigns()}
            className="btn-secondary"
            disabled={loading}
          >
            <ArrowPathIcon className={`icon ${loading ? 'spinning' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <RocketLaunchIcon />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Campaigns</span>
            <span className="stat-value">{summary?.activeCount || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
            <CurrencyDollarIcon />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Raised</span>
            <span className="stat-value">{formatCurrency(summary?.totalRaised || 0)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <ChartBarIcon />
          </div>
          <div className="stat-content">
            <span className="stat-label">Goal Progress</span>
            <span className="stat-value">{summary?.overallProgress?.toFixed(1)}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
            <UserGroupIcon />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Donors</span>
            <span className="stat-value">{summary?.uniqueDonors || 0}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Campaign Performance Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Campaign Performance</h3>
            <span className="chart-subtitle">Goal vs Raised (Top 5)</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
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
                <Bar 
                  dataKey="goal" 
                  name="Goal" 
                  fill="#9ca3af" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="raised" 
                  name="Raised" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donations by Campaign Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Donations by Campaign</h3>
            <span className="chart-subtitle">Distribution of funds</span>
          </div>
          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={donationsByCampaign}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {donationsByCampaign.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search"
            >
              <XMarkIcon className="clear-icon" />
            </button>
          )}
        </div>

        <div className="filter-group">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            {campaignStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Types</option>
            {campaignTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="active">Active Only</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            onClick={() => setViewMode('grid')}
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            <div className="grid-icon" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            <div className="list-icon" />
            List
          </button>
        </div>
      </div>

      {/* Campaigns Grid/List */}
      {viewMode === 'grid' ? (
        <div className="campaigns-grid">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map(campaign => {
              const progress = getCampaignProgress(campaign)
              const daysRemaining = getDaysRemaining(campaign.endDate)
              const TypeIcon = campaignTypes.find(t => t.id === campaign.type)?.icon || RocketLaunchIcon

              return (
                <div key={campaign.id} className="campaign-card">
                  <div className="campaign-card-header">
                    <div className="campaign-type-icon" style={{ background: `${getStatusColor(campaign.status)}20` }}>
                      <TypeIcon style={{ color: getStatusColor(campaign.status) }} />
                    </div>
                    <span className={getStatusClass(campaign.status)}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="campaign-card-content">
                    <h3 className="campaign-title">
                      <Link href={`/campaigns/${campaign.id}`}>
                        {campaign.name}
                      </Link>
                    </h3>
                    
                    {campaign.description && (
                      <p className="campaign-description">
                        {campaign.description.length > 100 
                          ? campaign.description.substring(0, 100) + '...' 
                          : campaign.description}
                      </p>
                    )}

                    <div className="campaign-progress">
                      <div className="progress-header">
                        <span className="progress-label">Progress</span>
                        <span className="progress-percentage">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: progress >= 100 ? '#10b981' : '#3b82f6'
                          }}
                        />
                      </div>
                    </div>

                    <div className="campaign-stats">
                      <div className="stat">
                        <span className="stat-label">Raised</span>
                        <span className="stat-value">{formatCurrency(campaign.raised || 0)}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Goal</span>
                        <span className="stat-value">{formatCurrency(campaign.goal || 0)}</span>
                      </div>
                    </div>

                    <div className="campaign-dates">
                      <div className="date-item">
                        <CalendarIcon className="date-icon" />
                        <span>Start: {formatDate(campaign.startDate)}</span>
                      </div>
                      <div className="date-item">
                        <ClockIcon className="date-icon" />
                        <span>End: {formatDate(campaign.endDate)}</span>
                      </div>
                    </div>

                    {daysRemaining !== null && daysRemaining > 0 && campaign.status === 'ACTIVE' && (
                      <div className="days-remaining">
                        <SparklesIcon className="days-icon" />
                        <span>{daysRemaining} days remaining</span>
                      </div>
                    )}
                  </div>

                  <div className="campaign-card-footer">
                    <button
                      onClick={() => handleEditClick(campaign)}
                      className="action-btn edit-btn"
                    >
                      <PencilIcon className="icon" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCampaign(campaign)
                        setShowDeleteModal(true)
                      }}
                      className="action-btn delete-btn"
                    >
                      <TrashIcon className="icon" />
                      Delete
                    </button>
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="action-btn view-btn"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="empty-state">
              <RocketLaunchIcon className="empty-icon" />
              <h3>No campaigns found</h3>
              <p>Get started by creating your first campaign</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="icon" />
                Create Campaign
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="campaigns-list">
          <table className="campaigns-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Type</th>
                <th>Progress</th>
                <th>Raised</th>
                <th>Goal</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(campaign => {
                const progress = getCampaignProgress(campaign)
                const TypeIcon = campaignTypes.find(t => t.id === campaign.type)?.icon || RocketLaunchIcon
                
                return (
                  <tr key={campaign.id}>
                    <td>
                      <div className="campaign-cell">
                        <div className="campaign-icon" style={{ background: `${getStatusColor(campaign.status)}20` }}>
                          <TypeIcon style={{ color: getStatusColor(campaign.status), width: '16px', height: '16px' }} />
                        </div>
                        <div>
                          <Link href={`/campaigns/${campaign.id}`} className="campaign-name">
                            {campaign.name}
                          </Link>
                          {campaign.description && (
                            <div className="campaign-description-small">
                              {campaign.description.substring(0, 50)}
                              {campaign.description.length > 50 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusClass(campaign.status)}>
                        {campaign.status}
                      </span>
                    </td>
                    <td>
                      <span className="campaign-type">
                        {campaignTypes.find(t => t.id === campaign.type)?.name || campaign.type}
                      </span>
                    </td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-bar-small">
                          <div 
                            className="progress-fill-small"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: progress >= 100 ? '#10b981' : '#3b82f6'
                            }}
                          />
                        </div>
                        <span className="progress-text">{progress.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="amount-cell">{formatCurrency(campaign.raised || 0)}</td>
                    <td className="amount-cell">{formatCurrency(campaign.goal || 0)}</td>
                    <td>
                      <div className="date-cell">
                        <CalendarIcon className="date-icon-small" />
                        {formatDate(campaign.endDate)}
                      </div>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          onClick={() => handleEditClick(campaign)}
                          className="icon-btn"
                          title="Edit campaign"
                        >
                          <PencilIcon className="icon-small" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setShowDeleteModal(true)
                          }}
                          className="icon-btn delete-btn"
                          title="Delete campaign"
                        >
                          <TrashIcon className="icon-small" />
                        </button>
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          className="icon-btn"
                          title="View details"
                        >
                          <DocumentTextIcon className="icon-small" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredCampaigns.length === 0 && (
            <div className="empty-state">
              <RocketLaunchIcon className="empty-icon" />
              <h3>No campaigns found</h3>
              <p>Try adjusting your filters or create a new campaign</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => fetchCampaigns({ page: pagination.page - 1 })}
            disabled={!pagination.hasPrevPage}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchCampaigns({ page: pagination.page + 1 })}
            disabled={!pagination.hasNextPage}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content campaign-modal">
            <div className="modal-header">
              <h2>Create New Campaign</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="close-button"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="modal-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="campaignName">Campaign Name *</label>
                  <input
                    type="text"
                    id="campaignName"
                    value={campaignFormData.name}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                    className="form-input"
                    required
                    placeholder="e.g., Annual Fund 2024"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="campaignDescription">Description</label>
                  <textarea
                    id="campaignDescription"
                    value={campaignFormData.description}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, description: e.target.value })}
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe the campaign goals and purpose..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="campaignType">Campaign Type</label>
                  <select
                    id="campaignType"
                    value={campaignFormData.type}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, type: e.target.value })}
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
                    value={campaignFormData.status}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, status: e.target.value })}
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
                    value={campaignFormData.goal}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, goal: e.target.value })}
                    className="form-input"
                    min="0"
                    step="1000"
                    placeholder="50000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={campaignFormData.startDate}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, startDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={campaignFormData.endDate}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, endDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal-content campaign-modal">
            <div className="modal-header">
              <h2>Edit Campaign</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                }}
                className="close-button"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>

            <form onSubmit={handleUpdateCampaign} className="modal-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="editCampaignName">Campaign Name *</label>
                  <input
                    type="text"
                    id="editCampaignName"
                    value={campaignFormData.name}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="editCampaignDescription">Description</label>
                  <textarea
                    id="editCampaignDescription"
                    value={campaignFormData.description}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, description: e.target.value })}
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editCampaignType">Campaign Type</label>
                  <select
                    id="editCampaignType"
                    value={campaignFormData.type}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, type: e.target.value })}
                    className="form-select"
                  >
                    {campaignTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="editCampaignStatus">Status</label>
                  <select
                    id="editCampaignStatus"
                    value={campaignFormData.status}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="editCampaignGoal">Goal Amount ($)</label>
                  <input
                    type="number"
                    id="editCampaignGoal"
                    value={campaignFormData.goal}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, goal: e.target.value })}
                    className="form-input"
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editStartDate">Start Date</label>
                  <input
                    type="date"
                    id="editStartDate"
                    value={campaignFormData.startDate}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, startDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editEndDate">End Date</label>
                  <input
                    type="date"
                    id="editEndDate"
                    value={campaignFormData.endDate}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, endDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h2>Delete Campaign</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedCampaign(null)
                }}
                className="close-button"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>

            <div className="delete-content">
              <TrashIcon className="delete-icon" />
              <p>Are you sure you want to delete <strong>{selectedCampaign.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="delete-actions">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedCampaign(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                className="btn-danger"
              >
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}