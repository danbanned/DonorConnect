'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import '../communications.css'

export default function CommunicationDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [communication, setCommunication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    async function loadCommunication() {
      try {
        setLoading(true)
        const res = await fetch(`/api/communications/${id}`)
        if (res.ok) {
          const data = await res.json()
          setCommunication(data)
        } else {
          setError('Communication not found')
        }
      } catch (err) {
        console.error('Failed to fetch communication:', err)
        setError('Failed to load communication')
      } finally {
        setLoading(false)
      }
    }

    if (id) loadCommunication()
  }, [id])

  const getTypeIcon = (type) => {
    switch (type) {
      case 'EMAIL': return EnvelopeIcon
      case 'PHONE_CALL': return PhoneIcon
      case 'MEETING': return CalendarIcon
      case 'THANK_YOU_NOTE': return CheckCircleIcon
      default: return EnvelopeIcon
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString()
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyMessage.trim()) return

    try {
      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: communication.donor.id,
          type: 'EMAIL',
          direction: 'OUTBOUND',
          content: replyMessage,
          subject: `Re: ${communication.subject || 'No Subject'}`
        })
      })

      if (res.ok) {
        alert('Reply sent!')
        setReplyMessage('')
      }
    } catch (err) {
      console.error('Error sending reply:', err)
      alert('Failed to send reply')
    }
  }

  if (loading) return <p>Loading communication...</p>
  if (error) return <p>{error}</p>
  if (!communication) return <p>No communication found.</p>

  const Icon = getTypeIcon(communication.type)

  return (
    <div className="communication-detail-page">
      <button onClick={() => router.back()} className="btn-secondary">
        <XMarkIcon className="icon" /> Back
      </button>

      <div className="communication-card">
        <div className="comm-header">
          <Icon className="icon" />
          <h2>{communication.subject || 'No Subject'}</h2>
          <span className={`status-badge`}>{communication.status}</span>
        </div>

        <div className="comm-donor-info">
          <h3>Donor:</h3>
          <p>{communication.donor?.firstName} {communication.donor?.lastName}</p>
          <p>Email: {communication.donor?.email}</p>
          <p>Phone: {communication.donor?.phone || 'N/A'}</p>
        </div>

        <div className="comm-content">
          <h3>Message Content:</h3>
          <p>{communication.content || 'No content'}</p>
        </div>

        <div className="comm-meta">
          <p>Type: {communication.type}</p>
          <p>Direction: {communication.direction}</p>
          <p>Sent At: {formatTime(communication.sentAt)}</p>
          {communication.followUpDate && (
            <p>Follow-up by: {formatTime(communication.followUpDate)}</p>
          )}
        </div>

        <form onSubmit={handleSendReply} className="reply-form">
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your reply..."
            className="form-textarea"
            rows={3}
          />
          <button type="submit" className="btn-primary">
            <PaperAirplaneIcon className="icon" /> Send Reply
          </button>
        </form>
      </div>
    </div>
  )
}
