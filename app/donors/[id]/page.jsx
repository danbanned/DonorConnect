'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAI } from '../../providers/AIProvider'
import {
  ArrowLeftIcon,
  PencilIcon,
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon,
  StopIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

import DonorHeader from '../../components/donors/DonorHeader'
import DonationHistory from '../../components/donations/DonationHistory'
import PledgeBox from '../../components/donors/PledgeBox'
import RelationshipNotes from '../../components/donors/RelationshipNotes'
import SuggestedActions from '../../components/donors/SuggestedActions'
import AddDonorForm from '../../components/donors/AddDonorForm'
import { getDonorById as fetchDonorById } from '../../../lib/api/donors'
import './DonorProfile.css'
import {useDonations} from  '../../hooks/usedonation'
import DonorRoleplay from '../../components/DonorRoleplay'
import DonorBrief from '../../components/DonorBrief'
import SimulationControls from '../../components/ai/SimulationControls'
//import AIDashboard from '../../dashboard/AiDashboard/page'
import donorDataContext from '../../../lib/donordatacontext'

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
  const { apiClient, status: aiStatus } = useAI()
  
  // Pass donorId to the hook to filter donations for this specific donor
  const { donations, loading: donationsLoading } = useDonations({ donorId })
  
  const [donor, setDonor] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState(null)

  // AI Features State
  const [showRoleplay, setShowRoleplay] = useState(false)
  const [showBrief, setShowBrief] = useState(false)
  const [activeSessions, setActiveSessions] = useState([])
  const [simulationStatus, setSimulationStatus] = useState({
    isRunning: false,
    progress: 0,
    elapsedTime: '0:00',
    donorsSimulated: 0,
    activitiesGenerated: 0
  })

  // Load donor data and AI features
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
          notes: donorData.personalNotes?.notes || donorData.notes || '',
        }

        setDonor(enhancedDonor)
        setShowAddForm(false)

        // Get AI insights
        const insightsData = await getDonorInsights(donorId)
        setInsights(insightsData)
        
        // Load AI features if API client is available
        if (apiClient) {
          loadAIFeatures(donorData, insightsData)
        }
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
  }, [donorId, donations, donationsLoading, apiClient])

  const loadAIFeatures = async (donorData, insightsData) => {
  try {
    // Load active roleplay sessions - FIXED METHOD NAME
    const sessionsResponse = await apiClient.fetchData('getRoleplaySessions', { 
      donorId,
      orgId: donorData.organizationId 
    });
    
    if (sessionsResponse.success) {
      setActiveSessions(sessionsResponse.data?.sessions || [])
    }

    // Load simulation status - FIXED METHOD NAME
    const simResponse = await apiClient.fetchData('getSimulationStats', {
      donorId,
      orgId: donorData.organizationId
    });
    
    if (simResponse.success) {
      setSimulationStatus(prev => ({
        ...prev,
        isRunning: simResponse.data?.status === 'RUNNING' || false,
        progress: simResponse.data?.activeDonors || 0,
        donorsSimulated: simResponse.data?.activeDonors || 0,
        activitiesGenerated: simResponse.data?.totalActivities || 0
      }))
    }

    // Enhance insights with AI analysis - FIXED METHOD NAME
    if (apiClient && donorData) {
      try {
        const aiAnalysis = await apiClient.fetchData('analyzeDonor', {
          donorId,
          orgId: donorData.organizationId
        });
        
        if (aiAnalysis.success && aiAnalysis.data) {
          setInsights(prev => ({
            ...prev,
            ...aiAnalysis.data,
            hasAIInsights: true
          }))
        }
      } catch (aiError) {
        console.log('AI analysis not available:', aiError)
      }
    }
  } catch (error) {
    console.error('Failed to load AI features:', error)
  }
}

  const handleAddDonorSuccess = (newDonorId) => {
    router.push(`/donors/${newDonorId}`)
  }

  const handleCancelAdd = () => {
    donorId === 'new' ? router.push('/donors') : setShowAddForm(false)
  }

  // AI Feature Handlers
  // In your page.jsx - Update handleStartRoleplay
