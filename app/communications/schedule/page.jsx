'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import ScheduleMeetingForm from '@/app/components/communications/ScheduleMeetingForm.jsx';

export default function ScheduleMeetingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const donorId = searchParams.get('donorId')

  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!donorId) {
      // Handle error: no donorId provided
      return
    }
    async function loadDonor() {
      try {
        const response = await fetch(`/api/donors/${donorId}`)
        const donorData = await response.json()
        setDonor(donorData)
      } catch (error) {
        console.error('Failed to load donor', error)
      } finally {
        setLoading(false)
      }
    }
    loadDonor()
  }, [donorId])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!donor) {
    return <div>Donor not found</div>
  }

  return (
    <div>
      <Link href={`/donors/${donorId}`} className="btn-primary">
        <ArrowLeftIcon /> Back to Donor
      </Link>
      <h1>Schedule Meeting with {donor.firstName} {donor.lastName}</h1>
      <ScheduleMeetingForm donorId={donorId} />
    </div>
  )
}