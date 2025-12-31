// hooks/useDonations.js
'use client'
 
import { useState, useEffect } from 'react'

export function useDonations({ 
  timeframe = '30days', 
  page = 1, 
  limit = 50, 
  donorId = null,
  donorIds = null,
  campaignId = null,
  organizationId = null
} = {}) {
  const [donations, setDonations] = useState([])
  const [summary, setSummary] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [donationsByDonor, setDonationsByDonor] = useState({})

  useEffect(() => {
    async function fetchDonations() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          timeframe,
          page: page.toString(),
          limit: limit.toString(),
        })

        if (campaignId) params.append('campaignId', campaignId)
        if (donorId) params.append('donorId', donorId)
        if (donorIds && donorIds.length > 0) {
          params.append('donorIds', donorIds.join(','))
        }
        if (organizationId) params.append('organizationId', organizationId)

        const res = await fetch(`/api/donations?${params.toString()}`, {
          cache: 'no-store',
          //whatever page we are on, the data for that page gets returned 
        })

        if (!res.ok) {
          const errorText = await res.text()
          console.error('API Error:', errorText)
          throw new Error(`Failed to fetch donations: ${res.status}`)
        }

        const data = await res.json()
        console.log('Donations data received:', data)

        setDonations(data.donations || [])
        setSummary(data.summary || null)
        setPagination(data.pagination || null)

        // Organize donations by donor if we have donorIds
        if (donorIds && donorIds.length > 0) {
          const byDonor = {}
          data.donations.forEach(donation => {
            if (!byDonor[donation.donorId]) {
              byDonor[donation.donorId] = []
            }
            byDonor[donation.donorId].push(donation)
          })
          setDonationsByDonor(byDonor)
        }
      } catch (err) {
        console.error('Error fetching donations:', err)
        setError(err.message)
        
        // Fallback to empty data instead of breaking
        setDonations([])
        setSummary(null)
        setPagination(null)
        setDonationsByDonor({})
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [timeframe, page, limit, campaignId, donorId, donorIds, organizationId])

  console.log('retruned',
    donations, 
    donationsByDonor,
    summary, 
    pagination, 
    loading, 
    error )

  return { 
    donations, 
    donationsByDonor,
    summary, 
    pagination, 
    loading, 
    error 
  }
}