// lib/donorActivity.js
// Client-safe helper that calls ONE API endpoint for all activity data

/**
 * Get all activity data in one call
 * @param {Object} options
 * @param {string} options.organizationId - Required
 * @param {string} [options.donorId] - Optional donor filter
 * @param {string} [options.timeframe] - '7days', '30days', '90days', 'year', 'all'
 * @param {number} [options.limit] - Default 25
 * @param {number} [options.page] - Default 1
 * @param {string[]} [options.types] - Filter by types: DONATION, COMMUNICATION, MEETING, NOTE, STATUS
 * @returns {Promise} Unified activity data with summary and stats
 */
export async function getActivityData(options = {}) {
  const {
    organizationId,
    donorId,
    timeframe = '30days',
    limit = 25,
    page = 1,
    types = []
  } = options;

  // Validate required parameter
  if (!organizationId) {
    throw new Error('organizationId is required');
  }

  const params = new URLSearchParams();

  // Always include organizationId
  params.append('organizationId', organizationId);
  
  // Optional filters
  if (donorId) params.append('donorId', donorId);
  if (timeframe) params.append('timeframe', timeframe);
  if (limit) params.append('limit', limit.toString());
  if (page) params.append('page', page.toString());
  if (types.length > 0) params.append('types', types.join(','));

  // Fix: Use absolute URL for server-side calls
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/donor-activity?${params.toString()}`;
  
  console.log('📊 Fetching activity data from:', url);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Failed to load activity data:', errorText);
      throw new Error(`Failed to load activity data: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to load activity data');
    }

    return data;
  } catch (error) {
    console.error('🚨 Fetch error in getActivityData:', error);
    throw error;
  }
}

/**
 * Create a new activity
 * @param {Object} activityData - Activity data to create
 * @returns {Promise} Created activity
 */
export async function createActivity(activityData) {
  // Fix for server-side: Use absolute URL
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/donor-activity`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activityData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Failed to create activity:', errorText);
    throw new Error(`Failed to create activity: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create activity');
  }

  return data;
}

/**
 * Get dashboard-ready activity feed
 * This is a convenience wrapper around getActivityData
 */
export async function getDashboardFeed(organizationId, limit = 10) {
  const data = await getActivityData({
    organizationId,
    timeframe: '7days', // Recent activity for dashboard
    limit,
    page: 1,
    types: [] // All types
  });

  // Format for dashboard display
  const formattedActivities = data.data.activities.map(activity => ({
    id: activity.id,
    donor: activity.donor,
    action: activity.displayAction,
    amount: activity.amount ? `$${activity.amount.toLocaleString()}` : '',
    time: activity.time,
    icon: activity.icon,
    type: activity.type,
    description: activity.description,
    raw: activity.rawData // Keep raw data in case needed
  }));

  return {
    activities: formattedActivities,
    summary: data.data.summary,
    stats: data.data.summary.stats
  };
}

/**
 * Get donor timeline
 * This is a convenience wrapper around getActivityData
 */
export async function getDonorTimeline(donorId, organizationId, limit = 50) {
  try {
    const data = await getActivityData({
      organizationId,
      donorId,
      timeframe: 'all', // All time for timeline
      limit,
      page: 1,
      types: [] // All types
    });

    // Format for timeline display
    const timeline = data.data.activities.map(activity => ({
      id: activity.id,
      date: activity.createdAt,
      title: activity.displayAction,
      description: activity.description,
      amount: activity.amount,
      type: activity.type,
      icon: activity.icon,
      donor: activity.donor,
      raw: activity.rawData
    }));

    return {
      timeline,
      summary: data.data.summary
    };
  } catch (error) {
    console.error('🚨 Error in getDonorTimeline:', error);
    // Return empty timeline instead of throwing if API fails
    return {
      timeline: [],
      summary: null
    };
  }
}

/**
 * Get activity statistics
 * This extracts stats from getActivityData response
 */
export async function getActivityStats(organizationId, timeframe = '30days') {
  const data = await getActivityData({
    organizationId,
    timeframe,
    limit: 1, // Minimal data, just need stats
    page: 1
  });

  return {
    stats: data.data.summary.stats,
    counts: data.data.rawCounts,
    timeframe
  };
}

/**
 * Quick helpers for common activity creation
 */
export const ActivityHelpers = {
  /**
   * Create donation activity
   */
  async logDonation(donation, donor, user) {
    return createActivity({
      donorId: donor.id,
      organizationId: donation.organizationId,
      type: 'DONATION',
      action: 'DONATION_RECEIVED',
      title: 'Donation Received',
      description: `Donation of $${donation.amount.toLocaleString()} received`,
      amount: donation.amount,
      relatedDonationId: donation.id,
      metadata: {
        paymentMethod: donation.paymentMethod,
        isRecurring: donation.isRecurring,
        donorName: `${donor.firstName} ${donor.lastName}`,
        processedBy: user?.name || 'System'
      }
    });
  },

  /**
   * Create meeting activity
   */
  async logMeeting(meeting, donor, user) {
    return createActivity({
      donorId: donor.id,
      organizationId: meeting.organizationId,
      type: 'MEETING',
      action: 'MEETING_SCHEDULED',
      title: 'Meeting Scheduled',
      description: `Meeting scheduled for ${new Date(meeting.startTime).toLocaleDateString()}`,
      relatedMeetingId: meeting.id,
      metadata: {
        meetingTitle: meeting.title,
        startTime: meeting.startTime,
        scheduledBy: user?.name || 'System',
        duration: meeting.duration
      }
    });
  },

  /**
   * Create communication activity
   */
  async logCommunication(communication, donor, user) {
    return createActivity({
      donorId: donor.id,
      organizationId: communication.organizationId,
      type: 'COMMUNICATION',
      action: `${communication.type}_SENT`,
      title: `${communication.type.replace('_', ' ')} Sent`,
      description: communication.subject || `Communication sent to donor`,
      relatedCommunicationId: communication.id,
      metadata: {
        subject: communication.subject,
        type: communication.type,
        sentBy: user?.name || 'System',
        sentAt: communication.sentAt
      }
    });
  },

  /**
   * Create note activity
   */
  async logNote(donorId, organizationId, noteContent, user) {
    return createActivity({
      donorId,
      organizationId,
      type: 'NOTE',
      action: 'NOTE_ADDED',
      title: 'Note Added',
      description: noteContent.substring(0, 100) + (noteContent.length > 100 ? '...' : ''),
      metadata: {
        noteLength: noteContent.length,
        addedBy: user?.name || 'System',
        preview: noteContent.substring(0, 200)
      }
    });
  }
};

/**
 * React hook for using activity data
 * Example usage in components
 */
export function useActivityData(options) {
  // This would be a React hook implementation
  // You can implement this separately if needed
  console.warn('useActivityData hook not implemented - use getActivityData directly or implement hook');
  return null;
}

/**
 * Helper to check if we're in a server environment
 */
function isServer() {
  return typeof window === 'undefined';
}

/**
 * Create absolute URL for API calls
 * This handles both client-side and server-side calls
 */
function createApiUrl(path, params = null) {
  let url = path;
  
  if (isServer()) {
    // Server-side: Need absolute URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    url = `${baseUrl}${path}`;
  }
  
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  
  return url;
}