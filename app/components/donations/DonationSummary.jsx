'use client'

import { useState } from 'react'

export default function DonorSummary({ donor }) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(donor.notes || '')

  const handleSaveNotes = async () => {
    // API call to update donor notes
    await fetch(`/api/donors/${donor.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    })
    setIsEditing(false)
  }

  // Calculate total donations
  const totalDonations = donor.donations?.reduce((sum, d) => sum + d.amount, 0) || 0
  const averageDonation = donor.donations?.length 
    ? totalDonations / donor.donations.length 
    : 0

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Donor Summary</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Given</p>
            <p className="text-2xl font-bold text-blue-700">
              ${totalDonations.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Lifetime Donations</p>
            <p className="text-2xl font-bold text-green-700">
              {donor.donations?.length || 0}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-900">Contact Information</h3>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
              {donor.preferredContact}
            </span>
          </div>
          <div className="space-y-2">
            {donor.email && (
              <p className="flex items-center text-gray-700">
                <span className="material-icons mr-2 text-sm">email</span>
                {donor.email}
              </p>
            )}
            {donor.phone && (
              <p className="flex items-center text-gray-700">
                <span className="material-icons mr-2 text-sm">phone</span>
                {donor.phone}
              </p>
            )}
            {donor.address && (
              <p className="flex items-center text-gray-700">
                <span className="material-icons mr-2 text-sm">location_on</span>
                {donor.address.street}, {donor.address.city}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-900">Donor Notes</h3>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded-lg p-2 h-32"
                placeholder="Add notes about this donor..."
              />
              <button
                onClick={handleSaveNotes}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Save Notes
              </button>
            </div>
          ) : (
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {notes || 'No notes yet. Click edit to add notes.'}
            </p>
          )}
        </div>

        {/* Interests & Tags */}
        {donor.interests?.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {donor.interests.map((interest) => (
                <span 
                  key={interest.interest.id}
                  className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full"
                >
                  {interest.interest.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {donor.tags?.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {donor.tags.map((tag) => (
                <span 
                  key={tag.tag.id}
                  className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                >
                  {tag.tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}