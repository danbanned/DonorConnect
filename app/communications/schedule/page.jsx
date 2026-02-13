'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, EnvelopeIcon, ChatBubbleBottomCenterTextIcon, VideoCameraIcon, PaperAirplaneIcon, UserIcon } from '@heroicons/react/24/outline'

// Import your components
import ScheduleMeetingForm from '../../components/communications/ScheduleMeetingForm'

// Component that uses useSearchParams
function ScheduleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'list'
  const tab = 'meetings' // Force meetings tab since communications API doesn't exist
  
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingZoom, setCreatingZoom] = useState(false)
  
  // New state for donor management
  const [donors, setDonors] = useState([])
  const [selectedDonorId, setSelectedDonorId] = useState(null)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [donorLoading, setDonorLoading] = useState(false)
  const [showDonorDropdown, setShowDonorDropdown] = useState(false)

  // Fetch donors on mount
  useEffect(() => {
    loadDonors();
  }, [])

  // Fetch meetings on mount and when tab changes
  useEffect(() => {
    loadMeetings();
  }, [])

  // Load donors from API
  const loadDonors = async () => {
    try {
      setDonorLoading(true);
      const response = await fetch('/api/donors');
      
      if (!response.ok) {
        console.error('Failed to load donors:', response.status);
        setDonors([]);
        return;
      }
      
      const result = await response.json();
      
      if (Array.isArray(result)) {
        setDonors(result);
      } else if (result.donors && Array.isArray(result.donors)) {
        setDonors(result.donors);
      } else {
        console.error('Unexpected donors response format:', result);
        setDonors([]);
      }
    } catch (error) {
      console.error('Failed to load donors:', error);
      setDonors([]);
    } finally {
      setDonorLoading(false);
    }
  }

  // Load meetings with proper API endpoint
  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/communications/meetings');
      
      if (!response.ok) {
        console.error('Failed to load meetings:', response.status);
        setMeetings([]);
        return;
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMeetings(result.meetings || []);
      } else {
        console.error('Failed to load meetings:', result.error);
        setMeetings([]);
      }
    } catch (error) {
      console.error('Failed to load meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }

  // Handle donor selection
  const handleDonorSelect = (donorId) => {
    setSelectedDonorId(donorId);
    const donor = donors.find(d => d.id === donorId);
    setSelectedDonor(donor);
  }

  // Handle meeting scheduled callback - FIXED VERSION
  const handleMeetingScheduled = async (formData) => {
    try {
      console.log('ScheduleMeetingForm sent:', formData);
      
      // Transform the data to match backend expectations
      const apiData = {
        donorId: formData.donorId || selectedDonorId,
        title: formData.title,
        // Transform startsAt to startTime
        startTime: formData.startsAt || formData.startTime,
        duration: formData.duration || 30,
        meetingType: formData.meetingType || 'VIRTUAL',
        notes: formData.notes,
        description: formData.description || '',
        status: 'SCHEDULED'
      };

      // Clean up data - remove undefined fields and endTime if present
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === undefined || apiData[key] === null) {
          delete apiData[key];
        }
      });
      
      // Remove endTime if present (backend calculates it)
      if (apiData.endTime) {
        delete apiData.endTime;
      }

      console.log('Transformed data for API:', apiData);

      // Validate required fields
      if (!apiData.donorId) {
        throw new Error('Donor ID is required');
      }
      if (!apiData.title) {
        throw new Error('Meeting title is required');
      }
      if (!apiData.startTime) {
        throw new Error('Start time is required');
      }

      const response = await fetch('/api/communications/meetings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to schedule meeting');
      }

      alert('Meeting scheduled successfully!');
      
      // Refresh meetings list
      await loadMeetings();
      // Switch back to list view
      router.push('/communications/schedule?view=list');
      
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      alert(error.message || 'Failed to schedule meeting');
    }
  }

  // Create Zoom meeting and save to database - CORRECTED VERSION
  const createZoomMeeting = async () => {
    try {
      setCreatingZoom(true)
      
      // If donor is selected, use it; otherwise get first available donor
      let selectedDonorForMeeting = selectedDonor;
      
      if (!selectedDonorForMeeting && donors.length > 0) {
        selectedDonorForMeeting = donors[0];
      }
      
      // Validate donor selection
      if (!selectedDonorForMeeting) {
        alert('Please select a valid donor first');
        setCreatingZoom(false);
        return;
      }
      
      const donorName = `${selectedDonorForMeeting.firstName} ${selectedDonorForMeeting.lastName}`;
      const donorId = selectedDonorForMeeting.id;
      
      const topic = `Meeting with ${donorName}`;
      const startTime = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      
      // DEBUG LOGGING
      console.log('=== DEBUG Meeting Data ===');
      console.log('donorId:', donorId);
      console.log('donorName:', donorName);
      console.log('startTime:', startTime);
      console.log('isValid startTime:', !isNaN(new Date(startTime).getTime()));
      console.log('======================');
      
      // Validate required fields
      if (!donorId) {
        throw new Error('Missing donor ID');
      }
      if (!startTime || isNaN(new Date(startTime).getTime())) {
        throw new Error('Invalid start time');
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
        });

        const zoomResult = await zoomResponse.json();
        
        if (!zoomResponse.ok) {
          throw new Error(zoomResult?.error || 'Zoom API failed');
        }

        // Prepare meeting data
        const meetingData = {
          donorId: donorId,
          title: topic.trim(),
          description: 'Quick Zoom meeting created from schedule page',
          startTime: startTime,
          duration: 30,
          meetingType: 'VIRTUAL',
          zoomMeetingId: zoomResult.meeting?.id,
          zoomJoinUrl: zoomResult.meeting?.join_url,
          zoomStartUrl: zoomResult.meeting?.start_url,
          notes: 'Auto-generated quick Zoom meeting',
          status: 'SCHEDULED'
        };

        // Log what we're sending
        console.log('Sending meeting data:', meetingData);
        
        // 2. Save to database using meetings API
        const meetingResponse = await fetch('/api/communications/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meetingData),
        });

        const meetingResult = await meetingResponse.json();
        
        if (!meetingResponse.ok) {
          throw new Error(meetingResult?.error || 'Failed to save meeting');
        }

        alert(`Zoom meeting created successfully!\nJoin URL: ${zoomResult.meeting.join_url}`);
        await loadMeetings();

      } catch (zoomError) {
        // If Zoom fails, still create a meeting without Zoom link
        console.log('Zoom failed, creating meeting without Zoom:', zoomError.message);
        
        // Prepare meeting data without Zoom info
        const meetingData = {
          donorId: donorId,
          title: 'Quick Meeting',
          description: 'Meeting created from schedule page',
          startTime: startTime,
          duration: 30,
          meetingType: 'VIRTUAL',
          notes: 'Auto-generated meeting (Zoom not configured)',
          status: 'SCHEDULED'
        };
        
        const meetingResponse = await fetch('/api/communications/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meetingData),
        });

        const meetingResult = await meetingResponse.json();
        
        if (meetingResponse.ok) {
          alert('Meeting created successfully! (Zoom not configured)');
          await loadMeetings();
        } else {
          throw new Error(meetingResult?.error || 'Failed to save meeting');
        }
      }

    } catch (error) {
      console.error('Meeting creation error:', error);
      alert(error.message || 'Failed to create meeting. Please try again.');
    } finally {
      setCreatingZoom(false);
    }
  };

  // Delete meeting
  const deleteMeeting = async (meetingId) => {
    if (confirm('Are you sure you want to cancel this meeting?')) {
      try {
        const response = await fetch(`/api/communications/meetings?id=${meetingId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            await loadMeetings();
            alert('Meeting cancelled successfully');
          } else {
            throw new Error(result.error || 'Failed to delete meeting');
          }
        } else {
          throw new Error('Failed to delete meeting');
        }
      } catch (error) {
        console.error('Failed to delete meeting:', error);
        alert(error.message || 'Failed to cancel meeting');
      }
    }
  }

  if (loading && view === 'list') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // New Meeting View
  if (view === 'new-meeting') {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => {
              setSelectedDonorId(null);
              setSelectedDonor(null);
              router.push('/communications/schedule?view=list');
            }}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Schedule New Meeting</h1>
            <p className="text-gray-600">Create a new meeting with Zoom integration</p>
          </div>
        </div>
        
        {/* Donor Selection Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select Donor</h2>
              <p className="text-sm text-gray-600">Choose a donor to schedule a meeting with</p>
            </div>
            {selectedDonor && (
              <button
                onClick={() => {
                  setSelectedDonorId(null);
                  setSelectedDonor(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change Donor
              </button>
            )}
          </div>
          
          {!selectedDonor ? (
            <div className="space-y-4">
              <div className="relative">
                <button
                  onClick={() => setShowDonorDropdown(!showDonorDropdown)}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Select a donor...</span>
                  </div>
                  <svg 
                    className={`h-5 w-5 text-gray-400 transition-transform ${showDonorDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDonorDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {donorLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : donors.length > 0 ? (
                      donors.map((donor) => (
                        <button
                          key={donor.id}
                          onClick={() => {
                            handleDonorSelect(donor.id);
                            setShowDonorDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {donor.firstName} {donor.lastName}
                          </div>
                          <div className="text-sm text-gray-600">{donor.email}</div>
                          {donor.company && (
                            <div className="text-xs text-gray-500 mt-1">{donor.company}</div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No donors found. Please add donors first.
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700">
                    Can't find your donor? Add them first from the Donors page.
                  </span>
                </div>
                <button
                  onClick={() => router.push('/donors')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Go to Donors
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <UserIcon className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-gray-900">
                      {selectedDonor.firstName} {selectedDonor.lastName}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 ml-7">
                    <div>Email: {selectedDonor.email}</div>
                    {selectedDonor.phone && (
                      <div>Phone: {selectedDonor.phone}</div>
                    )}
                    {selectedDonor.company && (
                      <div>Company: {selectedDonor.company}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDonorId(null);
                    setSelectedDonor(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Schedule Meeting Form (only show if donor is selected) */}
        {selectedDonorId ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Meeting Details</h2>
              <p className="text-sm text-gray-600">Schedule meeting with {selectedDonor.firstName} {selectedDonor.lastName}</p>
            </div>
            <ScheduleMeetingForm 
              onScheduled={handleMeetingScheduled}
              donorId={selectedDonorId}
              donorName={`${selectedDonor.firstName} ${selectedDonor.lastName}`}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Donor Selected</h3>
              <p className="text-gray-600 mb-4">Please select a donor from the dropdown above to schedule a meeting.</p>
              <button
                onClick={() => setShowDonorDropdown(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Select a Donor
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Main list view
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meeting Schedule</h1>
          <p className="text-gray-600">Manage scheduled meetings with donors</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelectedDonorId(null);
              setSelectedDonor(null);
              router.push('/communications/schedule?view=new-meeting');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <VideoCameraIcon className="h-5 w-5 mr-2" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Quick Donor Selection for Quick Zoom Meeting */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Quick Meeting Settings</h3>
        <p className="text-sm text-blue-700 mb-3">Select a donor for quick meetings:</p>
        <div className="flex items-center space-x-4">
          <div className="flex-grow">
            <select
              value={selectedDonorId || ''}
              onChange={(e) => handleDonorSelect(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select donor for quick meetings...</option>
              {donors.map((donor) => (
                <option key={donor.id} value={donor.id}>
                  {donor.firstName} {donor.lastName} {donor.email ? `(${donor.email})` : ''}
                </option>
              ))}
            </select>
          </div>
          {selectedDonor && (
            <div className="text-sm text-gray-600">
              Selected: <span className="font-medium">{selectedDonor.firstName} {selectedDonor.lastName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Meetings Tab Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zoom Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {meetings.length > 0 ? (
                meetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{meeting.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{meeting.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {meeting.donor?.firstName} {meeting.donor?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{meeting.donor?.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {meeting.startTime ? new Date(meeting.startTime).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {meeting.startTime ? new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meeting.duration || 30} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {meeting.meetingType?.toLowerCase() || 'virtual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {meeting.zoomJoinUrl ? (
                        <a 
                          href={meeting.zoomJoinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 text-sm flex items-center"
                        >
                          <VideoCameraIcon className="h-4 w-4 mr-1" />
                          Join Meeting
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No Zoom link</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => {
                          // TODO: Implement edit meeting
                          router.push(`/communications/schedule?view=edit&id=${meeting.id}`);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => deleteMeeting(meeting.id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No scheduled meetings found.
                    <div className="mt-4 flex justify-center space-x-4">
                      <button
                        onClick={() => {
                          setSelectedDonorId(null);
                          setSelectedDonor(null);
                          router.push('/communications/schedule?view=new-meeting');
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <VideoCameraIcon className="h-5 w-5 mr-2" />
                        Schedule Meeting
                      </button>
                      <button
                        onClick={createZoomMeeting}
                        disabled={creatingZoom || (!selectedDonorId && donors.length === 0)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingZoom ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          'Quick Meeting'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <VideoCameraIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="ml-4 font-medium text-gray-900">Quick Zoom Meeting</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {selectedDonor 
              ? `Create a Zoom meeting with ${selectedDonor.firstName} ${selectedDonor.lastName}`
              : 'Create a Zoom meeting (select a donor above first)'}
          </p>
          <button
            onClick={createZoomMeeting}
            disabled={creatingZoom || (!selectedDonorId && donors.length === 0)}
            className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {creatingZoom ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></div>
                Creating...
              </>
            ) : (
              selectedDonor ? `Quick Zoom with ${selectedDonor.firstName}` : 'Quick Zoom Meeting'
            )}
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="ml-4 font-medium text-gray-900">Schedule Custom Meeting</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Schedule a meeting with custom details and donor selection</p>
          <button
            onClick={() => {
              setSelectedDonorId(null);
              setSelectedDonor(null);
              router.push('/communications/schedule?view=new-meeting');
            }}
            className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded-lg text-sm font-medium"
          >
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Integration Status */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded border flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium">Donors Available</span>
              </div>
              <div className="text-sm text-gray-600">
                {donors.length} donor{donors.length !== 1 ? 's' : ''} loaded
              </div>
            </div>
            <div className={`h-3 w-3 rounded-full ${donors.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          
          <div className="p-4 bg-white rounded border flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <VideoCameraIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium">Zoom Integration</span>
              </div>
              <div className="text-sm text-gray-600">
                {process.env.NEXT_PUBLIC_ZOOM_API_KEY ? 'Zoom API Connected' : 'Zoom API Not Configured'}
              </div>
            </div>
            <div className={`h-3 w-3 rounded-full ${process.env.NEXT_PUBLIC_ZOOM_API_KEY ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          
          <div className="p-4 bg-white rounded border flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium">Meetings Database</span>
              </div>
              <div className="text-sm text-gray-600">
                {meetings.length > 0 ? `${meetings.length} meetings loaded` : 'No meetings found'}
              </div>
            </div>
            <div className={`h-3 w-3 rounded-full ${meetings.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

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