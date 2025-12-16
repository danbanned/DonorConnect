'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import {
  ArrowLeftIcon,
  PencilIcon,
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

import DonorHeader from '@/components/donors/DonorHeader'
import DonationHistory from '@/components/donors/DonationHistory'
import PledgeBox from '@/components/donors/PledgeBox'
import RelationshipNotes from '@/components/donors/RelationshipNotes'
import SuggestedActions from '@/components/donors/SuggestedActions'

import './DonorProfile.css'

export default function DonorProfilePage() {
  const { id: donorId } = useParams()

  const [donor, setDonor] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function loadData() {
      try {
        const donorData = await getDonorById(donorId)
        setDonor(donorData)

        const insightsData = await getDonorInsights(donorId)
        setInsights(insightsData)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [donorId])

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="spinner" />
      </div>
    )
  }

  if (!donor) {
    return (
      <div className="not-found">
        <UserCircleIcon className="icon-muted" />
        <h3>Donor not found</h3>
        <Link href="/donors" className="btn-primary">
          <ArrowLeftIcon /> Back to Donors
        </Link>
      </div>
    )
  }

  return (
    <div className="donor-page">
      <Link href="/donors" className="back-link">
        <ArrowLeftIcon /> Back to Donors
      </Link>

      <DonorHeader donor={donor} insights={insights} />

      {donor.hasActivePledge && <PledgeBox pledge={donor} />}

      <div className="tabs">
        {['overview', 'donations', 'communications', 'insights', 'notes'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div>
              <DonationHistory donorId={donor.id} />
              <RelationshipNotes donorId={donor.id} />
            </div>
            <SuggestedActions donor={donor} insights={insights} />
          </div>
        )}

        {activeTab !== 'overview' && (
          <div className="card">
            <h3>{activeTab}</h3>
            <p>Content goes here</p>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <Link href={`/donations/new?donorId=${donor.id}`} className="btn-primary">
          <CurrencyDollarIcon /> Record Donation
        </Link>

        <Link href={`/communications/new?donorId=${donor.id}`} className="btn-secondary">
          <EnvelopeIcon /> Send Message
        </Link>

        <Link href={`/communications/schedule?donorId=${donor.id}`} className="btn-secondary">
          <CalendarIcon /> Schedule Meeting
        </Link>

        <Link href={`/donors/${donor.id}/edit`} className="btn-secondary">
          <PencilIcon /> Edit Profile
        </Link>
      </div>
    </div>
  )
}
