'use client'

import { useState } from 'react'
import { 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  XMarkIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import dateHelpers from '../../../utils/dateHelpers'
import styles from './RelationshipNotes.module.css'

const initialNotes = [
  {
    id: 1,
    author: 'Sarah Johnson',
    role: 'Development Officer',
    date: '2024-01-15',
    content: 'Met with donor to discuss scholarship program. Very interested in supporting STEM initiatives. Mentioned his daughter is starting engineering program this fall.',
    category: 'Meeting',
    tags: ['scholarship', 'STEM', 'personal']
  },
  {
    id: 2,
    author: 'Michael Chen',
    role: 'Volunteer Coordinator',
    date: '2023-12-05',
    content: 'Volunteered at holiday gala. Brought his entire family. Great engagement with other donors.',
    category: 'Event',
    tags: ['volunteer', 'family', 'event']
  },
  {
    id: 3,
    author: 'Emily Rodriguez',
    role: 'Executive Director',
    date: '2023-10-20',
    content: 'Phone call to thank for recent gift. Discussed upcoming capital campaign. Will follow up in 2 weeks.',
    category: 'Phone Call',
    tags: ['thank you', 'follow up', 'campaign']
  }
]

export default function RelationshipNotes({ donorId }) {
  const [notes, setNotes] = useState(initialNotes)
  const [editingNote, setEditingNote] = useState(null)
  const [newNote, setNewNote] = useState('')
  const [newCategory, setNewCategory] = useState('General')
  const [newTags, setNewTags] = useState('')

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note = {
      id: notes.length + 1,
      author: 'You',
      role: 'Current User',
      date: new Date().toISOString().split('T')[0],
      content: newNote,
      category: newCategory,
      tags: newTags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    setNotes([note, ...notes])
    setNewNote('')
    setNewCategory('General')
    setNewTags('')
  }

  const handleEditNote = (note) => {
    setEditingNote({ ...note })
  }

  const handleSaveEdit = () => {
    setNotes(notes.map(note => 
      note.id === editingNote.id ? editingNote : note
    ))
    setEditingNote(null)
  }

  const handleDeleteNote = (id) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id))
    }
  }

  const categories = ['General', 'Meeting', 'Phone Call', 'Email', 'Event', 'Personal']

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Relationship Notes</h3>
          <p className={styles.description}>
            Track interactions and personal details
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.noteCount}>{notes.length} notes</span>
        </div>
      </div>

      {/* Add New Note */}
      <div className={styles.addNoteContainer}>
        <div className={styles.addNoteHeader}>
          <ChatBubbleLeftRightIcon className={styles.addNoteIcon} />
          <p className={styles.addNoteTitle}>Add New Note</p>
        </div>
        
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this donor (interests, conversations, follow-ups needed...)"
          className={styles.textarea}
          rows="3"
        />

        <div className={styles.formGrid}>
          <div>
            <label className={styles.label}>
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={styles.select}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.tagsContainer}>
            <label className={styles.label}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="scholarship, follow-up, meeting"
              className={styles.input}
            />
          </div>
        </div>

        <button
          onClick={handleAddNote}
          disabled={!newNote.trim()}
          className={styles.addButton}
        >
          Add Note
        </button>
      </div>

      {/* Notes List */}
      <div className={styles.notesList}>
        {notes.map((note) => (
          <div
            key={note.id}
            className={styles.noteCard}
          >
            {editingNote?.id === note.id ? (
              <div className={styles.editContainer}>
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                  className={styles.editTextarea}
                  rows="3"
                />
                <div className={styles.editButtons}>
                  <button
                    onClick={() => setEditingNote(null)}
                    className={styles.cancelButton}
                  >
                    <XMarkIcon className={styles.buttonIcon} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className={styles.saveButton}
                  >
                    <CheckIcon className={styles.buttonIcon} />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.noteHeader}>
                  <div className={styles.noteAuthor}>
                    <div className={styles.authorIcon}>
                      <UserCircleIcon className={styles.userIcon} />
                    </div>
                    <div>
                      <p className={styles.authorName}>{note.author}</p>
                      <p className={styles.authorRole}>{note.role}</p>
                    </div>
                  </div>
                  <div className={styles.noteMeta}>
                    <p className={styles.noteDate}>
                      {dateHelpers.formatDate(note.date, 'MMM d, yyyy')}
                    </p>
                    <span className={styles.categoryBadge}>
                      {note.category}
                    </span>
                  </div>
                </div>

                <div className={styles.noteContent}>
                  <p className={styles.contentText}>{note.content}</p>
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className={styles.tagsList}>
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={styles.tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.noteActions}>
                  <button
                    onClick={() => handleEditNote(note)}
                    className={styles.editAction}
                  >
                    <PencilIcon className={styles.actionIcon} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className={styles.deleteAction}
                  >
                    <TrashIcon className={styles.actionIcon} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {notes.length === 0 && (
          <div className={styles.emptyState}>
            <ChatBubbleLeftRightIcon className={styles.emptyIcon} />
            <p className={styles.emptyText}>No notes yet. Add your first note above.</p>
          </div>
        )}
      </div>
    </div>
  )
}