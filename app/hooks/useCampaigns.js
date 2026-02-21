'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useCampaigns(initialFilters = {}) {
  const router = useRouter()
  
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({
    activeCount: 0,
    totalRaised: 0,
    overallProgress: 0,
    uniqueDonors: 0,
    byStatus: {}
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [filters, setFilters] = useState({
    status: null,
    type: null,
    search: '',
    dateRange: 'all',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  })

  // Fetch campaigns
  const fetchCampaigns = useCallback(async (customFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      // Merge filters
      const currentFilters = { ...filters, ...customFilters }
      
      const params = new URLSearchParams()
      
      // Add all filters to params
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/campaigns?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch campaigns: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setCampaigns(data.campaigns || [])
        setSummary(data.summary || {
          activeCount: 0,
          totalRaised: 0,
          overallProgress: 0,
          uniqueDonors: 0,
          byStatus: {}
        })
        setPagination(data.pagination || {
          page: 1,
          limit: 20,
          totalCount: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        })
      } else {
        throw new Error(data.error || 'Failed to fetch campaigns')
      }

    } catch (err) {
      console.error('Error fetching campaigns:', err)
      setError(err.message)
      
      // Fallback to empty data
      setCampaigns([])
      setSummary({
        activeCount: 0,
        totalRaised: 0,
        overallProgress: 0,
        uniqueDonors: 0,
        byStatus: {}
      })
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Initial load
  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // Get single campaign by ID
  const getCampaignById = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch campaign: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        return data.campaign
      } else {
        throw new Error(data.error || 'Failed to fetch campaign')
      }
    } catch (err) {
      console.error('Error fetching campaign:', err)
      throw err
    }
  }, [])

  // Create new campaign
  const createCampaign = useCallback(async (campaignData) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create campaign: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Refresh the list
        await fetchCampaigns()
        return { success: true, campaign: data.campaign }
      } else {
        throw new Error(data.error || 'Failed to create campaign')
      }
    } catch (err) {
      console.error('Error creating campaign:', err)
      return { success: false, error: err.message }
    }
  }, [fetchCampaigns])

  // Update campaign
  const updateCampaign = useCallback(async (id, campaignData) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update campaign: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Refresh the list
        await fetchCampaigns()
        return { success: true, campaign: data.campaign }
      } else {
        throw new Error(data.error || 'Failed to update campaign')
      }
    } catch (err) {
      console.error('Error updating campaign:', err)
      return { success: false, error: err.message }
    }
  }, [fetchCampaigns])

  // Delete campaign
  const deleteCampaign = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to delete campaign: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Refresh the list
        await fetchCampaigns()
        return { success: true, message: data.message }
      } else {
        throw new Error(data.error || 'Failed to delete campaign')
      }
    } catch (err) {
      console.error('Error deleting campaign:', err)
      return { success: false, error: err.message }
    }
  }, [fetchCampaigns])

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }, [])

  // Go to page
  const goToPage = useCallback((page) => {
    setFilters(prev => ({
      ...prev,
      page: Math.max(1, Math.min(page, pagination.totalPages))
    }))
  }, [pagination.totalPages])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      status: null,
      type: null,
      search: '',
      dateRange: 'all',
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }, [])

  return {
    campaigns,
    loading,
    error,
    summary,
    pagination,
    filters,
    fetchCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    updateFilters,
    goToPage,
    resetFilters
  }
}

export default useCampaigns
