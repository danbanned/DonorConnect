// hooks/useDonations.js
'use client'

import { useState, useEffect } from 'react'

export function useDonations({ timeframe = '30days', page = 1, limit = 50 } = {}) {
  const [donations, setDonations] = useState([])
  const [summary, setSummary] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

        //if (campaignId )  params.append('campaignId', campaignId)
        //if (donorId) params.append('donorId', donorId)

        const res = await fetch(`/api/donations?${params.toString()}`, {
          cache: 'no-store', // always get fresh data
        })

        if (!res.ok) throw new Error('Failed to fetch donations')

        const data = await res.json()

        setDonations(data.donations || [])
        setSummary(data.summary || null)
        setPagination(data.pagination || null)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [timeframe, page, limit, ])//campaignId, donorId

  return { donations, summary, pagination, loading, error }
}
