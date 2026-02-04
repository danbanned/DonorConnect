'use client'

import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useDonors } from '../hooks/useDonor'
import { useDonations } from '../hooks/usedonation'
import { useAI } from './AIProvider'

const QuickActionsContext = createContext({
  donors: [],
  donations: [],
  loading: false,
  error: null,
  stats: {},
  quickActions: [],
  formatCurrency: (amount) => `$${amount}`,
  aiStatus: {},
  aiSystem: null
})

export function QuickActionsProvider({ children }) {
  console.log('[QuickActionsProvider] render')

  const { aiSystem, status: aiStatus = {} } = useAI()
  console.log('[QuickActionsProvider] AI status:', aiStatus)

  // Use the same hooks as dashboard
  const { donors = [], loading: donorsLoading, error: donorsError } = useDonors()
  const { 
    donations = [], 
    summary = {}, 
    loading: donationsLoading, 
    error: donationsError 
  } = useDonations({ 
    timeframe: 'year',
    limit: 100
  })

  console.log('[QuickActionsProvider] donors hook:', {
    count: donors.length,
    loading: donorsLoading,
    error: donorsError
  })

  console.log('[QuickActionsProvider] donations hook:', {
    count: donations.length,
    loading: donationsLoading,
    error: donationsError,
    summary
  })

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  // Process donor data
  const processedDonors = useMemo(() => {
    console.log('[QuickActionsProvider] processing donors')

    if (!donors || donors.length === 0) {
      console.log('[QuickActionsProvider] no donors to process')
      return []
    }

    const result = donors.map((donor) => {
      const donorDonations =
        donations?.filter(d => d.donorId === donor.id) || []

      const totalGiven = donorDonations.reduce(
        (sum, d) => sum + (d.amount || 0),
        0
      )

      const lastDonation =
        donorDonations.length > 0
          ? donorDonations.sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            )[0]
          : null

      return {
        id: donor.id,
        name: `${donor.firstName} ${donor.lastName}`,
        email: donor.email || '',
        firstName: donor.firstName,
        lastName: donor.lastName,
        phone: donor.phone || '',
        totalDonations: totalGiven,
        lastDonationDate: lastDonation
          ? new Date(lastDonation.date)
          : null,
        isLYBUNT: donor.relationshipStage === 'LYBUNT',
        isSYBUNT: donor.relationshipStage === 'SYBUNT',
        status: donor.status || 'ACTIVE',
        relationshipStage: donor.relationshipStage || 'NEW',
        organizationId: donor.organizationId,
        createdAt: donor.createdAt
          ? new Date(donor.createdAt)
          : new Date()
      }
    })

    console.log('[QuickActionsProvider] processed donors:', result.length)
    return result
  }, [donors, donations])

  // Process donation statistics
  const donationStats = useMemo(() => {
    console.log('[QuickActionsProvider] computing donation stats')

    if (!donations || donations.length === 0) {
      console.log('[QuickActionsProvider] no donations for stats')
      return {
        totalDonors: 0,
        yearToDate: 0,
        lybuntDonors: 0,
        sybuntDonors: 0,
        avgGiftSize: 0,
        totalDonations: 0
      }
    }

    const currentYear = new Date().getFullYear()

    const ytdDonations = donations.filter(d => {
      if (!d.date) return false
      return new Date(d.date).getFullYear() === currentYear
    })

    const ytdTotal = ytdDonations.reduce(
      (sum, d) => sum + (d.amount || 0),
      0
    )

    const lybuntCount = processedDonors.filter(d => d.isLYBUNT).length
    const sybuntCount = processedDonors.filter(d => d.isSYBUNT).length

    const avgGift =
      donations.length > 0
        ? donations.reduce((sum, d) => sum + (d.amount || 0), 0) /
          donations.length
        : 0

    const stats = {
      totalDonors: processedDonors.length,
      yearToDate: ytdTotal,
      lybuntDonors: lybuntCount,
      sybuntDonors: sybuntCount,
      avgGiftSize: avgGift,
      totalDonations: donations.length,
      summary
    }

    console.log('[QuickActionsProvider] donation stats:', stats)
    return stats
  }, [donations, processedDonors, summary])

  // Quick action suggestions
  const quickActions = useMemo(() => {
    console.log('[QuickActionsProvider] computing quick actions')

    if (donorsLoading || donationsLoading) {
      console.log('[QuickActionsProvider] still loading data')
      return []
    }

    if (donorsError || donationsError) {
      console.warn('[QuickActionsProvider] errors detected', {
        donorsError,
        donationsError
      })
      return []
    }

    if (!donors || donors.length === 0) {
      console.log('[QuickActionsProvider] no donors → no actions')
      return []
    }

    const actions = []

    const lybuntDonors = processedDonors.filter(d => d.isLYBUNT)
    if (lybuntDonors.length > 0) {
      actions.push({
        id: 'lybunt_followup',
        title: 'Follow up with LYBUNT donors',
        description: `${lybuntDonors.length} donors gave last year but not this year`,
        icon: 'BellAlertIcon',
        type: 'followup',
        priority: 'high',
        donors: lybuntDonors.slice(0, 3)
      })
    }

    const largeDonations =
      donations
        ?.filter(d => d.amount > 1000)
        ?.sort((a, b) => new Date(b.date) - new Date(a.date))
        ?.slice(0, 3) || []

    if (largeDonations.length > 0) {
      const largeDonorIds = largeDonations.map(d => d.donorId)
      const largeDonors = processedDonors.filter(d =>
        largeDonorIds.includes(d.id)
      )

      actions.push({
        id: 'large_donation_thanks',
        title: 'Thank major donors',
        description: `Recent large donations from ${largeDonors.length} donors`,
        icon: 'CurrencyDollarIcon',
        type: 'thankyou',
        priority: 'medium',
        donations: largeDonations,
        donors: largeDonors
      })
    }

    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    const inactiveDonors = processedDonors
      .filter(
        donor =>
          !donor.lastDonationDate ||
          donor.lastDonationDate < twoYearsAgo
      )
      .slice(0, 5)

    if (inactiveDonors.length > 0) {
      actions.push({
        id: 'reactivate_inactive',
        title: 'Re-engage inactive donors',
        description: `${inactiveDonors.length} donors haven't given in 2+ years`,
        icon: 'UserGroupIcon',
        type: 'reactivation',
        priority: 'medium',
        donors: inactiveDonors
      })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newDonors = processedDonors
      .filter(donor => donor.createdAt > thirtyDaysAgo)
      .slice(0, 3)

    if (newDonors.length > 0) {
      actions.push({
        id: 'welcome_new',
        title: 'Welcome new donors',
        description: `${newDonors.length} new donors joined recently`,
        icon: 'SparklesIcon',
        type: 'welcome',
        priority: 'high',
        donors: newDonors
      })
    }

    console.log('[QuickActionsProvider] actions generated:', actions)
    return actions
  }, [
    processedDonors,
    donations,
    donors,
    donorsLoading,
    donationsLoading,
    donorsError,
    donationsError
  ])

  const loading = donorsLoading || donationsLoading
  const error = donorsError || donationsError

  useEffect(() => {
    console.log('[QuickActionsProvider] loading:', loading)
  }, [loading])

  useEffect(() => {
    if (error) {
      console.error('[QuickActionsProvider] error:', error)
    }
  }, [error])

  const value = {
    donors: processedDonors,
    donations,
    loading,
    error,
    stats: donationStats,
    quickActions,
    formatCurrency,
    aiStatus,
    aiSystem
  }

  console.log('[QuickActionsProvider] context value ready', {
    donors: processedDonors.length,
    donations: donations.length,
    quickActions: quickActions.length
  })

  return (
    <QuickActionsContext.Provider value={value}>
      {children}
    </QuickActionsContext.Provider>
  )
}

export const useQuickActions = () => {
  const context = useContext(QuickActionsContext)
  console.log('[useQuickActions] consumed', context)
  return context
}
