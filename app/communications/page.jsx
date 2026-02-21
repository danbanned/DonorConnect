'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  VideoCameraIcon,
  PencilIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  TrashIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import './communications.css'
import TemplatesSection from '../components/communications/TemplatesSection'
import { templates as templateLibrary } from '../../lib/templates'
import { useDonations } from '../hooks/usedonation.js'
import ScheduleMeetingForm from '../components/communications/ScheduleMeetingForm'

const communicationTypes = [
  { id: 'all', name: 'All Communications', icon: ChatBubbleLeftRightIcon },
  { id: 'email', name: 'Emails', icon: EnvelopeIcon },
  { id: 'phone', name: 'Phone Calls', icon: PhoneIcon },
  { id: 'meeting', name: 'Meetings', icon: CalendarIcon },
  { id: 'thankyou', name: 'Thank You Notes', icon: CheckCircleIcon },
]

// Template categories for quick access
const templateCategories = [
  { id: 'thank_you', name: 'Thank You', description: 'Express gratitude for donations', count: 0 },
  { id: 'follow_up', name: 'Follow Up', description: 'Follow up on recent interactions', count: 0 },
  { id: 'recurring', name: 'Recurring Giving', description: 'Manage recurring donations', count: 0 },
  { id: 'event', name: 'Event Invitations', description: 'Invite donors to events', count: 0 },
  { id: 'year_end', name: 'Year-End Giving', description: 'End of year campaigns', count: 0 },
  { id: 'acknowledgment', name: 'Acknowledgments', description: 'Receipts and tax letters', count: 0 },
]

