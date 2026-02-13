// ============================================
// Notes API Client
// Centralized client for notes operations
// ============================================

class NotesClient {
  constructor(baseUrl = '/api/communications/notes') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch notes with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.donorId - Filter by donor
   * @param {string} params.userId - Filter by user
   * @param {string} params.source - Filter by source (DONOR, DONATION, COMMUNICATION, MEETING, TASK)
   * @param {number} params.limit - Results per page
   * @param {number} params.offset - Pagination offset
   * @param {string} params.search - Search in content
   * @param {boolean} params.includeSimulated - Include simulated data
   */
  async getNotes(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new note
   * @param {Object} data - Note data
   * @param {string} data.source - Source type (DONOR, DONATION, COMMUNICATION, MEETING, TASK)
   * @param {string} data.sourceId - ID of the source record
   * @param {string} data.content - Note content
   * @param {string} data.donorId - Associated donor ID
   * @param {string} data.title - Optional title
   * @param {Object} data.metadata - Additional metadata
   */
  async createNote(data) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create note: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update an existing note
   * @param {Object} data - Note data
   * @param {string} data.source - Source type
   * @param {string} data.sourceId - ID of the source record
   * @param {string} data.content - Updated note content
   * @param {string} data.title - Updated title
   * @param {Object} data.metadata - Additional metadata
   */
  async updateNote(data) {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update note: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a note
   * @param {string} source - Source type
   * @param {string} sourceId - ID of the source record
   */
  async deleteNote(source, sourceId) {
    const response = await fetch(`${this.baseUrl}?source=${source}&sourceId=${sourceId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete note: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get notes summary/counts by source
   */
  async getNotesSummary() {
    const response = await this.getNotes({ limit: 1 });
    return response.data?.counts || { bySource: {} };
  }
}

// Create and export singleton instance
export const notesClient = new NotesClient();
export default notesClient;