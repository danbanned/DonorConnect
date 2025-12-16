'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import './communications.css'

const communicationTypes = [
  { id: 'all', name: 'All Communications' },
  { id: 'email', name: 'Emails', icon: EnvelopeIcon },
  { id: 'phone', name: 'Phone Calls', icon: PhoneIcon },
  { id: 'meeting', name: 'Meetings', icon: CalendarIcon },
  { id: 'thankyou', name: 'Thank You Notes', icon: CheckCircleIcon },
]

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [timeframe, setTimeframe] = useState('30days')

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchCommunications({
            timeframe,
            type: selectedType,
            })
            setCommunications(response.communications)

      } catch (error) {
        console.error('Failed to load communications:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [timeframe])

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="spinner" />
      </div>
    )
  }

  const filteredCommunications =
    selectedType === 'all'
      ? communications
      : communications.filter(c => c.type === selectedType.toUpperCase())

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
        return 'badge bg-green'
      case 'DRAFT':
        return 'badge bg-yellow'
      case 'FAILED':
      case 'BOUNCED':
        return 'badge bg-red'
      default:
        return 'badge bg-gray'
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Communications</h1>
          <p className="text-gray-600">
            Track all donor interactions and communications
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/communications/new" className="btn-primary flex items-center gap-1">
            <PlusIcon className="h-5 w-5" />
            New Communication
          </Link>

          <Link href="/communications/templates" className="btn-secondary flex items-center gap-1">
            <EnvelopeIcon className="h-5 w-5" />
            Templates
          </Link>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex gap-3">
        {communicationTypes.map(type => {
          const Icon = type.icon || ChatBubbleLeftRightIcon
          const isActive = selectedType === type.id

          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`filter-button ${isActive ? 'filter-active' : 'filter-inactive'}`}
            >
              <Icon className="h-5 w-5" />
              {type.name}
            </button>
          )
        })}
      </div>

      {/* Timeframe Filter */}
      <div className="flex justify-between">
        <div />
        <select value={timeframe} onChange={e => setTimeframe(e.target.value)}>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="year">This year</option>
        </select>
      </div>

      {/* Communications List */}
      <div className="flex flex-col gap-4">
        {filteredCommunications.map(comm => {
          const Icon = getTypeIcon(comm.type)
          const sentDate = comm.sentAt
            ? new Date(comm.sentAt).toLocaleDateString()
            : 'Draft'

          return (
            <div key={comm.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-start">
                  <Icon className="h-6 w-6 text-blue" />

                  <div>
                    <div className="flex gap-3 items-center">
                      <h3>{comm.subject || 'No Subject'}</h3>
                      <span className={getStatusClass(comm.status)}>
                        {comm.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      With {comm.donor?.firstName} {comm.donor?.lastName}
                    </p>

                    {comm.summary && (
                      <p className="text-gray-700 mt-2">
                        {comm.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">{sentDate}</p>

                  {comm.requiresFollowUp && comm.followUpDate && (
                    <div className="flex gap-1 items-center mt-2 text-sm text-gray-700">
                      <ClockIcon className="h-4 w-4" />
                      Follow up by {new Date(comm.followUpDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Link href={`/communications/${comm.id}`} className="text-blue text-sm">
                  View Details →
                </Link>

                {comm.requiresFollowUp && (
                  <Link
                    href={`/communications/new?followUp=${comm.id}`}
                    className="text-sm text-green"
                  >
                    Log Follow-up
                  </Link>
                )}

                {comm.relatedDonation && (
                  <Link
                    href={`/donations/${comm.relatedDonation.id}`}
                    className="text-sm text-purple"
                  >
                    View Donation
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCommunications.length === 0 && (
        <div className="empty-state">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-600" />
          <h3>No communications found</h3>
          <p className="text-gray-600">
            Start building relationships by reaching out to donors
          </p>

          <Link href="/communications/new" className="btn-primary">
            <PlusIcon className="h-5 w-5" />
            Send First Message
          </Link>
        </div>
      )}
    </div>
  )
}
