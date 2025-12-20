'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import {
  ArrowLeftIcon,
  PencilIcon,
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

import DonorHeader from '@/app/components/donors/DonorHeader'
import DonationHistory from '@/app/components/donations/DonationHistory'
import PledgeBox from '@/app/components/donors/PledgeBox'
import RelationshipNotes from '@/app/components/donors/RelationshipNotes'
import SuggestedActions from '@/app/components/donors/SuggestedActions'
import AddDonorForm from '@/app/components/donors/AddDonorForm'
import { getDonorById as fetchDonorById } from '@/lib/api/donors'
import './DonorProfile.css'


async function getDonorInsights(id) {
  try {
    const res = await fetch(`/api/donors/${id}/insights`)
    if (!res.ok) throw new Error('No insights')
    return await res.json()
  } catch {
    // ✅ Wrap fallback in "status" to match your usage
    return {
      status: {
        engagementScore: 50,
        engagementLevel: 'Medium',
      },
      givingFrequency: 'quarterly',
      suggestedAskAmount: 100,
      lastContact: null,
      nextBestAction: 'Send thank you note',
    }
  }
}

export default function DonorProfilePage() {
  const { id: donorId } = useParams()
  const router = useRouter()

  const [donor, setDonor] = useState(null)
  const [insights, setInsights] = useState(null)
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState(null)

  // ✅ Safe access with optional chaining
  const engagementScore = insights?.status?.engagementScore ?? 0
  const engagementLevel = insights?.status?.engagementLevel ?? 'Low'

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        if (donorId === 'new') {
          setShowAddForm(true)
          setDonor(null)
          return
        }

        const donorData = await fetchDonorById(donorId)

        if (!donorData) {
          setShowAddForm(true)
          setDonor(null)
          return
        }

        setDonor(donorData)
        setShowAddForm(false)

        const insightsData = await getDonorInsights(donorId)
        setInsights(insightsData)
      } catch (err) {
        console.error('Failed to load donor:', err)
        setError('Failed to load donor data')
        setShowAddForm(true)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [donorId])

  const handleAddDonorSuccess = (newDonorId) => {
    router.push(`/donors/${newDonorId}`)
  }

  const handleCancelAdd = () => {
    donorId === 'new' ? router.push('/donors') : setShowAddForm(false)
  }

  if (loading && !showAddForm) {
    return (
      <div className="loader-wrapper">
        <div className="spinner" />
      </div>
    )
  }

  if (showAddForm) {
    return (
      <div className="donor-page">
        <AddDonorForm
          onSuccess={handleAddDonorSuccess}
          onCancel={handleCancelAdd}
        />
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
      <Link href="/donors" className="btn-primary">
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
        {activeTab === 'overview' ? (
          <div className="overview-grid">
            <div>
              <DonationHistory donorId={donor.id} />
              <RelationshipNotes donorId={donor.id} />
              {/* ✅ Engagement badge */}
              <div className="engagement-badge">
                <p className="text-sm font-medium text-gray-700">Engagement Score</p>
                <span
                  className={`badge ${
                    engagementScore >= 75
                      ? 'badge-success'
                      : engagementScore >= 50
                      ? 'badge-warning'
                      : 'badge-danger'
                  }`}
                >
                  {engagementLevel}
                </span>
              </div>
            </div>
            <SuggestedActions donor={donor} insights={insights} />
          </div>
        ) : (
          <div className="card">
            <h3>{activeTab}</h3>
            <p>Content goes here</p>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <Link href={`/recorddonorpage/${donor.id}`} className="btn-primary">
          <CurrencyDollarIcon /> Record Donation
        </Link>

       <Link href={`/communications?donorId=${donor.id}`} className="btn-secondary">
          <EnvelopeIcon /> Send Message
        </Link>

       <Link href={`/communications?schedule${donor.id}`} className="btn-secondary">
          <CalendarIcon /> Schedule Meeting
        </Link>

        <Link href={`/donors/${donor.id}/edit`} className="btn-secondary">
          <PencilIcon /> Edit Profile
        </Link>
      </div>
    </div>
  )
}
