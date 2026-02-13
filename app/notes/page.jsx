'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAI } from '../providers/AIProvider';
import {
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import styles from './Notes.module.css';

// ============================================
// NOTES PAGE - Centralized Notes Management
// ============================================
// 
// Data Sources:
// - Donor Notes: From donor.notes field
// - Donation Notes: From donation.notes field  
// - Communication Notes: From communication.content field
// - Meeting Notes: From meeting.notes field
// - Task Notes: From task.description field
//
// Features:
// - View all notes from all sources
// - Filter by source, donor, date
// - Search notes
// - Create new notes
// - Edit existing notes
// - Delete notes
// - AI-suggested responses (coming soon)
// ============================================

export default function NotesPage() {
  const router = useRouter();
  const { apiClient, user } = useAI();

  // ============ State Management ============
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donors, setDonors] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [formData, setFormData] = useState({
    source: 'DONOR',
    sourceId: '',
    donorId: '',
    content: '',
    title: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [suggestedResponses, setSuggestedResponses] = useState([]);

  // ============ Source Options ============
  const sourceOptions = [
    { value: 'ALL', label: 'All Sources', icon: DocumentTextIcon },
    { value: 'DONOR', label: 'Donor Notes', icon: UserGroupIcon },
    { value: 'DONATION', label: 'Donation Notes', icon: CurrencyDollarIcon },
    { value: 'COMMUNICATION', label: 'Communications', icon: EnvelopeIcon },
    { value: 'MEETING', label: 'Meeting Notes', icon: CalendarIcon },
    { value: 'TASK', label: 'Task Notes', icon: CheckCircleIcon }
  ];

  // ============ Fetch Notes ============
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (selectedSource !== 'ALL') params.append('source', selectedSource);
      if (selectedDonor) params.append('donorId', selectedDonor);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '500');
      params.append('includeSimulated', 'false');

      const response = await fetch(`/api/communications/notes?${params.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const result = await response.json();
      
      if (result.success) {
        setNotes(result.data.notes);
        setFilteredNotes(result.data.notes);
        setCounts(result.data.counts);
        setSuggestedResponses(result.data.suggestedResponses || []);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSource, selectedDonor, searchQuery]);

  // ============ Fetch Donors for Selection ============
  const fetchDonors = useCallback(async () => {
    try {
      const response = await fetch('/api/donors?limit=100&fields=id,firstName,lastName,email', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setDonors(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching donors:', err);
    }
  }, []);

  // ============ Initial Load ============
  useEffect(() => {
    fetchNotes();
    fetchDonors();
  }, [fetchNotes, fetchDonors]);

  // ============ Filter Notes ============
  useEffect(() => {
    let filtered = [...notes];

    // Filter by source
    if (selectedSource !== 'ALL') {
      filtered = filtered.filter(note => note.source === selectedSource);
    }

    // Filter by donor
    if (selectedDonor) {
      filtered = filtered.filter(note => note.donorId === selectedDonor);
    }

    // Search in content
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.content?.toLowerCase().includes(query) ||
        note.title?.toLowerCase().includes(query) ||
        note.donorName?.toLowerCase().includes(query)
      );
    }

    setFilteredNotes(filtered);
  }, [notes, selectedSource, selectedDonor, searchQuery]);

  // ============ Create Note ============
  const handleCreateNote = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      alert('Note content is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/communications/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Refresh notes list
        await fetchNotes();
        
        // Reset form and close modal
        setFormData({
          source: 'DONOR',
          sourceId: '',
          donorId: '',
          content: '',
          title: ''
        });
        setShowCreateModal(false);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error creating note:', err);
      alert(`Failed to create note: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ============ Update Note ============
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      alert('Note content is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/communications/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        await fetchNotes();
        setShowEditModal(false);
        setCurrentNote(null);
        setFormData({
          source: 'DONOR',
          sourceId: '',
          donorId: '',
          content: '',
          title: ''
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error updating note:', err);
      alert(`Failed to update note: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ============ Delete Note ============
  const handleDeleteNote = async (note) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/communications/notes?source=${note.source}&sourceId=${note.sourceId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      const result = await response.json();

      if (result.success) {
        await fetchNotes();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      alert(`Failed to delete note: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // ============ Edit Note Handler ============
  const handleEditClick = (note) => {
    setCurrentNote(note);
    setFormData({
      source: note.source,
      sourceId: note.sourceId,
      donorId: note.donorId || '',
      content: note.content,
      title: note.title || ''
    });
    setShowEditModal(true);
  };

  // ============ Format Date ============
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // ============ Get Source Icon ============
  const getSourceIcon = (source) => {
    const option = sourceOptions.find(opt => opt.value === source);
    return option?.icon || DocumentTextIcon;
  };

  // ============ Get Source Color ============
  const getSourceColor = (source) => {
    const colors = {
      DONOR: '#3b82f6', // blue
      DONATION: '#10b981', // green
      COMMUNICATION: '#8b5cf6', // purple
      MEETING: '#f59e0b', // orange
      TASK: '#ef4444' // red
    };
    return colors[source] || '#6b7280';
  };

  // ============ Clear Filters ============
  const clearFilters = () => {
    setSelectedSource('ALL');
    setSelectedDonor(null);
    setSearchQuery('');
  };

  // ============ Render ============
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleSection}>
            <DocumentTextIcon className={styles.titleIcon} />
            <h1 className={styles.title}>Notes Center</h1>
            <span className={styles.noteCount}>
              {filteredNotes.length} {filteredNotes.length === 1 ? 'Note' : 'Notes'}
            </span>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={() => setShowCreateModal(true)}
              className={styles.createButton}
            >
              <PlusIcon className={styles.buttonIcon} />
              New Note
            </button>
            <button
              onClick={fetchNotes}
              className={styles.refreshButton}
              disabled={loading}
            >
              <ArrowPathIcon className={`${styles.buttonIcon} ${loading ? styles.spinning : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className={styles.statsGrid}>
          {sourceOptions.filter(opt => opt.value !== 'ALL').map((source) => {
            const Icon = source.icon;
            const count = counts.bySource?.[source.value] || 0;
            return (
              <div 
                key={source.value}
                className={`${styles.statCard} ${selectedSource === source.value ? styles.active : ''}`}
                onClick={() => setSelectedSource(source.value === selectedSource ? 'ALL' : source.value)}
              >
                <Icon className={styles.statIcon} style={{ color: getSourceColor(source.value) }} />
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>{source.label}</span>
                  <span className={styles.statValue}>{count}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBar}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={styles.clearSearch}
              >
                <XMarkIcon className={styles.clearIcon} />
              </button>
            )}
          </div>

          <select
            value={selectedDonor || ''}
            onChange={(e) => setSelectedDonor(e.target.value || null)}
            className={styles.donorSelect}
          >
            <option value="">All Donors</option>
            {donors.map(donor => (
              <option key={donor.id} value={donor.id}>
                {donor.firstName} {donor.lastName}
              </option>
            ))}
          </select>

          {(selectedSource !== 'ALL' || selectedDonor || searchQuery) && (
            <button
              onClick={clearFilters}
              className={styles.clearFiltersButton}
            >
              <FunnelIcon className={styles.buttonIcon} />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* AI Suggested Responses (Placeholder for future integration) */}
      {suggestedResponses.length > 0 && (
        <div className={styles.suggestionsSection}>
          <div className={styles.suggestionsHeader}>
            <SparklesIcon className={styles.suggestionsIcon} />
            <h3>AI Suggested Responses</h3>
          </div>
          <div className={styles.suggestionsList}>
            {suggestedResponses.map((response, index) => (
              <div key={index} className={styles.suggestionCard}>
                <ChatBubbleLeftRightIcon className={styles.suggestionIcon} />
                <p className={styles.suggestionText}>{response}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className={styles.notesList}>
        {loading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.noteCardSkeleton}>
              <div className={styles.skeletonIcon}></div>
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonText}></div>
                <div className={styles.skeletonText}></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className={styles.errorState}>
            <DocumentTextIcon className={styles.errorIcon} />
            <h3>Error Loading Notes</h3>
            <p>{error}</p>
            <button onClick={fetchNotes} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <DocumentTextIcon className={styles.emptyIcon} />
            <h3>No Notes Found</h3>
            <p>
              {searchQuery || selectedSource !== 'ALL' || selectedDonor
                ? 'Try adjusting your filters'
                : 'Create your first note to get started'}
            </p>
            {!searchQuery && selectedSource === 'ALL' && !selectedDonor && (
              <button
                onClick={() => setShowCreateModal(true)}
                className={styles.createFirstButton}
              >
                <PlusIcon className={styles.buttonIcon} />
                Create Note
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => {
            const SourceIcon = getSourceIcon(note.source);
            const sourceColor = getSourceColor(note.source);
            
            return (
              <div key={note.id} className={styles.noteCard}>
                <div className={styles.noteHeader}>
                  <div className={styles.noteSource}>
                    <div 
                      className={styles.sourceIconContainer}
                      style={{ backgroundColor: `${sourceColor}15` }}
                    >
                      <SourceIcon 
                        className={styles.sourceIcon} 
                        style={{ color: sourceColor }} 
                      />
                    </div>
                    <div className={styles.sourceInfo}>
                      <span className={styles.sourceType}>
                        {sourceOptions.find(opt => opt.value === note.source)?.label || note.source}
                      </span>
                      <span className={styles.noteTitle}>{note.title}</span>
                    </div>
                  </div>
                  <div className={styles.noteActions}>
                    <button
                      onClick={() => handleEditClick(note)}
                      className={styles.editButton}
                      title="Edit note"
                    >
                      <PencilIcon className={styles.actionIcon} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note)}
                      className={styles.deleteButton}
                      title="Delete note"
                      disabled={deleting}
                    >
                      <TrashIcon className={styles.actionIcon} />
                    </button>
                  </div>
                </div>

                <div className={styles.noteContent}>
                  <p>{note.content}</p>
                </div>

                <div className={styles.noteFooter}>
                  <div className={styles.noteDonor}>
                    <UserGroupIcon className={styles.footerIcon} />
                    <span>
                      {note.donorName || 'No donor'}
                      {note.donorEmail && ` · ${note.donorEmail}`}
                    </span>
                  </div>
                  <div className={styles.noteMeta}>
                    <ClockIcon className={styles.footerIcon} />
                    <span className={styles.noteTimestamp}>
                      Created: {formatDate(note.createdAt)}
                    </span>
                    {note.updatedAt !== note.createdAt && (
                      <span className={styles.noteTimestamp}>
                        · Updated: {formatDate(note.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata Badges */}
                <div className={styles.noteBadges}>
                  {note.amount && (
                    <span className={styles.badge}>
                      <CurrencyDollarIcon className={styles.badgeIcon} />
                      ${note.amount.toLocaleString()}
                    </span>
                  )}
                  {note.campaign && (
                    <span className={styles.badge}>
                      Campaign: {note.campaign.name}
                    </span>
                  )}
                  {note.meetingStatus && (
                    <span className={styles.badge}>
                      <CalendarIcon className={styles.badgeIcon} />
                      {note.meetingStatus}
                    </span>
                  )}
                  {note.taskPriority && (
                    <span className={`${styles.badge} ${styles[`priority_${note.taskPriority.toLowerCase()}`]}`}>
                      Priority: {note.taskPriority}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Note</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className={styles.modalClose}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Source Type *</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className={styles.formSelect}
                  required
                >
                  {sourceOptions.filter(opt => opt.value !== 'ALL').map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Source ID *</label>
                <input
                  type="text"
                  value={formData.sourceId}
                  onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                  className={styles.formInput}
                  placeholder={`Enter ${formData.source} ID`}
                  required
                />
                <small className={styles.formHint}>
                  The ID of the {formData.source.toLowerCase()} record
                </small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Donor</label>
                <select
                  value={formData.donorId}
                  onChange={(e) => setFormData({ ...formData, donorId: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="">Select Donor (Optional)</option>
                  {donors.map(donor => (
                    <option key={donor.id} value={donor.id}>
                      {donor.firstName} {donor.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={styles.formInput}
                  placeholder="Note title (optional)"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Note Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={styles.formTextarea}
                  placeholder="Enter your note..."
                  rows={6}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.submitButton}
                >
                  {saving ? (
                    <>
                      <ArrowPathIcon className={`${styles.buttonIcon} ${styles.spinning}`} />
                      Creating...
                    </>
                  ) : (
                    'Create Note'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditModal && currentNote && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Note</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentNote(null);
                }}
                className={styles.modalClose}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleUpdateNote} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Source</label>
                <input
                  type="text"
                  value={formData.source}
                  className={styles.formInput}
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Source ID</label>
                <input
                  type="text"
                  value={formData.sourceId}
                  className={styles.formInput}
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={styles.formInput}
                  placeholder="Note title (optional)"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Note Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={styles.formTextarea}
                  rows={6}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentNote(null);
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.submitButton}
                >
                  {saving ? (
                    <>
                      <ArrowPathIcon className={`${styles.buttonIcon} ${styles.spinning}`} />
                      Updating...
                    </>
                  ) : (
                    'Update Note'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}