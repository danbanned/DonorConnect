'use client'

import { useState } from 'react'
import { PlusIcon, XMarkIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useAI } from '../../providers/AIProvider'
import styles from './AddDonorForm.module.css'

// Function to create a new donor via your API
async function createDonor(donorData) {
  try {
    const response = await fetch('/api/donors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donorData),
    })

    const result = await response.json()
    if (!response.ok) {
      console.error('API error:', result)
      throw new Error(result.error || 'Failed to create donor')
    }

    return result
  } catch (error) {
    console.error('Error creating donor:', error)
    throw error
  }
}

// NEW: Function to create AI-generated donors directly via AI API
async function createAIDonor(aiDonorData, organizationId) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-org-id': organizationId || 'default-org'
      },
      body: JSON.stringify({
        method: 'generateDonorData',
        params: {
          count: 1,
          includeCommunications: false,
          includeDonations: true, // Include donations for AI-generated donors
          saveToDatabase: true // Flag to save to real database
        }
      })
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to create AI donor')
    }

    return result
  } catch (error) {
    console.error('Error creating AI donor:', error)
    throw error
  }
}

// NEW: Function to save AI-generated donor to your main database
async function saveAIDonorToDatabase(aiDonor, organizationId) {
  // Map AI donor format to your database format
  const donorPayload = {
    firstName: aiDonor.firstName,
    lastName: aiDonor.lastName,
    email: aiDonor.email,
    phone: aiDonor.phone,
    type: aiDonor.type || 'INDIVIDUAL',
    status: 'ACTIVE',
    relationshipStage: aiDonor.relationshipStage || 'NEW',
    organizationId: organizationId,
    
    // Address
    address: aiDonor.address ? {
      street: aiDonor.address,
      city: aiDonor.city,
      state: aiDonor.state,
      zipCode: aiDonor.postalCode,
      country: aiDonor.country || 'USA'
    } : undefined,
    
    // Notes
    personalNotes: aiDonor.notes ? { notes: aiDonor.notes } : null,
    
    // Preferences
    preferences: {
      interests: aiDonor.interests || [],
      tags: aiDonor.tags || []
    }
  }

  // Also create donations if they exist
  if (aiDonor.donations && aiDonor.donations.length > 0) {
    donorPayload.donations = {
      create: aiDonor.donations.map(donation => ({
        amount: donation.amount,
        currency: donation.currency || 'USD',
        date: donation.date || new Date().toISOString(),
        status: 'COMPLETED',
        type: donation.type || 'ONE_TIME',
        purpose: donation.purpose || 'General Donation',
        paymentMethod: donation.paymentMethod || 'OTHER'
      }))
    }
  }

  return await createDonor(donorPayload)
}

