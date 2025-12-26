'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  getDonors,
  getDonorById,
  getLYBUNTDonors,
  createDonor,
} from '@/lib/api/donors'

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
      setLoading(true)
      setError(null)

      const data = lybunt
        ? await getLYBUNTDonors()
        : await getDonors()

      setDonors(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [lybunt])

  /**
   * Load single donor
   */
  const loadDonorById = useCallback(async (id) => {
    if (!id) return

    try {
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
      setError(null)
      const newDonor = await createDonor(donorData)

      // Optimistic update
      setDonors((prev) => [newDonor, ...prev])

      return newDonor
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

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

  return {
    // data
    donors,
    donor,

    // state
    loading,
    error,

    // actions
    refresh: loadDonors,
    loadDonorById,
    addDonor,
  }
}