export default function CommunicationsPage() {
  const router = useRouter()
  const [communications, setCommunications] = useState([])
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [meetingsLoading, setMeetingsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [timeframe, setTimeframe] = useState('30days')
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [donors, setDonors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDonors, setFilteredDonors] = useState([])
  const [activeTab, setActiveTab] = useState('communications')
  
  // New meeting states
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false)
  const [selectedDonorId, setSelectedDonorId] = useState(null)
  const [creatingZoom, setCreatingZoom] = useState(false)
  
  // Template modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('thank_you')
  const [templateTemplates, setTemplateTemplates] = useState([])
  const [templateSearch, setTemplateSearch] = useState('')
  
  // Existing modal states
  const [showChatModal, setShowChatModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Chat states
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredContact: 'EMAIL',
    relationshipStage: 'NEW',
    status: 'ACTIVE',
    notes: ''
  })

  const { donations, summary, loading: donationsLoading, error: donationsError } = useDonations({ 
    timeframe,
    limit: 1000
  })

  const safeTimeframe = timeframe || "30d"


  // Fetch donors, communications, and meetings
  useEffect(() => {

    async function loadData() {
      try {
        setLoading(true)
        
        // Fetch donors
        const donorsRes = await fetch('/api/donors/directory')
        if (donorsRes.ok) {
          const donorsData = await donorsRes.json()
          setDonors(donorsData)
          setFilteredDonors(donorsData.slice(0, 10))
        }
        
        // Fetch communications
        const commsRes = await fetch(`/api/communications?timeframe=${safeTimeframe}`)
        if (commsRes.ok) {
          const commsData = await commsRes.json()
          setCommunications(commsData.communications)
          console.log('Communications loaded successfully!', commsData)
        }

        



        // Fetch meetings
        await loadMeetings()

        setTemplateTemplates(templateLibrary)

      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [timeframe])


  // Filter donors based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDonors(donors.slice(0, 10))
    } else {
      const filtered = donors.filter(donor => {
        const fullName = `${donor.firstName} ${donor.lastName}`.toLowerCase()
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          donor.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }).slice(0, 10)
      setFilteredDonors(filtered)
    }
  }, [searchTerm, donors])

  // Load chat messages when donor is selected
  useEffect(() => {
    if (selectedDonor && showChatModal) {
      loadChatMessages(selectedDonor.id)
    }
  }, [selectedDonor, showChatModal])

  // Load meetings
  const loadMeetings = async () => {
    try {
      setMeetingsLoading(true)
      const response = await fetch('/api/communications/meetings')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMeetings(result.meetings || [])
        } else {
          console.error('Failed to load meetings:', result.error)
          setMeetings([])
        }
      } else {
        console.error('Failed to load meetings:', response.status)
        setMeetings([])
      }
    } catch (error) {
      console.error('Failed to load meetings:', error)
      setMeetings([])
    } finally {
      setMeetingsLoading(false)
    }
  }

  const loadChatMessages = async (donorId) => {
    try {
      const res = await fetch(`/api/communications?donorId=${donorId}`)
      if (res.ok) {
        const data = await res.json()
        const comms = data?.communications || []
        setMessages(comms.length > 0 ? comms : getSampleMessages())
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages(getSampleMessages())
    }
  }

  const getSampleMessages = () => [
    {
      id: 1,
      content: "Thank you for your recent donation!",
      direction: 'outbound',
      type: 'EMAIL',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'SENT'
    },
    {
      id: 2,
      content: "You're welcome! Looking forward to your next event.",
      direction: 'inbound',
      type: 'EMAIL',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      status: 'SENT'
    }
  ]

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedDonor) return

    const tempMessage = {
      id: Date.now(),
      content: newMessage,
      direction: 'outbound',
      type: 'EMAIL',
      timestamp: new Date().toISOString(),
      status: 'SENDING'
    }

    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')

    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: selectedDonor.id,
          content: newMessage,
          type: 'EMAIL',
          direction: 'OUTBOUND',
          subject: `Message to ${selectedDonor.firstName}`
        })
      })

      if (response.ok) {
        const savedMessage = await response.json()
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? { ...savedMessage, status: 'SENT' } : msg
        ))
        
        // Refresh communications list
        const commsRes = await fetch(`/api/communications?timeframe=${safeTimeframe}`)
        if (commsRes.ok) {
          const commsData = await commsRes.json()
          setCommunications(commsData.communications || [])
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? { ...msg, status: 'FAILED' } : msg
      ))
    }
  }

  const handleEditDonor = async (e) => {
    e.preventDefault()
    if (!selectedDonor) return

    try {
      const response = await fetch(`/api/donors/${selectedDonor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      if (response.ok) {
        const updatedDonor = await response.json()
        
        // Update donors list
        setDonors(prev => prev.map(d => 
          d.id === updatedDonor.id ? updatedDonor : d
        ))
        
        setShowEditModal(false)
        alert('Donor updated successfully!')
      }
    } catch (error) {
      console.error('Error updating donor:', error)
      alert('Failed to update donor')
    }
  }

  // Handle meeting scheduled callback
  const handleMeetingScheduled = async (meetingData) => {
    try {
      console.log('Meeting scheduled:', meetingData)
      
      // Refresh meetings list
      await loadMeetings()
      
      // Refresh communications
      const commsRes = await fetch(`/api/communications?timeframe=${safeTimeframe}`)
      if (commsRes.ok) {
        const commsData = await commsRes.json()
        setCommunications(commsData.communications || [])
      }
      
      // Close schedule modal
      setShowScheduleMeeting(false)
      
      alert('Meeting scheduled successfully!')
      
    } catch (error) {
      console.error('Failed to handle scheduled meeting:', error)
      alert('Failed to refresh meetings list')
    }
  }

  // Create Zoom meeting and save to database
  const createZoomMeeting = async () => {
    try {
      setCreatingZoom(true)
      
      // If donor is selected, use it; otherwise get first available donor
      let selectedDonorForMeeting = selectedDonor
      
      if (!selectedDonorForMeeting && donors.length > 0) {
        selectedDonorForMeeting = donors[0]
        setSelectedDonor(selectedDonorForMeeting)
      }
      
      // Validate donor selection
      if (!selectedDonorForMeeting) {
        alert('Please select a donor first')
        setCreatingZoom(false)
        return
      }
      
      const donorName = `${selectedDonorForMeeting.firstName} ${selectedDonorForMeeting.lastName}`
      const donorId = selectedDonorForMeeting.id
      
      const topic = `Meeting with ${donorName}`
      const startTime = new Date(Date.now() + 86400000).toISOString() // Tomorrow
      
      // Validate required fields
      if (!donorId) {
        throw new Error('Missing donor ID')
      }
      if (!startTime || isNaN(new Date(startTime).getTime())) {
        throw new Error('Invalid start time')
      }
      
      try {
        // 1. Create Zoom meeting via Zoom API
        const zoomResponse = await fetch('/api/zoom/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic,
            startTime,
            duration: 30,
            donorName: donorName
          }),
        })

        const zoomResult = await zoomResponse.json()
        
        if (!zoomResponse.ok) {
          throw new Error(zoomResult?.error || 'Zoom API failed')
        }

        // Prepare meeting data
        const meetingData = {
          donorId: donorId,
          title: topic.trim(),
          description: 'Quick Zoom meeting created from communications page',
          startTime: startTime,
          duration: 30,
          meetingType: 'VIRTUAL',
          zoomMeetingId: zoomResult.meeting?.id,
          zoomJoinUrl: zoomResult.meeting?.join_url,
          zoomStartUrl: zoomResult.meeting?.start_url,
          notes: 'Auto-generated quick Zoom meeting',
          status: 'SCHEDULED'
        }

        console.log('Sending meeting data:', meetingData)
        
        // 2. Save to database using meetings API
        const meetingResponse = await fetch('/api/communications/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meetingData),
        })

        const meetingResult = await meetingResponse.json()
        
        if (!meetingResponse.ok) {
          throw new Error(meetingResult?.error || 'Failed to save meeting')
        }

        alert(`Zoom meeting created successfully!\nJoin URL: ${zoomResult.meeting.join_url}`)
        await loadMeetings()

      } catch (zoomError) {
        // If Zoom fails, still create a meeting without Zoom link
        console.log('Zoom failed, creating meeting without Zoom:', zoomError.message)
        
        // Prepare meeting data without Zoom info
        const meetingData = {
          donorId: donorId,
          title: 'Quick Meeting',
          description: 'Meeting created from communications page',
          startTime: startTime,
          duration: 30,
          meetingType: 'VIRTUAL',
          notes: 'Auto-generated meeting (Zoom not configured)',
          status: 'SCHEDULED'
        }
        
        const meetingResponse = await fetch('/api/communications/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meetingData),
        })

        const meetingResult = await meetingResponse.json()
        
        if (meetingResponse.ok) {
          alert('Meeting created successfully! (Zoom not configured)')
          await loadMeetings()
        } else {
          throw new Error(meetingResult?.error || 'Failed to save meeting')
        }
      }

    } catch (error) {
      console.error('Meeting creation error:', error)
      alert(error.message || 'Failed to create meeting. Please try again.')
    } finally {
      setCreatingZoom(false)
    }
  }



  // Delete meeting
  const deleteMeeting = async (meetingId) => {
    if (confirm('Are you sure you want to cancel this meeting?')) {
      try {
        const response = await fetch(`/api/communications/meetings?id=${meetingId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            await loadMeetings()
            alert('Meeting cancelled successfully')
          } else {
            throw new Error(result.error || 'Failed to delete meeting')
          }
        } else {
          throw new Error('Failed to delete meeting')
        }
      } catch (error) {
        console.error('Failed to delete meeting:', error)
        alert(error.message || 'Failed to cancel meeting')
      }
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'EMAIL': return EnvelopeIcon
      case 'PHONE_CALL': return PhoneIcon
      case 'MEETING': return CalendarIcon
      case 'THANK_YOU_NOTE': return CheckCircleIcon
      default: return ChatBubbleLeftRightIcon
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return 'badge-success'
      case 'DRAFT':
        return 'badge-warning'
      case 'FAILED':
      case 'BOUNCED':
        return 'badge-danger'
      default:
        return 'badge-info'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleDonorSelect = (donor) => {
    setSelectedDonor(donor)
    setSelectedDonorId(donor.id)
    setEditFormData({
      firstName: donor.firstName,
      lastName: donor.lastName,
      email: donor.email || '',
      phone: donor.phone || '',
      preferredContact: donor.preferredContact || 'EMAIL',
      relationshipStage: donor.relationshipStage || 'NEW',
      status: donor.status || 'ACTIVE',
      notes: donor.notes || ''
    })
  }

  // Template functions
  const handleUseTemplate = (template) => {
    if (!selectedDonor) {
      alert('Please select a donor first to use a template')
      return
    }
    
    // Pre-fill the chat modal with template content
    const filledContent = template.content
      .replace(/{{firstName}}/g, selectedDonor.firstName || '[Donor First Name]')
      .replace(/{{lastName}}/g, selectedDonor.lastName || '[Donor Last Name]')
      .replace(/{{fullName}}/g, `${selectedDonor.firstName} ${selectedDonor.lastName}` || '[Donor Name]')
      .replace(/{{amount}}/g, selectedDonor.lastDonationAmount ? `$${selectedDonor.lastDonationAmount}` : '$[Amount]')
      .replace(/{{date}}/g, new Date().toLocaleDateString())
    
    setNewMessage(filledContent)
    setShowChatModal(true)
    setShowTemplateModal(false)
  }

  const handleSendWithTemplate = async (template) => {
    if (!selectedDonor) {
      alert('Please select a donor first')
      return
    }

    const filledContent = template.content
      .replace(/{{firstName}}/g, selectedDonor.firstName || '[Donor First Name]')
      .replace(/{{lastName}}/g, selectedDonor.lastName || '[Donor Last Name]')
      .replace(/{{fullName}}/g, `${selectedDonor.firstName} ${selectedDonor.lastName}` || '[Donor Name]')
      .replace(/{{amount}}/g, selectedDonor.lastDonationAmount ? `$${selectedDonor.lastDonationAmount}` : '$[Amount]')
      .replace(/{{date}}/g, new Date().toLocaleDateString())

    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: selectedDonor.id,
          content: filledContent,
          type: 'EMAIL',
          direction: 'OUTBOUND',
          subject: template.subject || `Message from your organization`,
          templateId: template.id
        })
      })

      if (response.ok) {
        alert('Message sent successfully using template!')
        // Refresh communications
        const commsRes = await fetch(`/api/communications?timeframe=${safeTimeframe}`)
        if (commsRes.ok) {
          const commsData = await commsRes.json()
          setCommunications(commsData.communications || [])
        }
      }
    } catch (error) {
      console.error('Error sending template message:', error)
      alert('Failed to send message')
    }
  }

  const filteredTemplates = templateTemplates.filter(template => {
    const name = template.name?.toLowerCase() ?? ''
    const content = template.content?.toLowerCase() ?? ''
    const category = template.category?.toLowerCase() ?? ''
    const search = templateSearch.toLowerCase()

    return (
      name.includes(search) ||
      content.includes(search) ||
      category.includes(search)
    )
  })

  // Sort meetings by date (most recent first)
  const sortedMeetings = [...meetings].sort((a, b) => 
    new Date(b.startTime) - new Date(a.startTime)
  )

  // Get recent meetings (last 5)
  const recentMeetings = sortedMeetings.slice(0, 5)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading communications...</p>
      </div>
    )
  }

  return (
    <div className="communications-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Communications</h1>
          <p className="subtitle">
            Track all donor interactions and communications
          </p>
        </div>

        <div className="header-actions">
          <button 
            onClick={() => setShowScheduleMeeting(true)}
            className="btn-primary"
          >
            <VideoCameraIcon className="icon" />
            Schedule Meeting
          </button>

          <button 
            onClick={() => router.push('/communications/new')} 
            className="btn-secondary"
          >
            <EnvelopeIcon className="icon" />
            New Email
          </button>

          <button 
            onClick={() => setShowTemplateModal(true)}
            className="btn-secondary"
          >
            <DocumentDuplicateIcon className="icon" />
            Use Template
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-grid">
       {/* Left Column - Donors List */}
        <div className="donors-sidebar">
          <div className="donor-search">
            <input
              type="text"
              placeholder="Search donors..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="donors-list">
            {filteredDonors.map(donor => (
              <div
                key={donor.id}
                className={`donor-item ${selectedDonor?.id === donor.id ? 'selected' : ''}`}
                onClick={() => handleDonorSelect(donor)}
              >
                <div className="donor-avatar">
                  {donor.firstName.charAt(0)}{donor.lastName.charAt(0)}
                </div>
                <div className="donor-info">
                  <h4>{donor.firstName} {donor.lastName}</h4>
                  <p className="donor-email">{donor.email || 'No email'}</p>
                  <span className={`donor-status status-${donor.status?.toLowerCase()}`}>
                    {donor.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ADD THIS: Quick Meeting Section - Appears below donors list */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <VideoCameraIcon className="icon" />
              Quick Actions
            </h3>
            <div className="quick-actions">
              <button
                onClick={createZoomMeeting}
                disabled={creatingZoom || !selectedDonor}
                className="quick-action-btn btn-primary"
              >
                {creatingZoom ? (
                  <>
                    <div className="spinner-small" />
                    Creating Zoom...
                  </>
                ) : (
                  <>
                    <VideoCameraIcon className="icon" />
                    Quick Zoom with {selectedDonor ? selectedDonor.firstName : 'Donor'}
                  </>
                )}
              </button>
              
              {selectedDonor && (
                <button
                  onClick={() => setShowScheduleMeeting(true)}
                  className="quick-action-btn btn-secondary"
                >
                  <CalendarIcon className="icon" />
                  Schedule Meeting with {selectedDonor.firstName}
                </button>
              )}
            </div>
          </div>

          {/* ADD THIS: Recent Meetings Section - Appears below Quick Actions */}
          {recentMeetings.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <CalendarIcon className="icon" />
                Recent Meetings
              </h3>
              <div className="recent-meetings">
                {recentMeetings.map(meeting => (
                  <div key={meeting.id} className="recent-meeting-item">
                    <div className="meeting-info">
                      <strong>{meeting.title}</strong>
                      <small>with {meeting.donor?.firstName} {meeting.donor?.lastName}</small>
                      <div className="meeting-time">
                        <ClockIcon className="icon" />
                        {new Date(meeting.startTime).toLocaleDateString()} at{' '}
                        {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {meeting.zoomJoinUrl && (
                      <a 
                        href={meeting.zoomJoinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="zoom-link"
                      >
                        <VideoCameraIcon className="icon" />
                        Join
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* You can also add a "View All Meetings" link */}
          <div className="sidebar-footer">
            <button 
              onClick={() => setActiveTab('meetings')}
              className="view-all-link"
            >
              View All Meetings →
            </button>
          </div>
        </div>


        {/* Right Column - Main Content with Tabs */}
        <div className="communications-main">
          {/* Main Content Tabs */}
          <div className="main-content-tabs">
            <button 
              className={`content-tab ${activeTab === 'communications' ? 'active' : ''}`}
              onClick={() => setActiveTab('communications')}
            >
              <ChatBubbleLeftRightIcon className="icon" />
              Communications
            </button>
            <button 
              className={`content-tab ${activeTab === 'meetings' ? 'active' : ''}`}
              onClick={() => setActiveTab('meetings')}
            >
              <CalendarIcon className="icon" />
              Meetings
            </button>
            <button 
              className={`content-tab ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              <DocumentDuplicateIcon className="icon" />
              Email & Message Templates
            </button>
            <button 
              className={`content-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <ClockIcon className="icon" />
              Sent History
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'communications' && (
            <div className="tab-content">
              {/* Filters */}
              <div className="filters-section">
                <div className="type-filters">
                  {communicationTypes.map(type => {
                    const Icon = type.icon
                    const isActive = selectedType === type.id

                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`type-filter ${isActive ? 'active' : ''}`}
                      >
                        <Icon className="icon" />
                        {type.name}
                      </button>
                    )
                  })}
                </div>

                <select 
                  className="timeframe-select"
                  value={safeTimeframe} 
                  onChange={e => setTimeframe(e.target.value)}
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="year">This year</option>
                </select>
              </div>

              {/* Communications List */}
              <div className="communications-list">
                {(Array.isArray(communications) ? communications : [])
                  .filter(comm => selectedType === 'all' || comm.type === selectedType.toUpperCase())
                  .map(comm => {
                    const Icon = getTypeIcon(comm.type)
                    const sentDate = comm.sentAt
                      ? new Date(comm.sentAt).toLocaleDateString()
                      : 'Draft'

                    return (
                      <div key={comm.id} className="communication-card">
                        <div className="comm-header">
                          <div className="comm-type">
                            <Icon className="icon" />
                            <span className={`status-badge ${getStatusClass(comm.status)}`}>
                              {comm.status}
                            </span>
                          </div>
                          <span className="comm-date">{sentDate}</span>
                        </div>

                        <div className="comm-content">
                          <h3>{comm.subject || 'No Subject'}</h3>
                          <p className="comm-donor">
                            With {comm.donor?.firstName} {comm.donor?.lastName}
                          </p>
                          {comm.content && (
                            <p className="comm-preview">{comm.content.substring(0, 150)}...</p>
                          )}
                        </div>

                        <div className="comm-actions">
                          <button 
                            onClick={() => router.push(`/communications/${comm.id}`)}
                            className="action-link"
                          >
                            View Details →
                          </button>
                          
                          {comm.requiresFollowUp && comm.followUpDate && (
                            <span className="follow-up">
                              <ClockIcon className="icon" />
                              Follow up by {new Date(comm.followUpDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                {/* Empty State */}
                {communications.length === 0 && (
                  <div className="empty-state">
                    <ChatBubbleLeftRightIcon className="empty-icon" />
                    <h3>No communications found</h3>
                    <p>Start building relationships by reaching out to donors</p>
                    <button 
                      onClick={() => setShowTemplateModal(true)}
                      className="btn-primary"
                    >
                      <PlusIcon className="icon" />
                      Send First Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="tab-content">
              <div className="meetings-section">
                <div className="meetings-header">
                  <h3>Scheduled Meetings</h3>
                  <div className="meetings-actions">
                    <button
                      onClick={() => setShowScheduleMeeting(true)}
                      className="btn-primary"
                    >
                      <VideoCameraIcon className="icon" />
                      Schedule New Meeting
                    </button>
                    <button
                      onClick={createZoomMeeting}
                      disabled={creatingZoom || !selectedDonor}
                      className="btn-secondary"
                    >
                      {creatingZoom ? (
                        <>
                          <div className="spinner-small" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <VideoCameraIcon className="icon" />
                          Quick Zoom
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {meetingsLoading ? (
                  <div className="loading-container">
                    <div className="spinner" />
                    <p>Loading meetings...</p>
                  </div>
                ) : (
                  <div className="meetings-list">
                    {meetings.length > 0 ? (
                      <div className="meetings-table-container">
                        <table className="meetings-table">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Donor</th>
                              <th>Date & Time</th>
                              <th>Duration</th>
                              <th>Type</th>
                              <th>Zoom Link</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {meetings.map((meeting) => (
                              <tr key={meeting.id}>
                                <td>
                                  <div className="meeting-title">{meeting.title}</div>
                                  <div className="meeting-description">
                                    {meeting.description || 'No description'}
                                  </div>
                                </td>
                                <td>
                                  <div className="meeting-donor">
                                    {meeting.donor?.firstName} {meeting.donor?.lastName}
                                  </div>
                                  <div className="meeting-donor-email">
                                    {meeting.donor?.email || 'No email'}
                                  </div>
                                </td>
                                <td>
                                  <div className="meeting-date">
                                    {meeting.startTime ? new Date(meeting.startTime).toLocaleDateString() : 'N/A'}
                                  </div>
                                  <div className="meeting-time">
                                    {meeting.startTime ? new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </div>
                                </td>
                                <td>{meeting.duration || 30} minutes</td>
                                <td>
                                  <span className="meeting-type">
                                    {meeting.meetingType?.toLowerCase() || 'virtual'}
                                  </span>
                                </td>
                                <td>
                                  {meeting.zoomJoinUrl ? (
                                    <a 
                                      href={meeting.zoomJoinUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="zoom-link"
                                    >
                                      <VideoCameraIcon className="icon" />
                                      Join
                                    </a>
                                  ) : (
                                    <span className="no-zoom">No Zoom link</span>
                                  )}
                                </td>
                                <td>
                                  <div className="meeting-actions">
                                    <button
                                      onClick={() => {
                                        // TODO: Implement edit meeting
                                        alert('Edit meeting functionality coming soon')
                                      }}
                                      className="action-btn edit-btn"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteMeeting(meeting.id)}
                                      className="action-btn delete-btn"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <CalendarIcon className="empty-icon" />
                        <h3>No scheduled meetings</h3>
                        <p>Schedule your first meeting with a donor</p>
                        <button
                          onClick={() => setShowScheduleMeeting(true)}
                          className="btn-primary"
                        >
                          <VideoCameraIcon className="icon" />
                          Schedule Meeting
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="tab-content">
              {selectedDonor ? (
                <div className="templates-section-wrapper">
                  <div className="donor-context-banner">
                    <UserCircleIcon className="icon" />
                    <div>
                      <strong>Templates for:</strong> {selectedDonor.firstName} {selectedDonor.lastName}
                      {selectedDonor.email && ` • ${selectedDonor.email}`}
                      <small>Placeholders will auto-fill with donor info</small>
                    </div>
                  </div>
                  
                  <TemplatesSection 
                    donorId={selectedDonor.id}
                    donorInfo={{
                      id: selectedDonor.id,
                      firstName: selectedDonor.firstName,
                      lastName: selectedDonor.lastName,
                      email: selectedDonor.email,
                      phone: selectedDonor.phone,
                      lastDonationAmount: selectedDonor.lastDonationAmount,
                      lastDonationDate: selectedDonor.lastDonationDate
                    }}
                  />
                </div>
              ) : (
                <div className="no-donor-selected">
                  <DocumentDuplicateIcon className="empty-icon" />
                  <h3>Select a donor to use templates</h3>
                  <p>Choose a donor from the left panel to see and use email templates</p>
                  <div className="template-categories-preview">
                    <h4>Available Template Categories:</h4>
                    <div className="categories-grid">
                      {templateCategories.map(category => (
                        <div key={category.id} className="category-card">
                          <h5>{category.name}</h5>
                          <p>{category.description}</p>
                          <span className="template-count">{category.count} templates</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-content">
              <div className="sent-history">
                <h3>Recently Sent Communications</h3>
                <div className="history-filters">
                  <input
                    type="text"
                    placeholder="Search sent communications..."
                    className="search-input"
                  />
                  <select className="timeframe-select">
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
                    <option value="90days">Last 90 days</option>
                  </select>
                </div>

              
                
                <div className="history-list">
                  {communications.filter(comm => comm.status === 'SENT')
                    .slice(0, 10)
                    .map(comm => {
                      const Icon = getTypeIcon(comm.type)
                      return (
                        <div key={comm.id} className="history-item">
                          <Icon className="icon" />
                          <div className="history-details">
                            <h4>{comm.subject || 'No Subject'}</h4>
                            <p>To: {comm.donor?.firstName} {comm.donor?.lastName}</p>
                            <span className="history-date">
                              {new Date(comm.sentAt).toLocaleString()}
                            </span>
                          </div>
                          <button 
                            className="btn-secondary btn-sm"
                            onClick={() => router.push(`/communications/${comm.id}`)}
                          >
                            View
                          </button>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleMeeting && (
        <div className="modal-overlay">
          <div className="meeting-schedule-modal">
            <div className="modal-header">
              <h2>Schedule Meeting</h2>
              <button 
                onClick={() => setShowScheduleMeeting(false)}
                className="close-button"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>

            <div className="modal-content">
              {selectedDonor ? (
                <div className="donor-selected-info">
                  <UserCircleIcon className="icon" />
                  <div>
                    <h4>Meeting with {selectedDonor.firstName} {selectedDonor.lastName}</h4>
                    <p>{selectedDonor.email} • {selectedDonor.phone || 'No phone'}</p>
                  </div>
                </div>
              ) : (
                <div className="select-donor-alert">
                  <p>Please select a donor from the left panel to schedule a meeting.</p>
                </div>
              )}

              {selectedDonor && (
                <ScheduleMeetingForm 
                  donorId={selectedDonor.id}
                  donorName={`${selectedDonor.firstName} ${selectedDonor.lastName}`}
                  onScheduled={(meetingData) => {
                    handleMeetingScheduled(meetingData)
                    setShowScheduleMeeting(false)
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Templates Modal */}
      {showTemplateModal && (
        <div className="modal-overlay">
          <div className="template-modal">
            <div className="modal-header">
              <h2>Email & Message Templates</h2>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="close-button"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>

            <div className="template-modal-content">
              <div className="template-search">
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="search-input"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                />
              </div>

              <div className="template-categories-tabs">
                {templateCategories.map(category => (
                  <button
                    key={category.id}
                    className={`category-tab ${selectedTemplateCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedTemplateCategory(category.id)}
                  >
                    {category.name}
                    <span className="tab-count">{category.count}</span>
                  </button>
                ))}
              </div>

              <div className="templates-grid">
                {filteredTemplates
                  .filter(template => template.category === selectedTemplateCategory.toUpperCase())
                  .map(template => (
                    <div key={template.id} className="template-card">
                      <div className="template-header">
                        <h4>{template.name}</h4>
                        <span className="template-category">{template.category}</span>
                      </div>
                      <p className="template-preview">
                        {template.content.substring(0, 100)}...
                      </p>
                      <div className="template-actions">
                        {selectedDonor ? (
                          <>
                            <button 
                              className="btn-primary btn-sm"
                              onClick={() => handleUseTemplate(template)}
                            >
                              <EnvelopeIcon className="icon" />
                              Use for {selectedDonor.firstName}
                            </button>
                            <button 
                              className="btn-secondary btn-sm"
                              onClick={() => handleSendWithTemplate(template)}
                            >
                              <PaperAirplaneIcon className="icon" />
                              Send Now
                            </button>
                          </>
                        ) : (
                          <p className="select-donor-message">
                            Select a donor from the left panel to use this template
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {selectedDonor && (
                <div className="quick-send-section">
                  <h4>Quick Send to {selectedDonor.firstName}:</h4>
                  <div className="quick-send-buttons">
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        const thankYouTemplate = filteredTemplates.find(t => t.name.includes('Thank You'))
                        if (thankYouTemplate) handleSendWithTemplate(thankYouTemplate)
                      }}
                    >
                      Send Thank You
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        const followUpTemplate = filteredTemplates.find(t => t.name.includes('Follow Up'))
                        if (followUpTemplate) handleUseTemplate(followUpTemplate)
                      }}
                    >
                      Follow Up Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal (existing) */}
      {showChatModal && selectedDonor && (
        <div className="modal-overlay">
          <div className="chat-modal">
            <div className="modal-header">
              <div className="donor-chat-info">
                <div className="donor-avatar">
                  {selectedDonor.firstName.charAt(0)}{selectedDonor.lastName.charAt(0)}
                </div>
                <div>
                  <h3>{selectedDonor.firstName} {selectedDonor.lastName}</h3>
                  <p className="donor-email">{selectedDonor.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowChatModal(false)}
                className="close-button"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.direction === 'outbound' ? 'outbound' : 'inbound'}`}
                >
                  <div className="message-content">
                    <p>{msg.content}</p>
                    <span className="message-time">
                      {formatTime(msg.timestamp)}
                      {msg.direction === 'outbound' && (
                        <span className={`message-status ${msg.status?.toLowerCase()}`}>
                          {msg.status === 'SENDING' ? 'Sending...' : 
                           msg.status === 'SENT' ? '✓' : 
                           msg.status === 'FAILED' ? 'Failed' : ''}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="message-input"
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={!newMessage.trim()}
              >
                <PaperAirplaneIcon className="icon" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal (existing) */}
      {showEditModal && selectedDonor && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>Edit Donor Profile</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="close-button"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>

            <form onSubmit={handleEditDonor} className="edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData(prev => ({...prev, firstName: e.target.value}))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData(prev => ({...prev, lastName: e.target.value}))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({...prev, email: e.target.value}))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({...prev, phone: e.target.value}))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({...prev, status: e.target.value}))}
                    className="form-select"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="LAPSED">Lapsed</option>
                    <option value="PROSPECT">Prospect</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Relationship Stage</label>
                  <select
                    value={editFormData.relationshipStage}
                    onChange={(e) => setEditFormData(prev => ({...prev, relationshipStage: e.target.value}))}
                    className="form-select"
                  >
                    <option value="NEW">New</option>
                    <option value="CULTIVATION">Cultivation</option>
                    <option value="ASK_READY">Ask Ready</option>
                    <option value="STEWARDSHIP">Stewardship</option>
                    <option value="MAJOR_GIFT">Major Gift</option>
                    <option value="LEGACY">Legacy</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData(prev => ({...prev, notes: e.target.value}))}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
