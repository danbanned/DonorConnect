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
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import './communications.css'

const communicationTypes = [
  { id: 'all', name: 'All Communications', icon: ChatBubbleLeftRightIcon },
  { id: 'email', name: 'Emails', icon: EnvelopeIcon },
  { id: 'phone', name: 'Phone Calls', icon: PhoneIcon },
  { id: 'meeting', name: 'Meetings', icon: CalendarIcon },
  { id: 'thankyou', name: 'Thank You Notes', icon: CheckCircleIcon },
]

export default function CommunicationsPage() {
  const router = useRouter()
  const [communications, setCommunications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [timeframe, setTimeframe] = useState('30days')
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [donors, setDonors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDonors, setFilteredDonors] = useState([])
  
  // Modal states
  const [showChatModal, setShowChatModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  
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
  
  // Meeting form states
  const [meetingFormData, setMeetingFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    duration: 30,
    createZoom: true
  })

  // Fetch donors and communications
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Fetch donors
        const donorsRes = await fetch('/api/donors/directory')
        if (donorsRes.ok) {
          const donorsData = await donorsRes.json()
          setDonors(donorsData)
          setFilteredDonors(donorsData.slice(0, 10)) // Show first 10
        }
        
        // Fetch communications
        const commsRes = await fetch(`/api/communications?timeframe=${timeframe}`)
        if (commsRes.ok) {
          const commsData = await commsRes.json()
          setCommunications(commsData || [])
        }
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

  const loadChatMessages = async (donorId) => {
    try {
      const res = await fetch(`/api/communications?donorId=${donorId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.length > 0 ? data : getSampleMessages())
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
        const commsRes = await fetch(`/api/communications?timeframe=${timeframe}`)
        if (commsRes.ok) {
          setCommunications(await commsRes.json())
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

  const handleScheduleMeeting = async (e) => {
    e.preventDefault()
    if (!selectedDonor) return

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: selectedDonor.id,
          ...meetingFormData
        })
      })

      if (response.ok) {
        const meeting = await response.json()
        setShowMeetingModal(false)
        
        // Create a communication record for the meeting
        await fetch('/api/communications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donorId: selectedDonor.id,
            type: 'MEETING',
            direction: 'OUTBOUND',
            subject: meetingFormData.title,
            content: `Meeting scheduled for ${new Date(meetingFormData.startTime).toLocaleString()}`,
            status: 'SENT'
          })
        })
        
        // Refresh communications
        const commsRes = await fetch(`/api/communications?timeframe=${timeframe}`)
        if (commsRes.ok) {
          setCommunications(await commsRes.json())
        }
        
        alert('Meeting scheduled successfully!')
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      alert('Failed to schedule meeting')
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
            onClick={() => router.push('/communications/new')} 
            className="btn-primary"
          >
            <PlusIcon className="icon" />
            New Communication
          </button>

          <Link href="/communications/templates" className="btn-secondary">
            <DocumentTextIcon className="icon" />
            Templates
          </Link>
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

          {/* Quick Actions for Selected Donor */}
          {selectedDonor && (
            <div className="quick-actions-panel">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  onClick={() => setShowChatModal(true)}
                  className="action-btn btn-chat"
                >
                  <EnvelopeIcon className="icon" />
                  Send Message
                </button>
                
                <button 
                  onClick={() => setShowMeetingModal(true)}
                  className="action-btn btn-meeting"
                >
                  <VideoCameraIcon className="icon" />
                  Schedule Meeting
                </button>
                
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="action-btn btn-edit"
                >
                  <PencilIcon className="icon" />
                  Edit Profile
                </button>
                
                <Link 
                  href={`/recorddonorpage/${selectedDonor.id}`}
                  className="action-btn btn-donation"
                >
                  <CurrencyDollarIcon className="icon" />
                  Record Donation
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Communications List */}
        <div className="communications-main">
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
              value={timeframe} 
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
                  onClick={() => router.push('/communications/new')}
                  className="btn-primary"
                >
                  <PlusIcon className="icon" />
                  Send First Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
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

      {/* Edit Profile Modal */}
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

      {/* Schedule Meeting Modal */}
      {showMeetingModal && selectedDonor && (
        <div className="modal-overlay">
          <div className="meeting-modal">
            <div className="modal-header">
              <h2>Schedule Meeting</h2>
              <button 
                onClick={() => setShowMeetingModal(false)}
                className="close-button"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>

            <form onSubmit={handleScheduleMeeting} className="meeting-form">
              <div className="form-group">
                <label>Meeting Title</label>
                <input
                  type="text"
                  value={meetingFormData.title || `Meeting with ${selectedDonor.firstName}`}
                  onChange={(e) => setMeetingFormData(prev => ({...prev, title: e.target.value}))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={meetingFormData.description}
                  onChange={(e) => setMeetingFormData(prev => ({...prev, description: e.target.value}))}
                  className="form-textarea"
                  rows={3}
                  placeholder="Meeting agenda or notes..."
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    value={meetingFormData.startTime}
                    onChange={(e) => setMeetingFormData(prev => ({...prev, startTime: e.target.value}))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <select
                    value={meetingFormData.duration}
                    onChange={(e) => setMeetingFormData(prev => ({...prev, duration: parseInt(e.target.value)}))}
                    className="form-select"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>

              <div className="zoom-option">
                <input
                  type="checkbox"
                  id="createZoom"
                  checked={meetingFormData.createZoom}
                  onChange={(e) => setMeetingFormData(prev => ({...prev, createZoom: e.target.checked}))}
                  className="checkbox"
                />
                <label htmlFor="createZoom" className="checkbox-label">
                  <VideoCameraIcon className="icon" />
                  <div>
                    <span>Create Zoom Meeting</span>
                    <small>A Zoom meeting will be created with the scheduled time</small>
                  </div>
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowMeetingModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}