const handleStartRoleplay = async () => {
  if (!donor) return;
  
  try {
    // Use direct POST request
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-org-id': donor.organizationId || 'default-org'
      },
      body: JSON.stringify({
        method: 'startRoleplay',
        params: {
          donorId,
          context: {
            topic: 'donor relationship',
            purpose: 'engagement'
          }
        }
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to start roleplay');
    }
    
    if (data.success) {
      setActiveSessions(prev => [data.data, ...prev]);
      setShowRoleplay(true);
    }
  } catch (error) {
    console.error('Error starting roleplay:', error);
    
    // Create a mock session for testing
    const mockSession = {
      sessionId: `mock_${Date.now()}_${donorId}`,
      donor: {
        id: donorId,
        name: `${donor.firstName} ${donor.lastName}`,
        email: donor.email
      },
      persona: {
        type: 'SUPPORTER',
        traits: ['generous'],
        communicationStyle: 'balanced',
        givingPattern: 'occasional',
        interests: ['general'],
        description: 'Supporter with general interests'
      },
      greeting: "Hello! Thanks for reaching out. I'm glad to connect.",
      context: {
        topic: 'donor relationship',
        purpose: 'engagement'
      },
      startedAt: new Date().toISOString(),
      isMock: true
    };
    
    setActiveSessions(prev => [mockSession, ...prev]);
    setShowRoleplay(true);
  }
};

  const handleGenerateBrief = async () => {
    setShowBrief(true)
  }

  const handleStartSimulation = async () => {
    if (!apiClient || !donor) return
    
    try {
      const response = await apiClient.fetchData('startSimulation', {
        donorId,
        orgId: donor.organizationId,
        settings: {
          speed: 'normal',
          activityTypes: ['donations', 'communications'],
          realism: 'high'
        }
      })
      
      if (response.success) {
        setSimulationStatus(prev => ({
          ...prev,
          isRunning: true,
          progress: 0,
          donorsSimulated: 0,
          activitiesGenerated: 0
        }))
        
        // Start polling for simulation updates
        const interval = setInterval(async () => {
          try {
            const simResponse = await apiClient.fetchData('getSimulationStats', {
              donorId,
              orgId: donor.organizationId
            })
            
            if (simResponse.success) {
              setSimulationStatus(prev => ({
                ...prev,
                progress: simResponse.data?.progress || prev.progress,
                donorsSimulated: simResponse.data?.activeDonors || 0,
                activitiesGenerated: simResponse.data?.totalActivities || 0
              }))
              
              // Stop polling if simulation is done
              if (simResponse.data?.status === 'STOPPED' || simResponse.data?.status === 'PAUSED') {
                clearInterval(interval)
                setSimulationStatus(prev => ({ ...prev, isRunning: false }))
              }
            }
          } catch (error) {
            console.error('Error polling simulation:', error)
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Error starting simulation:', error)
    }
  }

  const handleStopSimulation = async () => {
    if (!apiClient || !donor) return
    
    try {
      const response = await apiClient.fetchData('stopSimulation', {
        orgId: donor.organizationId
      })
      
      if (response.success) {
        setSimulationStatus(prev => ({ ...prev, isRunning: false }))
      }
    } catch (error) {
      console.error('Error stopping simulation:', error)
    }
  }

  // Check if donor has any pledges based on donation data
  const hasActivePledge = donations?.some(donation => 
    donation.type === 'RECURRING' || donation.isRecurring === true
  )

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
            frequency: 'Monthly',
            startDate: donations?.find(d => d.isRecurring)?.date,
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }}
        />
      )}

      <div className="tabs">
        {['overview', 'donations', 'communications', 'insights', 'notes', 'ai'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? 'Overview' : 
             tab === 'donations' ? 'Donation History' : 
             tab === 'communications' ? 'Communications' : 
             tab === 'insights' ? 'Analytics' : 
             tab === 'ai' ? 'AI Dashboard' : 'Notes'}
          </button>
        ))}
      </div>

      <AddTestDonationButton
        donorId={donor.id}
        organizationId={donor.organizationId}
        onAdded={(newDonation) => {
          console.log('Donation created:', newDonation)
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
                {insights.hasAIInsights && (
                  <div className="ai-enhanced-badge">
                    <SparklesIcon />
                    <span>AI Enhanced Insights</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No insights available yet</p>
            )}
          </div>
        ) : activeTab === 'ai' ? (
          <div className="ai-dashboard-container">
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

      {/* AI Modals */}
      {/*{showRoleplay && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <DonorRoleplay 
              donorId={donorId}
              donorName={`${donor.firstName} ${donor.lastName}`}
              onClose={() => setShowRoleplay(false)}
            />
          </div>
        </div>
      )}

   {/*  {showBrief && (
      <div className="modal-overlay">
        <div className="modal-content large">
          //<DonorBrief 
            //donorId={donorId}
            //organizationId={donor?.organizationId} // Pass organizationId
            //isOpen={showBrief}
            //onClose={() => setShowBrief(false)}
          />
        </div>
      </div>
    )}
      */}

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
  const [loading, setLoading] = useState(false)

  const handleAddDonation = async () => {
    setLoading(true)
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
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Test donation added: $${data.amount}`)
        onAdded?.(data)
      } else {
        alert('Failed to add donation: ' + data.error)
      }
    } catch (err) {
      console.error(err)
      alert('Error adding donation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddDonation}
      disabled={loading}
      className="btn-primary"
      style={{ margin: '10px 0' }}
    >
      {loading ? 'Adding...' : 'Add Test Donation'}
    </button>
  )
}