export default function AddDonorForm({ onSuccess, onCancel, organizationId }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    interests: [],
    preferredCommunication: 'email',
    notes: '',
    tags: []
  })

  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [creatingAIDonor, setCreatingAIDonor] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [aiPreview, setAiPreview] = useState(null) // Store AI-generated donor for preview
  const [useAIForCreation, setUseAIForCreation] = useState(false) // Flag for AI vs manual creation

  // Get AI functions
  const aiContext = useAI()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      if (name === 'interests') {
        setFormData(prev => ({
          ...prev,
          interests: checked 
            ? [...prev.interests, value]
            : prev.interests.filter(i => i !== value)
        }))
      } else if (name === 'tags') {
        setFormData(prev => ({
          ...prev,
          tags: checked 
            ? [...prev.tags, value]
            : prev.tags.filter(t => t !== value)
        }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Option 1: Generate AI donor and preview in form (for editing)
  const handleGenerateAIPreview = async () => {
    setAiGenerating(true)
    setError('')
    setSuccess('')
    setAiPreview(null)
    
    try {
      console.log('🔮 Generating AI donor preview...')
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organizationId || 'default-org'
        },
        body: JSON.stringify({
          method: 'generateFakeDonors',
          params: {
            count: 1,
            includeCommunications: false,
            includeDonations: true
          }
        })
      })
      
      const result = await response.json()
      console.log('🔮 AI generation result:', result)
      
if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        const aiDonor = result.data[0]
        setAiPreview(aiDonor)
        
        // Fill form with AI data for editing
        setFormData(prev => ({
          ...prev,
          firstName: aiDonor.firstName || prev.firstName,
          lastName: aiDonor.lastName || prev.lastName,
          email: aiDonor.email || prev.email,
          phone: aiDonor.phone || prev.phone,
          address: aiDonor.address || prev.address,
          city: aiDonor.city || prev.city,
          state: aiDonor.state || prev.state,
          zipCode: aiDonor.postalCode || prev.zipCode,
          interests: aiDonor.interests || prev.interests,
          notes: aiDonor.notes || prev.notes,
          tags: aiDonor.tags || []
        }))
        
        setSuccess('AI donor data generated! Review and edit before creating.')
        setUseAIForCreation(false) // User will review/edit first
      } else {
        setError('Failed to generate donor data. Please try again.')
      }
    } catch (err) {
      console.error('Error generating donor data:', err)
      setError('Failed to generate donor data')
    } finally {
      setAiGenerating(false)
    }
  }

  // Option 2: Create AI donor directly (no preview)
  const handleCreateAIDonorDirectly = async () => {
    setCreatingAIDonor(true)
    setError('')
    setSuccess('')
    
    try {
      console.log('🚀 Creating AI donor directly...')
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organizationId || 'default-org'
        },
        body: JSON.stringify({
          method: 'generateDonorData',
          params: {
            count: 1,
            includeCommunications: true,
            includeDonations: true,
            saveToDatabase: true
          }
        })
      })
      
      const result = await response.json()
      console.log('🚀 AI creation result:', result)
      
      if (result.success && result.data?.donors?.length > 0) {
        const aiDonor = result.data.donors[0]
        
        // Save to your main database
        try {
          const savedDonor = await saveAIDonorToDatabase(aiDonor, organizationId)
          setSuccess(`AI donor "${aiDonor.firstName} ${aiDonor.lastName}" created successfully with ${aiDonor.donations?.length || 0} donations!`)
          
          // Optionally fill form for viewing
          setFormData({
            firstName: aiDonor.firstName,
            lastName: aiDonor.lastName,
            email: aiDonor.email,
            phone: aiDonor.phone,
            address: aiDonor.address,
            city: aiDonor.city,
            state: aiDonor.state,
            zipCode: aiDonor.postalCode,
            interests: aiDonor.interests || [],
            preferredCommunication: 'email',
            notes: aiDonor.notes || '',
            tags: aiDonor.tags || []
          })
          
          // Notify parent component
          setTimeout(() => onSuccess?.(savedDonor.id), 1500)
          
        } catch (saveError) {
          console.error('Error saving AI donor:', saveError)
          setError('Donor generated but failed to save. Please try manual creation.')
        }
      } else {
        setError('Failed to create AI donor. Please try again.')
      }
    } catch (err) {
      console.error('Error creating AI donor:', err)
      setError('Failed to create AI donor')
    } finally {
      setCreatingAIDonor(false)
    }
  }

  // Main submit handler - handles both manual and AI-assisted creation
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('First name and last name are required')
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required')
      }

      // Build payload for manual creation
      const donorPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        preferredContact: formData.preferredCommunication?.toUpperCase() || 'EMAIL',
        relationshipStage: 'NEW',
        status: 'ACTIVE',
        organizationId: organizationId,
        personalNotes: formData.notes ? { notes: formData.notes } : null,

        // Nested create for address
        address:
          formData.address || formData.city || formData.state || formData.zipCode
            ? {
                street: formData.address || null,
                city: formData.city || null,
                state: formData.state || null,
                zipCode: formData.zipCode || null,
              }
            : undefined,

        // Create preferences
        preferences: {
          create: {
            interests: formData.interests,
            tags: formData.tags,
            preferredCommunication: formData.preferredCommunication?.toUpperCase() || 'EMAIL'
          }
        }
      }

      console.log('📤 Creating donor with payload:', donorPayload)
      const newDonor = await createDonor(donorPayload)
      console.log('✅ Donor created:', newDonor)
      
      setSuccess('Donor created successfully!')
      setTimeout(() => onSuccess?.(newDonor.id), 1000)
    } catch (err) {
      console.error('Error creating donor:', err)
      setError(err.message || 'Failed to create donor')
    } finally {
      setLoading(false)
    }
  }

  // If we have an AI preview, show it
  const renderAIPreview = () => {
    if (!aiPreview) return null
    
    return (
      <div className={styles.aiPreview}>
        <h3 className={styles.aiPreviewTitle}>
          <SparklesIcon className={styles.aiPreviewIcon} />
          AI-Generated Donor Preview
        </h3>
        <div className={styles.aiPreviewGrid}>
          <div className={styles.aiPreviewField}>
            <strong>Name:</strong> {aiPreview.firstName} {aiPreview.lastName}
          </div>
          <div className={styles.aiPreviewField}>
            <strong>Email:</strong> {aiPreview.email}
          </div>
          <div className={styles.aiPreviewField}>
            <strong>Type:</strong> {aiPreview.type || 'INDIVIDUAL'}
          </div>
          {aiPreview.donations?.length > 0 && (
            <div className={styles.aiPreviewField}>
              <strong>Donations:</strong> {aiPreview.donations.length} simulated donations
            </div>
          )}
          <div className={styles.aiPreviewField}>
            <strong>Notes:</strong> {aiPreview.notes || 'No notes'}
          </div>
        </div>
        <p className={styles.aiPreviewHint}>
          Review and edit the form above, then click "Create Donor" to save.
        </p>
      </div>
    )
  }

  const interestOptions = ['Education','Arts','Healthcare','Environment','Youth Programs','Community Development','Scholarships','Technology']
  const tagOptions = ['Major Donor','Recurring','Volunteer','Board Member','Alumni','Parent','Community Partner']

  return (
    <div className={styles.addDonorForm}>
      <h2 className={styles.formTitle}>Add New Donor</h2>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      {/* AI Generation Section */}
      <div className={styles.aiGenerationSection}>
        <div className={styles.aiButtonsRow}>
          <button
            type="button"
            onClick={handleGenerateAIPreview}
            disabled={aiGenerating || creatingAIDonor}
            className={styles.aiButton}
          >
            <SparklesIcon className={styles.btnIcon} />
            {aiGenerating ? 'Generating Preview...' : 'Generate AI Preview'}
          </button>
          
          <button
            type="button"
            onClick={handleCreateAIDonorDirectly}
            disabled={creatingAIDonor || aiGenerating}
            className={styles.aiButtonDirect}
          >
            <CheckIcon className={styles.btnIcon} />
            {creatingAIDonor ? 'Creating AI Donor...' : 'Create AI Donor Directly'}
          </button>
        </div>
        
        <div className={styles.aiOptions}>
          <p className={styles.aiOption}>
            <strong>Option 1:</strong> Generate preview to review/edit before creating
          </p>
          <p className={styles.aiOption}>
            <strong>Option 2:</strong> Create AI donor directly with simulated donations
          </p>
          <p className={styles.aiOption}>
            <strong>Option 3:</strong> Fill form manually below
          </p>
        </div>
      </div>

      {/* AI Preview */}
      {renderAIPreview()}

      {/* Donor Form */}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          {['firstName','lastName','email','phone','address','city','state','zipCode'].map(field => (
            <div key={field} className={styles.formGroup}>
              <label className={styles.formLabel}>
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                {['firstName','lastName','email'].includes(field) ? ' *' : ''}
              </label>
              <input
                type={field==='email'?'email':'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className={styles.formInput}
                required={['firstName','lastName','email'].includes(field)}
                disabled={loading || creatingAIDonor}
              />
            </div>
          ))}
        </div>

        {/* Communication Preference */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Preferred Communication</label>
          <select
            name="preferredCommunication"
            value={formData.preferredCommunication}
            onChange={handleChange}
            className={styles.formSelect}
            disabled={loading || creatingAIDonor}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="mail">Mail</option>
            <option value="text">Text</option>
          </select>
        </div>

        {/* Interests */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Interests</label>
          <div className={styles.checkboxGroup}>
            {interestOptions.map(interest => (
              <label key={interest} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="interests"
                  value={interest}
                  checked={formData.interests.includes(interest)}
                  onChange={handleChange}
                  className={styles.checkboxInput}
                  disabled={loading || creatingAIDonor}
                />
                {interest}
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tags</label>
          <div className={styles.checkboxGroup}>
            {tagOptions.map(tag => (
              <label key={tag} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="tags"
                  value={tag}
                  checked={formData.tags.includes(tag)}
                  onChange={handleChange}
                  className={styles.checkboxInput}
                  disabled={loading || creatingAIDonor}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className={styles.formTextarea}
            rows={3}
            disabled={loading || creatingAIDonor}
          />
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={loading || creatingAIDonor}>
            <XMarkIcon className={styles.btnIcon} /> Cancel
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={loading || creatingAIDonor}>
            {loading ? <div className={styles.spinner} /> : <><PlusIcon className={styles.btnIcon} /> Create Donor</>}
          </button>
        </div>
      </form>
    </div>
  )
}