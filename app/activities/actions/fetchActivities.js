'use server';

export async function fetchActivities(params = {}) {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    // Add default values if not provided
    if (!params.limit) queryParams.append('limit', '25');
    if (!params.timeframe) queryParams.append('timeframe', '30days');
    if (!params.page) queryParams.append('page', '1');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/donor-activity?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return {
      success: false,
      data: {
        activities: [],
        summary: {
          totalActivities: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 25,
          hasMore: false,
          stats: {
            totalActivities: 0,
            byType: {
              DONATION: 0,
              COMMUNICATION: 0,
              MEETING: 0,
              ACTIVITY: 0
            }
          }
        }
      }
    };
  }
}