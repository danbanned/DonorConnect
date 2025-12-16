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
import { dateHelpers } from '@/utils/dateHelpers'

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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Relationship Notes</h3>
          <p className="text-sm text-gray-600 mt-1">
            Track interactions and personal details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{notes.length} notes</span>
        </div>
      </div>

      {/* Add New Note */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
          <p className="font-medium text-blue-900">Add New Note</p>
        </div>
        
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this donor (interests, conversations, follow-ups needed...)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
          rows="3"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="scholarship, follow-up, meeting"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={handleAddNote}
          disabled={!newNote.trim()}
          className="btn-primary w-full"
        >
          Add Note
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
          >
            {editingNote?.id === note.id ? (
              <div className="space-y-3">
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows="3"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingNote(null)}
                    className="btn-secondary"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="btn-primary"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{note.author}</p>
                      <p className="text-sm text-gray-600">{note.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {dateHelpers.formatDate(note.date, 'MMM d, yyyy')}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded mt-1">
                      {note.category}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-gray-600 mt-2">No notes yet. Add your first note above.</p>
          </div>
        )}
      </div>
    </div>
  )
}