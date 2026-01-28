// hooks/useDonor.js - FIXED VERSION (no React Query)
'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  getDonors,
  getDonorById,
  getLYBUNTDonors,
  createDonor,
} from '../../lib/api/donors'

/**
 * Hook for working with donors in the UI
 */
export function useDonors(options = {}) {
  const { donorId = null, lybunt = false, autoLoad = true } = options

  const [donors, setDonors] = useState([])
  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(autoLoad)
  const [error, setError] = useState(null)

  /**
   * Load donors list
   */
  const loadDonors = useCallback(async () => {
    try {
      console.log('[useDonors] loadDonors START', { lybunt })
      setLoading(true)
      setError(null)

      const data = lybunt
        ? await getLYBUNTDonors()
        : await getDonors()

      console.log('[useDonors] loadDonors API RESULT:', data)
      setDonors(data || []) // Ensure it's always an array
      console.log('[useDonors] donors state SET')
    } catch (err) {
      console.error('[useDonors] loadDonors ERROR:', err)
      setError(err.message)
    } finally {
      console.log('[useDonors] loadDonors END')
      setLoading(false)
    }
  }, [lybunt])

  /**
   * Load single donor
   */
  const loadDonorById = useCallback(async (id) => {
    if (!id) return

    try {
      console.log('[useDonors] loadDonorById START:', id)
      setLoading(true)
      setError(null)

      const data = await getDonorById(id)
      setDonor(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create donor and refresh list
   */
  const addDonor = useCallback(async (donorData) => {
    try {
      console.log('[useDonors] addDonor START:', donorData)
      setError(null)
      const newDonor = await createDonor(donorData)

      // Refresh the donors list
      await loadDonors()

      return newDonor
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [loadDonors])

  /**
   * Auto-load behavior
   */
  useEffect(() => {
    if (!autoLoad) return

    if (donorId) {
      loadDonorById(donorId)
    } else {
      loadDonors()
    }
  }, [autoLoad, donorId, loadDonors, loadDonorById])

  /**
   * Simple invalidate function - just reloads donors
   */
  const invalidate = useCallback(() => {
    console.log('[useDonors] Invalidating donors cache - reloading donors')
    return loadDonors()
  }, [loadDonors])

  console.log('[useDonors] RETURNING:', {
    donorsCount: donors?.length || 0,
    donor: donor ? 'loaded' : 'null',
    loading,
    error: error?.message,
  })

  return {
    // data
    donors: donors || [],
    donor,

    // state
    loading,
    error,

    // actions
    refresh: loadDonors,
    loadDonorById,
    addDonor,
    invalidate
  }
}