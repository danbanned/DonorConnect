'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'

// Component that uses useSearchParams
function ScheduleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') || 'all'
  const date = searchParams.get('date')
  
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSchedules() {
      try {
        const response = await fetch(`/api/communications/schedule?filter=${filter}&date=${date || ''}`)
        const data = await response.json()
        setSchedules(data)
      } catch (error) {
        console.error('Failed to load schedules', error)
      } finally {
        setLoading(false)
      }
    }
    loadSchedules()
  }, [filter, date])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Communication Schedule</h1>
          <p className="text-gray-600">Manage and view scheduled communications</p>
        </div>
        <Link 
          href="/communications/schedule/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Schedule New
        </Link>
      </div>

      {/* Filter controls */}
      <div className="flex gap-2 mb-6">
        <button 
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
          onClick={() => router.push('/communications/schedule?filter=all')}
        >
          All
        </button>
        <button 
          className={`px-4 py-2 rounded ${filter === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
          onClick={() => router.push('/communications/schedule?filter=email')}
        >
          Emails
        </button>
        <button 
          className={`px-4 py-2 rounded ${filter === 'sms' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
          onClick={() => router.push('/communications/schedule?filter=sms')}
        >
          SMS
        </button>
      </div>

      {/* Schedules list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {schedule.type === 'email' ? (
                          <EnvelopeIcon className="h-5 w-5 text-blue-500 mr-2" />
                        ) : (
                          <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-green-500 mr-2" />
                        )}
                        <span className="capitalize">{schedule.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{schedule.recipientName}</div>
                      <div className="text-sm text-gray-500">{schedule.recipientEmail || schedule.recipientPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(schedule.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(schedule.scheduledAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        schedule.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        schedule.status === 'sent' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Cancel</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No scheduled communications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Import the missing icon
import { EnvelopeIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'

// Main page component with Suspense
export default function SchedulePage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <ScheduleContent />
    </Suspense>
  )
}