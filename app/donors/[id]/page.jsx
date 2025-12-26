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
import {useDonations} from  '../../hooks/usedonation'

async function getDonorInsights(id) {
  try {
    const res = await fetch(`/api/donors/${id}/insights`)
    if (!res.ok) throw new Error('No insights')
    return await res.json()
  } catch {
    // Return fallback insights structure that matches DonorHeader expectations
    return {
      engagementScore: 50,
      engagementLevel: 'Medium',
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
  
  // Pass donorId to the hook to filter donations for this specific donor
  const { donations, loading: donationsLoading } = useDonations({ donorId });
  console.log(donations,'donation for donor', donorId)
  
  const [donor, setDonor] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState(null)

  // Check if donor has any pledges based on donation data
  const hasActivePledge = donations?.some(donation => 
    donation.type === 'RECURRING' || donation.isRecurring === true
  )

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

        // Calculate statistics from the filtered donations
        const totalGiven = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
        const giftsCount = donations?.length || 0
        const lastGiftDate = donations?.length > 0 
          ? new Date(Math.max(...donations.map(d => new Date(d.date)))) 
          : null
        const lastDonation = donations?.length > 0 
          ? donations.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
          : null

        // Enhance donor data with calculated fields from donations
        const enhancedDonor = {
          ...donorData,
          totalGiven,
          giftsCount,
          lastGiftDate,
          lastDonation,
          // Add notes from personalNotes
          notes: donorData.personalNotes?.notes || donorData.notes || '',
        }

        setDonor(enhancedDonor)
        console.log('Enhanced donor data:', enhancedDonor)
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

    // Only load donor data when we have the donorId and donations have loaded
    if (donorId && !donationsLoading) {
      loadData()
    }
  }, [donorId, donations, donationsLoading])

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

      <DonorHeader 
        donor={donor} 
        insights={insights} 
        donations={donations || []}
      />

      {hasActivePledge && (
        <PledgeBox 
          pledge={{
            amount: donations?.find(d => d.isRecurring)?.amount || 0,
            frequency: 'Monthly', // You might want to get this from donation data
            startDate: donations?.find(d => d.isRecurring)?.date,
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          }}
        />
      )}

      <div className="tabs">
        {['overview', 'donations', 'communications', 'insights', 'notes'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? 'Overview' : 
             tab === 'donations' ? 'Donation History' : 
             tab === 'communications' ? 'Communications' : 
             tab === 'insights' ? 'Analytics' : 'Notes'}
          </button>
        ))}
      </div>

      <AddTestDonationButton
        donorId={donor.id}
        organizationId={donor.organizationId}
        onAdded={(newDonation) => {
          console.log('Donation created:', newDonation)
          // In a real app, you might want to refresh the donations here
          // For now, we'll just alert the user
          alert('Donation added! Refresh the page to see it in the list.')
        }}
      />

      <div className="tab-content">
        {activeTab === 'overview' ? (
          <div className="overview-grid">
            <div>
              <DonationHistory 
                donorId={donor.id} 
                donations={donations || []} 
              />
              <RelationshipNotes 
                donorId={donor.id}
                initialNotes={donor.personalNotes?.notes || donor.notes}
              />
              
              <div className="engagement-badge">
                <p className="text-sm font-medium text-gray-700">Engagement Score</p>
                <span
                  className={`badge ${
                    (insights?.engagementScore || 0) >= 75
                      ? 'badge-success'
                      : (insights?.engagementScore || 0) >= 50
                      ? 'badge-warning'
                      : 'badge-danger'
                  }`}
                >
                  {insights?.engagementLevel || 'Calculating...'}
                </span>
              </div>
            </div>
            <SuggestedActions donor={donor} insights={insights} />
          </div>
        ) : activeTab === 'donations' ? (
          <div className="card">
            <h3>Donation History</h3>
            {donations && donations.length > 0 ? (
              <div className="donation-list">
                {donations.map((donation, index) => (
                  <div key={donation.id || index} className="donation-item">
                    <div className="donation-info">
                      <div className="donation-amount">
                        ${donation.amount.toFixed(2)}
                      </div>
                      <div className="donation-date">
                        {new Date(donation.date).toLocaleDateString()}
                      </div>
                      {donation.notes && (
                        <div className="donation-notes">
                          {donation.notes}
                        </div>
                      )}
                      <div className="donation-method">
                        Method: {donation.paymentMethod?.replace('_', ' ') || 'Credit Card'}
                      </div>
                    </div>
                    <div className="donation-status">
                      <span className={`status-badge ${donation.status?.toLowerCase()}`}>
                        {donation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No donations yet</p>
            )}
          </div>
        ) : activeTab === 'notes' ? (
          <div className="card">
            <h3>Personal Notes</h3>
            {donor.personalNotes?.notes || donor.notes ? (
              <div className="notes-content">
                <p>{donor.personalNotes?.notes || donor.notes}</p>
              </div>
            ) : (
              <p className="text-gray-500">No personal notes available</p>
            )}
          </div>
        ) : activeTab === 'insights' ? (
          <div className="card">
            <h3>Analytics & Insights</h3>
            {insights ? (
              <div className="insights-content">
                <div className="insight-item">
                  <p className="insight-label">Engagement Score</p>
                  <div className="insight-value">{insights.engagementScore}%</div>
                  <p className="insight-description">{insights.engagementLevel} engagement</p>
                </div>
                <div className="insight-item">
                  <p className="insight-label">Giving Frequency</p>
                  <div className="insight-value">{insights.givingFrequency}</div>
                </div>
                <div className="insight-item">
                  <p className="insight-label">Suggested Ask Amount</p>
                  <div className="insight-value">${insights.suggestedAskAmount}</div>
                </div>
                <div className="insight-item">
                  <p className="insight-label">Next Best Action</p>
                  <div className="insight-value">{insights.nextBestAction}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No insights available yet</p>
            )}
          </div>
        ) : (
          <div className="card">
            <h3>Communications</h3>
            <p className="text-gray-500">No communications recorded yet</p>
            <Link href={`/communications?donorId=${donor.id}`} className="btn-secondary">
              <EnvelopeIcon /> Start a Conversation
            </Link>
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

export function AddTestDonationButton({ donorId, organizationId, onAdded }) {
  const [loading, setLoading] = useState(false);

  const handleAddDonation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          donorId, 
          organizationId,
          amount: 100,
          notes: 'Test donation added from UI',
          paymentMethod: 'CREDIT_CARD',
          status: 'COMPLETED',
          type: 'ONE_TIME'
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Test donation added: $${data.amount}`);
        onAdded?.(data);
      } else {
        alert('Failed to add donation: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error adding donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddDonation}
      disabled={loading}
      className="btn-primary"
      style={{ margin: '10px 0' }}
    >
      {loading ? 'Adding...' : 'Add Test Donation'}
    </button>
  );
}