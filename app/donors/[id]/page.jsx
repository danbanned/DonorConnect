'use client'

import { useState, useEffect, useCallback } from 'react'
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
  LightBulbIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

// ============ IMPORT NOTES CLIENT ============
import { notesClient } from '../../../lib/api/notes'

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

  // ============ NOTES STATE ============
  const [donorNotes, setDonorNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesCounts, setNotesCounts] = useState({})
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [noteFormData, setNoteFormData] = useState({
    source: 'DONOR',
    sourceId: donorId,
    donorId: donorId,
    content: '',
    title: ''
  })
  const [savingNote, setSavingNote] = useState(false)

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

  // ============ FETCH ALL NOTES FOR THIS DONOR ============
  const fetchDonorNotes = useCallback(async () => {
    if (!donorId) return;
    
    setNotesLoading(true);
    try {
      const response = await notesClient.getNotes({
        donorId,
        limit: 50,
        includeSimulated: false
      });

      if (response.success) {
        setDonorNotes(response.data.notes || []);
        setNotesCounts(response.data.counts || {});
      }
    } catch (error) {
      console.error('Error fetching donor notes:', error);
    } finally {
      setNotesLoading(false);
    }
  }, [donorId]);

  // ============ CREATE NEW NOTE ============
  const handleCreateNote = async (e) => {
    e.preventDefault();
    
    if (!noteFormData.content.trim()) {
      alert('Note content is required');
      return;
    }

    setSavingNote(true);
    try {
      const response = await notesClient.createNote({
        ...noteFormData,
        sourceId: donorId,
        donorId: donorId,
        source: 'DONOR'
      });

      if (response.success) {
        // Refresh notes list
        await fetchDonorNotes();
        
        // Reset form and close modal
        setNoteFormData({
          source: 'DONOR',
          sourceId: donorId,
          donorId: donorId,
          content: '',
          title: ''
        });
        setShowAddNoteModal(false);
        
        // Show success message
        alert('Note added successfully!');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert(`Failed to create note: ${error.message}`);
    } finally {
      setSavingNote(false);
    }
  };

  // ============ UPDATE NOTE ============
  const handleUpdateNote = async (note) => {
    if (!note.content?.trim()) return;
    
    try {
      const response = await notesClient.updateNote({
        source: note.source,
        sourceId: note.sourceId,
        content: note.content,
        title: note.title
      });

      if (response.success) {
        await fetchDonorNotes();
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert(`Failed to update note: ${error.message}`);
    }
  };

  // ============ DELETE NOTE ============
  const handleDeleteNote = async (note) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await notesClient.deleteNote(note.source, note.sourceId);
      
      if (response.success) {
        await fetchDonorNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(`Failed to delete note: ${error.message}`);
    }
  };

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

        // Parse personalNotes if it exists and is a string
        let parsedPersonalNotes = null
        if (donorData.personalNotes) {
          try {
            parsedPersonalNotes = typeof donorData.personalNotes === 'string' 
              ? JSON.parse(donorData.personalNotes) 
              : donorData.personalNotes
          } catch (e) {
            console.error('Failed to parse personalNotes:', e)
            parsedPersonalNotes = { notes: donorData.personalNotes }
          }
        }

        // Enhance donor data with calculated fields from donations
        const enhancedDonor = {
          ...donorData,
          totalGiven,
          giftsCount,
          lastGiftDate,
          lastDonation,
          notes: donorData.notes || '',
          personalNotes: parsedPersonalNotes || { notes: '' },
          plainNotes: donorData.notes || '',
          structuredNotes: parsedPersonalNotes || { notes: '' }
        }

        setDonor(enhancedDonor)
        setShowAddForm(false)

        // Get AI insights
        const insightsData = await getDonorInsights(donorId)
        setInsights(insightsData)
        
        // ============ FETCH NOTES USING NOTES CLIENT ============
        await fetchDonorNotes()
        
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
  }, [donorId, donations, donationsLoading, apiClient, fetchDonorNotes])

  const loadAIFeatures = async (donorData, insightsData) => {
    try {
      // Load active roleplay sessions
      const sessionsResponse = await apiClient.fetchData('getRoleplaySessions', { 
        donorId,
        orgId: donorData.organizationId 
      });
      
      if (sessionsResponse.success) {
        setActiveSessions(sessionsResponse.data?.sessions || [])
      }

      // Load simulation status
      const simResponse = await apiClient.fetchData('getSimulationStatus', {
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

      // Enhance insights with AI analysis
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
  const handleStartRoleplay = async () => {
    if (!donor) return;
    
    try {
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
            const simResponse = await apiClient.fetchData('getSimulationStatus', {
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

  // Helper function to get donor's notes in a consistent format
  const getDonorNotes = () => {
    if (!donor) return { plain: '', structured: null }
    
    // Get plain notes from notes field
    const plainNotes = donor.notes || ''
    
    // Get structured notes from personalNotes
    let structuredNotes = null
    if (donor.personalNotes) {
      try {
        structuredNotes = typeof donor.personalNotes === 'string' 
          ? JSON.parse(donor.personalNotes) 
          : donor.personalNotes
      } catch (e) {
        structuredNotes = { notes: donor.personalNotes }
      }
    }
    
    return { plain: plainNotes, structured: structuredNotes }
  }

  // Filter notes by source for display
  const donationNotes = donorNotes.filter(note => note.source === 'DONATION');
  const communicationNotes = donorNotes.filter(note => note.source === 'COMMUNICATION');
  const meetingNotes = donorNotes.filter(note => note.source === 'MEETING');
  const taskNotes = donorNotes.filter(note => note.source === 'TASK');

  // Check if donor has any pledges based on donation data
  const hasActivePledge = donations?.some(donation => 
    donation.type === 'RECURRING' || donation.isRecurring === true
  )

  // Format date for notes
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

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

  const { plain: donorPlainNotes, structured: donorStructuredNotes } = getDonorNotes()

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
        {['overview', 'donations', 'communications', 'notes', 'insights', 'ai'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? 'Overview' : 
             tab === 'donations' ? 'Donation History' : 
             tab === 'communications' ? 'Communications' : 
             tab === 'notes' ? 'Notes' :
             tab === 'insights' ? 'Analytics' : 
             'AI Dashboard'}
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
              
              {/* ============ NOTES SECTION IN OVERVIEW - USING NOTES CLIENT ============ */}
              {donorNotes.length > 0 && (
                <div className="card notes-card">
                  <div className="card-header">
                    <DocumentTextIcon className="icon" />
                    <h3>Recent Notes</h3>
                    <button 
                      onClick={() => setActiveTab('notes')}
                      className="btn-link"
                    >
                      View All Notes ({donorNotes.length})
                    </button>
                    <button
                      onClick={() => setShowAddNoteModal(true)}
                      className="btn-primary btn-small"
                    >
                      <PlusIcon className="icon-small" />
                      Add Note
                    </button>
                  </div>
                  <div className="notes-preview">
                    {notesLoading ? (
                      <div className="loading-spinner-small">Loading notes...</div>
                    ) : (
                      donorNotes.slice(0, 3).map((note) => (
                        <div key={note.id} className="note-item">
                          <div className="note-header">
                            <span className="note-source-badge" data-source={note.source}>
                              {note.source}
                            </span>
                            {note.title && <span className="note-title">{note.title}</span>}
                          </div>
                          <p className="note-content">{note.content.substring(0, 150)}</p>
                          <div className="note-footer">
                            <span className="note-date">
                              <ClockIcon className="icon-tiny" />
                              {formatDate(note.updatedAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Keep original donor notes for backward compatibility */}
              {(donorPlainNotes || donorStructuredNotes) && (
                <div className="card notes-card">
                  <div className="card-header">
                    <DocumentTextIcon className="icon" />
                    <h3>Donor Profile Notes</h3>
                    <Link href={`/donors/${donor.id}/edit`} className="btn-link">
                      Edit Notes
                    </Link>
                  </div>
                  <div className="notes-preview">
                    {donorStructuredNotes?.notes && (
                      <div className="note-item">
                        <p className="note-content">{donorStructuredNotes.notes}</p>
                        {donorStructuredNotes.category && (
                          <span className="note-category">{donorStructuredNotes.category}</span>
                        )}
                      </div>
                    )}
                    {!donorStructuredNotes?.notes && donorPlainNotes && (
                      <div className="note-item">
                        <p className="note-content">{donorPlainNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <RelationshipNotes 
                donorId={donor.id}
                initialNotes={donor.plainNotes || donorStructuredNotes?.notes}
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
            
            {/* ============ DONATION NOTES SECTION ============ */}
            {donationNotes.length > 0 && (
              <div className="donation-notes-section">
                <h4>Donation Notes</h4>
                <div className="notes-list">
                  {donationNotes.map((note) => (
                    <div key={note.id} className="note-card compact">
                      <p className="note-content">{note.content}</p>
                      <div className="note-meta">
                        {note.amount && <span className="note-amount">${note.amount}</span>}
                        <span className="note-date">{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'notes' ? (
          <div className="notes-section">
            {/* ============ ADD NOTE BUTTON ============ */}
            <div className="notes-actions">
              <button
                onClick={() => setShowAddNoteModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="icon" />
                Add New Note
              </button>
              <button
                onClick={fetchDonorNotes}
                className="btn-secondary"
                disabled={notesLoading}
              >
                <SparklesIcon className={`icon ${notesLoading ? 'spinning' : ''}`} />
                Refresh Notes
              </button>
            </div>

            {/* ============ NOTES SUMMARY STATS ============ */}
            <div className="notes-summary">
              <div className="summary-card">
                <DocumentTextIcon className="summary-icon" />
                <span className="summary-count">{donorNotes.length}</span>
                <span className="summary-label">Total Notes</span>
              </div>
              <div className="summary-card">
                <CurrencyDollarIcon className="summary-icon" />
                <span className="summary-count">{donationNotes.length}</span>
                <span className="summary-label">Donation Notes</span>
              </div>
              <div className="summary-card">
                <EnvelopeIcon className="summary-icon" />
                <span className="summary-count">{communicationNotes.length}</span>
                <span className="summary-label">Communications</span>
              </div>
              <div className="summary-card">
                <CalendarIcon className="summary-icon" />
                <span className="summary-count">{meetingNotes.length}</span>
                <span className="summary-label">Meeting Notes</span>
              </div>
            </div>

            {/* ============ ALL NOTES FROM NOTES CLIENT ============ */}
            <div className="all-notes">
              <h3>All Notes ({donorNotes.length})</h3>
              
              {notesLoading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading notes...</p>
                </div>
              ) : donorNotes.length === 0 ? (
                <div className="card empty-notes">
                  <DocumentTextIcon className="icon-muted" />
                  <h3>No Notes Yet</h3>
                  <p className="text-gray-500">
                    Add notes to keep track of important information about this donor.
                  </p>
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="btn-primary"
                  >
                    <PlusIcon /> Add First Note
                  </button>
                </div>
              ) : (
                <div className="notes-grid">
                  {donorNotes.map((note) => (
                    <div key={note.id} className="card note-card">
                      <div className="note-card-header">
                        <div className="note-source-badge" data-source={note.source}>
                          {note.source}
                        </div>
                        <div className="note-card-actions">
                          <button
                            onClick={() => {
                              const updatedContent = prompt('Edit note:', note.content);
                              if (updatedContent && updatedContent !== note.content) {
                                handleUpdateNote({
                                  ...note,
                                  content: updatedContent
                                });
                              }
                            }}
                            className="btn-icon"
                            title="Edit note"
                          >
                            <PencilIcon className="icon-small" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note)}
                            className="btn-icon btn-delete"
                            title="Delete note"
                          >
                            <DocumentDuplicateIcon className="icon-small" />
                          </button>
                        </div>
                      </div>
                      
                      {note.title && (
                        <h4 className="note-title">{note.title}</h4>
                      )}
                      
                      <div className="note-content">
                        <p>{note.content}</p>
                      </div>
                      
                      <div className="note-card-footer">
                        <div className="note-donor-info">
                          <UserCircleIcon className="icon-tiny" />
                          <span>{note.donorName || 'This donor'}</span>
                        </div>
                        
                        {note.amount && (
                          <span className="note-amount-badge">
                            <CurrencyDollarIcon className="icon-tiny" />
                            ${note.amount.toLocaleString()}
                          </span>
                        )}
                        
                        <span className="note-timestamp">
                          <ClockIcon className="icon-tiny" />
                          {formatDate(note.updatedAt)}
                        </span>
                      </div>
                      
                      {/* Related entity info */}
                      {note.campaign && (
                        <div className="note-related">
                          <span className="related-label">Campaign:</span>
                          <span className="related-value">{note.campaign.name}</span>
                        </div>
                      )}
                      {note.meetingStatus && (
                        <div className="note-related">
                          <span className="related-label">Meeting Status:</span>
                          <span className="related-value">{note.meetingStatus}</span>
                        </div>
                      )}
                      {note.taskPriority && (
                        <div className="note-related">
                          <span className="related-label">Priority:</span>
                          <span className={`priority-badge priority-${note.taskPriority.toLowerCase()}`}>
                            {note.taskPriority}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Original donor notes section - keep for backward compatibility */}
            <div className="legacy-notes">
              <h4>Donor Profile Notes</h4>
              {/* Plain Notes Card */}
              {donorPlainNotes && (
                <div className="card notes-card">
                  <div className="card-header">
                    <DocumentTextIcon className="icon" />
                    <h3>General Notes</h3>
                    <span className="badge badge-info">Plain Text</span>
                  </div>
                  <div className="notes-content">
                    <p className="note-text">{donorPlainNotes}</p>
                  </div>
                </div>
              )}

              {/* Structured Personal Notes Card */}
              {donorStructuredNotes && (
                <div className="card notes-card">
                  <div className="card-header">
                    <DocumentDuplicateIcon className="icon" />
                    <h3>Personal Notes</h3>
                    <span className="badge badge-success">Structured</span>
                  </div>
                  <div className="notes-content structured-notes">
                    {Object.entries(donorStructuredNotes).map(([key, value]) => {
                      if (value && typeof value === 'string' && value.trim()) {
                        return (
                          <div key={key} className="note-field">
                            <span className="note-label">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                            </span>
                            <span className="note-value">{value}</span>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              )}
            </div>
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
            {/* AI Dashboard content */}
          </div>
        ) : (
          <div className="card">
            <h3>Communications</h3>
            <p className="text-gray-500">No communications recorded yet</p>
            <Link href={`/communications?donorId=${donor.id}`} className="btn-secondary">
              <EnvelopeIcon /> Start a Conversation
            </Link>
            
            {/* ============ COMMUNICATION NOTES ============ */}
            {communicationNotes.length > 0 && (
              <div className="communication-notes-section">
                <h4>Communication History</h4>
                <div className="notes-list">
                  {communicationNotes.map((note) => (
                    <div key={note.id} className="note-card compact">
                      <div className="note-header">
                        <span className="communication-direction" data-direction={note.direction}>
                          {note.direction}
                        </span>
                        <span className="communication-type">{note.communicationType}</span>
                      </div>
                      <p className="note-content">{note.content}</p>
                      <div className="note-meta">
                        <span className="note-date">{formatDate(note.sentAt || note.createdAt)}</span>
                        {note.createdBy && (
                          <span className="note-user">by {note.createdBy.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ ADD NOTE MODAL ============ */}
      {showAddNoteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Note</h3>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateNote} className="modal-form">
              <div className="form-group">
                <label htmlFor="noteTitle">Title (Optional)</label>
                <input
                  type="text"
                  id="noteTitle"
                  value={noteFormData.title}
                  onChange={(e) => setNoteFormData({ ...noteFormData, title: e.target.value })}
                  placeholder="Brief title for this note"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="noteContent">Note Content *</label>
                <textarea
                  id="noteContent"
                  value={noteFormData.content}
                  onChange={(e) => setNoteFormData({ ...noteFormData, content: e.target.value })}
                  placeholder="Enter your note..."
                  rows={6}
                  className="form-textarea"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="btn-primary"
                >
                  {savingNote ? (
                    <>
                      <span className="spinner-small" />
                      Saving...
                    </>
                  ) : (
                    'Save Note'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Modals */}
      {showRoleplay && (
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

      {showBrief && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <DonorBrief 
              donorId={donorId}
              organizationId={donor?.organizationId}
              isOpen={showBrief}
              onClose={() => setShowBrief(false)}
            />
          </div>
        </div>
      )}

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
        
        <button
          onClick={() => setShowAddNoteModal(true)}
          className="btn-secondary"
        >
          <DocumentTextIcon /> Add Note
        </button>
      </div>

      {/* Add Notes Styles */}
      <style jsx>{`
        .notes-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .notes-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .notes-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .summary-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        
        .summary-icon {
          width: 24px;
          height: 24px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        
        .summary-count {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
        }
        
        .summary-label {
          font-size: 12px;
          color: #6b7280;
        }
        
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .note-card {
          padding: 20px;
          transition: all 0.2s;
        }
        
        .note-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .note-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .note-source-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .note-source-badge[data-source="DONOR"] {
          background: #e0f2fe;
          color: #0369a1;
        }
        
        .note-source-badge[data-source="DONATION"] {
          background: #dcfce7;
          color: #166534;
        }
        
        .note-source-badge[data-source="COMMUNICATION"] {
          background: #f3e8ff;
          color: #6b21a8;
        }
        
        .note-source-badge[data-source="MEETING"] {
          background: #fff7ed;
          color: #9a3412;
        }
        
        .note-source-badge[data-source="TASK"] {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .note-card-actions {
          display: flex;
          gap: 4px;
        }
        
        .btn-icon {
          padding: 6px;
          background: none;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: #6b7280;
        }
        
        .btn-icon:hover {
          background: #f3f4f6;
          color: #111827;
        }
        
        .btn-icon.btn-delete:hover {
          background: #fef2f2;
          color: #dc2626;
        }
        
        .icon-small,
        .icon-tiny {
          width: 16px;
          height: 16px;
        }
        
        .note-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 12px 0;
        }
        
        .note-content {
          margin-bottom: 16px;
        }
        
        .note-content p {
          margin: 0;
          white-space: pre-wrap;
          line-height: 1.6;
          color: #1f2937;
        }
        
        .note-card-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
        }
        
        .note-donor-info,
        .note-timestamp {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .note-amount-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          background: #f3f4f6;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .note-related {
          margin-top: 12px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .related-label {
          color: #6b7280;
        }
        
        .related-value {
          font-weight: 500;
        }
        
        .priority-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .priority-low {
          background: #e0f2fe;
          color: #0369a1;
        }
        
        .priority-medium {
          background: #fef9c3;
          color: #854d0e;
        }
        
        .priority-high {
          background: #fee2e2;
          color: #b91c1c;
        }
        
        .priority-urgent {
          background: #fecaca;
          color: #991b1b;
        }
        
        .communication-direction {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .communication-direction[data-direction="INBOUND"] {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .communication-direction[data-direction="OUTBOUND"] {
          background: #f3e8ff;
          color: #6b21a8;
        }
        
        .communication-type {
          font-size: 11px;
          color: #6b7280;
        }
        
        .loading-state {
          text-align: center;
          padding: 48px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        
        .spinner-small {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .btn-small {
          padding: 4px 8px;
          font-size: 12px;
        }
        
        .modal-form {
          padding: 20px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        
        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }
        
        .legacy-notes {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
        
        .legacy-notes h4 {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 16px;
        }
      `}</style>
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