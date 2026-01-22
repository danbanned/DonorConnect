// app/components/donations/DonorActivityTimeline.js
'use client'

import { useState, useEffect } from 'react'
import { 
  CurrencyDollarIcon, 
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  ClockIcon,
  FireIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

const iconMap = {
  'DONATION': CurrencyDollarIcon,
  'MEETING': CalendarIcon,
  'EMAIL': EnvelopeIcon,
  'PHONE_CALL': PhoneIcon,
  'NOTE': DocumentTextIcon,
  'STATUS_CHANGE': CheckCircleIcon,
  'DONATION_RECEIVED': CurrencyDollarIcon,
  'MEETING_SCHEDULED': CalendarIcon,
  'EMAIL_SENT': EnvelopeIcon,
  'THANK_YOU_SENT': EnvelopeIcon,
  'FOLLOW_UP_SENT': EnvelopeIcon,
  'NOTE_ADDED': DocumentTextIcon,
  'STATUS_CHANGED': CheckCircleIcon,
  'LYBUNT_ALERT': ExclamationTriangleIcon,
  'SYBUNT_ALERT': ExclamationTriangleIcon,
  'DEFAULT': UserCircleIcon
}

function formatTimeAgo(date) {
  if (!date) return 'recently'
  
  const now = new Date()
  const dateObj = date instanceof Date ? date : new Date(date)
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return 'recently'
  
  const diffInSeconds = Math.floor((now - dateObj) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

export default function DonorActivityTimeline({ activities = [], donor }) {
  const [filter, setFilter] = useState('all')
  const [mockActivities, setMockActivities] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('📅 DonorActivityTimeline Component Mounted')
    console.log('📅 Received activities:', activities)
    console.log('📅 Activities count:', activities?.length)
    console.log('📅 Activities sample:', activities?.slice(0, 3))
    console.log('📅 Donor:', donor?.id, donor?.firstName, donor?.lastName)
    
    // Check if activities array is empty but we have donation data
    if (activities?.length === 0 && donor?.donations?.length > 0) {
      console.log('ℹ️ No activities found, but we have', donor.donations.length, 'donations')
    }
  }, [activities, donor])

  // Create mock activities from donations if no real activities exist
  useEffect(() => {
    if (!activities || activities.length === 0) {
      console.log('🔄 Generating mock activities from donor data...')
      
      const generatedActivities = []
      
      // Convert donations to activities
      if (donor?.donations?.length > 0) {
        donor.donations.forEach((donation, index) => {
          generatedActivities.push({
            id: `donation_${donation.id || index}`,
            type: 'DONATION',
            action: 'DONATION_RECEIVED',
            displayAction: 'Made a donation',
            description: `Donation of $${donation.amount} received`,
            amount: donation.amount,
            createdAt: donation.date || donation.createdAt,
            date: donation.date,
            rawData: donation
          })
        })
      }
      
      // Convert communications to activities
      if (donor?.communications?.length > 0) {
        donor.communications.forEach((comm, index) => {
          generatedActivities.push({
            id: `comm_${comm.id || index}`,
            type: 'COMMUNICATION',
            action: `${comm.type}_SENT`,
            displayAction: `${comm.type.replace('_', ' ')} sent`,
            description: comm.subject || `Communication sent`,
            createdAt: comm.sentAt || comm.createdAt,
            rawData: comm
          })
        })
      }
      
      // Add donor creation as an activity
      if (donor?.createdAt) {
        generatedActivities.push({
          id: `created_${donor.id}`,
          type: 'STATUS_CHANGE',
          action: 'DONOR_CREATED',
          displayAction: 'Donor profile created',
          description: 'Donor was added to the system',
          createdAt: donor.createdAt,
          rawData: { type: 'creation' }
        })
      }
      
      // Add LY BUNT/SY BUNT status as activity if applicable
      if (donor?.relationshipStage === 'LYBUNT') {
        generatedActivities.push({
          id: `status_lybunt`,
          type: 'LYBUNT_ALERT',
          action: 'LYBUNT_STATUS',
          displayAction: 'LYBUNT Status',
          description: 'Donor gave last year but not this year',
          createdAt: new Date().toISOString(),
          rawData: { type: 'status', stage: 'LYBUNT' }
        })
      } else if (donor?.relationshipStage === 'SYBUNT') {
        generatedActivities.push({
          id: `status_sybunt`,
          type: 'SYBUNT_ALERT',
          action: 'SYBUNT_STATUS',
          displayAction: 'SYBUNT Status',
          description: 'Donor gave this year after skipping last year',
          createdAt: new Date().toISOString(),
          rawData: { type: 'status', stage: 'SYBUNT' }
        })
      }
      
      // Sort by date (newest first)
      generatedActivities.sort((a, b) => 
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      )
      
      console.log('✅ Generated mock activities:', generatedActivities.length)
      setMockActivities(generatedActivities)
    } else {
      console.log('✅ Using real activities:', activities.length)
      setMockActivities([])
    }
  }, [activities, donor])

  // Determine which activities to display
  const displayActivities = activities?.length > 0 ? activities : mockActivities
  
  const filteredActivities = displayActivities.filter(activity => {
    if (filter === 'all') return true
    return activity.type === filter
  })

  const activityTypes = [
    { key: 'all', label: 'All', count: displayActivities.length },
    { key: 'DONATION', label: 'Donations', count: displayActivities.filter(a => a.type === 'DONATION').length },
    { key: 'COMMUNICATION', label: 'Communications', count: displayActivities.filter(a => a.type === 'COMMUNICATION').length },
    { key: 'MEETING', label: 'Meetings', count: displayActivities.filter(a => a.type === 'MEETING').length },
    { key: 'NOTE', label: 'Notes', count: displayActivities.filter(a => a.type === 'NOTE').length },
    { key: 'STATUS_CHANGE', label: 'Status', count: displayActivities.filter(a => a.type === 'STATUS_CHANGE' || a.type === 'LYBUNT_ALERT' || a.type === 'SYBUNT_ALERT').length }
  ]

  console.log('🎨 Rendering with:', {
    originalActivities: activities?.length,
    mockActivities: mockActivities.length,
    displayActivities: displayActivities.length,
    filteredActivities: filteredActivities.length,
    filter
  })

  return (
    <div className="w-full">
      {/* Debug Header - Remove in production */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Activity Timeline
            </span>
          </div>
          <div className="text-xs text-blue-600">
            Showing {filteredActivities.length} of {displayActivities.length} activities
            {mockActivities.length > 0 && ' (mock data)'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {activityTypes.map(type => (
          <button
            key={type.key}
            className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
              filter === type.key 
                ? 'bg-blue-100 text-blue-700 font-medium border border-blue-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
            }`}
            onClick={() => setFilter(type.key)}
            disabled={type.count === 0 && filter !== type.key}
          >
            <div className="flex items-center gap-1">
              <span>{type.label}</span>
              {type.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  filter === type.key ? 'bg-white' : 'bg-gray-200'
                }`}>
                  {type.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading activities...</p>
          </div>
        ) : filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => {
            const Icon = iconMap[activity.type] || iconMap[activity.action] || iconMap.DEFAULT
            const isMock = mockActivities.length > 0 && activities.length === 0
            
            return (
              <div 
                key={activity.id || index} 
                className={`flex gap-3 p-4 rounded-lg border transition-all hover:shadow-sm ${
                  isMock 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'DONATION' ? 'bg-green-100' :
                    activity.type === 'COMMUNICATION' ? 'bg-blue-100' :
                    activity.type === 'MEETING' ? 'bg-purple-100' :
                    activity.type === 'NOTE' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      activity.type === 'DONATION' ? 'text-green-600' :
                      activity.type === 'COMMUNICATION' ? 'text-blue-600' :
                      activity.type === 'MEETING' ? 'text-purple-600' :
                      activity.type === 'NOTE' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {activity.displayAction || activity.action || 'Activity'}
                      </h3>
                      {isMock && (
                        <span className="inline-block px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded mt-1">
                          Mock Data
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatTimeAgo(activity.createdAt || activity.date)}
                    </span>
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  )}
                  
                  {activity.amount && (
                    <div className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                      ${activity.amount.toLocaleString()}
                    </div>
                  )}
                  
                  {/* Show raw data in debug mode */}
                  {process.env.NODE_ENV === 'development' && activity.rawData && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">
                        Raw Data
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                        {JSON.stringify(activity.rawData, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No activities found</p>
            <p className="text-sm text-gray-400">
              {filter !== 'all' 
                ? `No ${filter.toLowerCase()} activities found. Try another filter.`
                : 'Start by recording a donation or sending a communication.'}
            </p>
            
            {/* Show what data we do have */}
            {donor && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
                <p className="text-sm font-medium text-gray-700">Available Data:</p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  <li>• Donations: {donor.donations?.length || 0}</li>
                  <li>• Communications: {donor.communications?.length || 0}</li>
                  <li>• Relationship Stage: {donor.relationshipStage || 'N/A'}</li>
                  <li>• Total Donated: ${donor.totalDonations?.toLocaleString() || '0'}</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add Activity Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => console.log('Add activity clicked')}
          className="w-full py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
          <span>+ Add New Activity</span>
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Activities help track engagement with donors
        </p>
      </div>
    </div>
  )
}