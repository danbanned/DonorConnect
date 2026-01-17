// lib/donorActivity.js
// Client-safe helpers that call API routes
// ❌ NO Prisma in this file

/**
 * Get recent donor activity with filters
 */
export async function getDonorActivity({ 
  donorId, 
  organizationId,
  limit = 25,
  timeframe = '30days',
  types = [],
  page = 1
} = {}) {
  const params = new URLSearchParams();

  if (donorId) params.append("donorId", donorId);
  if (organizationId) params.append("organizationId", organizationId);
  if (limit) params.append("limit", limit);
  if (timeframe) params.append("timeframe", timeframe);
  if (types && types.length > 0) params.append("types", types.join(','));
  if (page) params.append("page", page);

  const res = await fetch(`/api/donor-activity?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to load donor activity:', errorText);
    throw new Error(`Failed to load donor activity: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get dashboard activity feed for homepage
 */
export async function getDashboardActivityFeed({ 
  organizationId,
  limit = 10,
  includeSystemEvents = true
} = {}) {
  const params = new URLSearchParams();

  if (organizationId) params.append("organizationId", organizationId);
  if (limit) params.append("limit", limit);
  params.append("includeSystemEvents", includeSystemEvents.toString());

  const res = await fetch(`/api/donor-activity/dashboard?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to load dashboard activity:', errorText);
    throw new Error(`Failed to load dashboard activity: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Create a new donor activity (e.g., note added, meeting scheduled, etc.)
 */
export async function createDonorActivity(activityData) {
  const res = await fetch('/api/donor-activity', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activityData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to create donor activity:', errorText);
    throw new Error(`Failed to create donor activity: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Create multiple activities in batch (e.g., after import)
 */
export async function createBulkDonorActivities(activities) {
  const res = await fetch('/api/donor-activity/bulk', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activities }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to create bulk donor activities:', errorText);
    throw new Error(`Failed to create bulk donor activities: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get activity statistics for a donor or organization
 */
export async function getActivityStats({ 
  donorId, 
  organizationId,
  timeframe = '30days'
} = {}) {
  const params = new URLSearchParams();

  if (donorId) params.append("donorId", donorId);
  if (organizationId) params.append("organizationId", organizationId);
  if (timeframe) params.append("timeframe", timeframe);

  const res = await fetch(`/api/donor-activity/stats?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to load activity stats:', errorText);
    throw new Error(`Failed to load activity stats: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get activity timeline for a donor
 */
export async function getDonorTimeline(donorId, { limit = 50, page = 1 } = {}) {
  const params = new URLSearchParams();

  params.append("donorId", donorId);
  if (limit) params.append("limit", limit);
  if (page) params.append("page", page);

  const res = await fetch(`/api/donor-activity/timeline?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to load donor timeline:', errorText);
    throw new Error(`Failed to load donor timeline: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Mark activity as read
 */
export async function markActivityAsRead(activityId) {
  const res = await fetch(`/api/donor-activity/${activityId}/read`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to mark activity as read:', errorText);
    throw new Error(`Failed to mark activity as read: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Mark all activities as read for a donor or organization
 */
export async function markAllActivitiesAsRead({ donorId, organizationId } = {}) {
  const params = new URLSearchParams();

  if (donorId) params.append("donorId", donorId);
  if (organizationId) params.append("organizationId", organizationId);

  const res = await fetch(`/api/donor-activity/read-all?${params.toString()}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to mark all activities as read:', errorText);
    throw new Error(`Failed to mark all activities as read: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get unread activity count
 */
export async function getUnreadActivityCount({ donorId, organizationId } = {}) {
  const params = new URLSearchParams();

  if (donorId) params.append("donorId", donorId);
  if (organizationId) params.append("organizationId", organizationId);

  const res = await fetch(`/api/donor-activity/unread-count?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to get unread count:', errorText);
    throw new Error(`Failed to get unread count: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Delete an activity (soft delete)
 */
export async function deleteActivity(activityId) {
  const res = await fetch(`/api/donor-activity/${activityId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to delete activity:', errorText);
    throw new Error(`Failed to delete activity: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Search activities by keyword
 */
export async function searchActivities({ 
  query, 
  organizationId,
  donorId,
  types = [],
  startDate,
  endDate,
  limit = 50,
  page = 1
} = {}) {
  const params = new URLSearchParams();

  if (query) params.append("query", query);
  if (organizationId) params.append("organizationId", organizationId);
  if (donorId) params.append("donorId", donorId);
  if (types && types.length > 0) params.append("types", types.join(','));
  if (startDate) params.append("startDate", startDate.toISOString());
  if (endDate) params.append("endDate", endDate.toISOString());
  if (limit) params.append("limit", limit);
  if (page) params.append("page", page);

  const res = await fetch(`/api/donor-activity/search?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to search activities:', errorText);
    throw new Error(`Failed to search activities: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get activity types available for filtering
 */
export async function getActivityTypes(organizationId) {
  const params = new URLSearchParams();
  
  if (organizationId) params.append("organizationId", organizationId);

  const res = await fetch(`/api/donor-activity/types?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to get activity types:', errorText);
    throw new Error(`Failed to get activity types: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Helper function to create a standardized activity object
 */
export function createActivityData({
  donorId,
  organizationId,
  type,
  action,
  title,
  description = '',
  amount = null,
  relatedDonationId = null,
  relatedMeetingId = null,
  relatedCommunicationId = null,
  metadata = {},
  importance = 'NORMAL'
}) {
  return {
    donorId,
    organizationId,
    type,
    action,
    title,
    description,
    amount,
    relatedDonationId,
    relatedMeetingId,
    relatedCommunicationId,
    metadata,
    importance
  };
}

/**
 * Pre-defined activity creators for common actions
 */
export const ActivityCreators = {
  createDonationActivity: (donation, donor, user) => ({
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
    },
    importance: 'HIGH'
  }),

  createMeetingActivity: (meeting, donor, user) => ({
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
    },
    importance: 'NORMAL'
  }),

  createCommunicationActivity: (communication, donor, user) => ({
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
    },
    importance: 'NORMAL'
  }),

  createNoteActivity: (donorId, organizationId, note, user) => ({
    donorId,
    organizationId,
    type: 'NOTE',
    action: 'NOTE_ADDED',
    title: 'Note Added',
    description: note.substring(0, 100) + (note.length > 100 ? '...' : ''),
    metadata: {
      noteLength: note.length,
      addedBy: user?.name || 'System',
      preview: note.substring(0, 200)
    },
    importance: 'LOW'
  }),

  createStatusChangeActivity: (donor, oldStatus, newStatus, user) => ({
    donorId: donor.id,
    organizationId: donor.organizationId,
    type: 'STATUS',
    action: 'STATUS_CHANGED',
    title: 'Donor Status Changed',
    description: `Status changed from ${oldStatus} to ${newStatus}`,
    metadata: {
      oldStatus,
      newStatus,
      changedBy: user?.name || 'System',
      donorName: `${donor.firstName} ${donor.lastName}`
    },
    importance: 'NORMAL'
  })
};

/**
 * Format activity for UI display
 */
export function formatActivityForDisplay(activity) {
  const timeAgo = getTimeAgo(activity.createdAt);
  const formattedAmount = activity.amount 
    ? `$${activity.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '';

  return {
    id: activity.id,
    donor: activity.donorName || (activity.donor ? `${activity.donor.firstName} ${activity.donor.lastName}` : 'System'),
    action: getActionDisplay(activity.action),
    amount: formattedAmount,
    time: timeAgo,
    icon: getIconForAction(activity.action),
    color: getColorForImportance(activity.importance),
    type: activity.type,
    description: activity.description,
    metadata: activity.metadata,
    isRead: activity.isRead,
    createdAt: activity.createdAt
  };
}

// Helper functions
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

function getActionDisplay(action) {
  const actionMap = {
    'DONATION_RECEIVED': 'Made a donation',
    'MEETING_SCHEDULED': 'Meeting scheduled',
    'MEETING_COMPLETED': 'Meeting completed',
    'MEETING_CANCELLED': 'Meeting cancelled',
    'EMAIL_SENT': 'Email sent',
    'PHONE_CALL_SENT': 'Phone call made',
    'THANK_YOU_SENT': 'Thank you note sent',
    'FOLLOW_UP_SENT': 'Follow-up sent',
    'COMMUNICATION_SENT': 'Communication sent',
    'DONOR_UPDATED': 'Information updated',
    'TASK_COMPLETED': 'Task completed',
    'NOTE_ADDED': 'Note added',
    'STATUS_CHANGED': 'Status changed',
    'IMPORT_COMPLETED': 'Import completed',
    'REPORT_GENERATED': 'Report generated'
  };
  return actionMap[action] || action.replace(/_/g, ' ').toLowerCase();
}

function getIconForAction(action) {
  const iconMap = {
    'DONATION_RECEIVED': '💰',
    'MEETING_SCHEDULED': '📅',
    'MEETING_COMPLETED': '✅',
    'MEETING_CANCELLED': '❌',
    'EMAIL_SENT': '📧',
    'PHONE_CALL_SENT': '📞',
    'THANK_YOU_SENT': '🙏',
    'FOLLOW_UP_SENT': '🔄',
    'COMMUNICATION_SENT': '💬',
    'DONOR_UPDATED': '✏️',
    'TASK_COMPLETED': '✅',
    'NOTE_ADDED': '📝',
    'STATUS_CHANGED': '🔄',
    'IMPORT_COMPLETED': '📥',
    'REPORT_GENERATED': '📊'
  };
  return iconMap[action] || '📋';
}

function getColorForImportance(importance) {
  const colorMap = {
    'LOW': 'gray',
    'NORMAL': 'blue',
    'HIGH': 'orange',
    'URGENT': 'red'
  };
  return colorMap[importance] || 'blue';
}