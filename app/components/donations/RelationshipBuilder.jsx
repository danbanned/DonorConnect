'use client'

import { useState } from 'react'

export default function DonorRelationship({ donor }) {
  const [personalNotes, setPersonalNotes] = useState(donor.personalNotes || {
    getToKnow: '',
    beforeFunding: '',
    thingsToRemember: ''
  })

  const [isEditing, setIsEditing] = useState({
    getToKnow: false,
    beforeFunding: false,
    thingsToRemember: false
  })

  const handleSave = async (field) => {
    await fetch(`/api/donors/${donor.id}/personal-notes`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        personalNotes: { 
          ...personalNotes, 
          [field]: personalNotes[field] 
        }
      }),
    })
    setIsEditing({ ...isEditing, [field]: false })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Relationship Builder
      </h2>
      
      <div className="space-y-6">
        {/* Get to Know Donors */}
        <div className="border-l-4 border-blue-500 pl-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-900">Get to Know Donor</h3>
            <button
              onClick={() => setIsEditing({...isEditing, getToKnow: !isEditing.getToKnow})}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isEditing.getToKnow ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditing.getToKnow ? (
            <div>
              <textarea
                value={personalNotes.getToKnow}
                onChange={(e) => setPersonalNotes({
                  ...personalNotes,
                  getToKnow: e.target.value
                })}
                className="w-full border rounded-lg p-3 h-32 mb-2"
                placeholder="Personal details, family information, passions, connection to cause..."
              />
              <button
                onClick={() => handleSave('getToKnow')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-gray-700">
              {personalNotes.getToKnow || 'Add personal insights to prepare for interactions'}
            </p>
          )}
        </div>

        {/* Before Funding You Should Know */}
        <div className="border-l-4 border-amber-500 pl-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-900">Before Funding You Should Know</h3>
            <button
              onClick={() => setIsEditing({...isEditing, beforeFunding: !isEditing.beforeFunding})}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isEditing.beforeFunding ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditing.beforeFunding ? (
            <div>
              <textarea
                value={personalNotes.beforeFunding}
                onChange={(e) => setPersonalNotes({
                  ...personalNotes,
                  beforeFunding: e.target.value
                })}
                className="w-full border rounded-lg p-3 h-32 mb-2"
                placeholder="Important considerations, timing preferences, previous conversations..."
              />
              <button
                onClick={() => handleSave('beforeFunding')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-gray-700">
              {personalNotes.beforeFunding || 'Add important context before requesting funding'}
            </p>
          )}
        </div>

        {/* Things I Want to Remember */}
        <div className="border-l-4 border-green-500 pl-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-900">Things I Want to Remember</h3>
            <button
              onClick={() => setIsEditing({...isEditing, thingsToRemember: !isEditing.thingsToRemember})}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isEditing.thingsToRemember ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditing.thingsToRemember ? (
            <div>
              <textarea
                value={personalNotes.thingsToRemember}
                onChange={(e) => setPersonalNotes({
                  ...personalNotes,
                  thingsToRemember: e.target.value
                })}
                className="w-full border rounded-lg p-3 h-32 mb-2"
                placeholder="Personal anecdotes, preferences, important dates, past interactions..."
              />
              <button
                onClick={() => handleSave('thingsToRemember')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-gray-700">
              {personalNotes.thingsToRemember || 'Add memorable details to personalize future interactions'}
            </p>
          )}
        </div>

        {/* Action Plan */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Next Steps</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input type="checkbox" id="followup" className="mr-3" />
              <label htmlFor="followup" className="text-gray-700">
                Schedule follow-up call within 7 days
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="report" className="mr-3" />
              <label htmlFor="report" className="text-gray-700">
                Send impact report for recent donation
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="event" className="mr-3" />
              <label htmlFor="event" className="text-gray-700">
                Invite to upcoming event: Annual Gala
              </label>
            </div>
          </div>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
            Save Action Plan
          </button>
        </div>
      </div>
    </div>
  )
}