'use client'

import { useState } from 'react'
import { PlusIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useAI } from '../../providers/AIProvider' // Add this import
import styles from './AddDonorForm.module.css'



// Function to create a new donor
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

// app/components/donors/AddDonorForm.jsx - Updated with AI button


// ... rest of your imports and createDonor function

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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Get AI functions
  const { generateFakeDonorData } = useAI()

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

  // New function to generate donor data with AI
  const handleGenerateWithAI = async () => {
    setAiGenerating(true)
    setError('')
    
    try {
      const result = await generateFakeDonorData()
      
      if (result?.success && result.data) {
        // Update form with AI-generated data
        setFormData({
          firstName: result.data.firstName || '',
          lastName: result.data.lastName || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          address: result.data.address || '',
          city: result.data.city || '',
          state: result.data.state || '',
          zipCode: result.data.zipCode || '',
          interests: result.data.interests || [],
          preferredCommunication: result.data.preferredCommunication || 'email',
          notes: result.data.notes || '',
          tags: result.data.tags || []
        })
        
        setSuccess('Donor data generated with AI!')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('First name and last name are required')
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required')
      }

      // Build payload
      const donorPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        preferredContact: formData.preferredCommunication?.toUpperCase() || 'EMAIL',
        relationshipStage: 'NEW',
        status: 'ACTIVE',
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

        interests: formData.interests,
        tags: formData.tags,
      }

      const newDonor = await createDonor(donorPayload)
      setSuccess('Donor created successfully!')
      setTimeout(() => onSuccess?.(newDonor.id), 1000)
    } catch (err) {
      setError(err.message || 'Failed to create donor')
    } finally {
      setLoading(false)
    }
  }

  const interestOptions = ['Education','Arts','Healthcare','Environment','Youth Programs','Community Development','Scholarships','Technology']
  const tagOptions = ['Major Donor','Recurring','Volunteer','Board Member','Alumni','Parent','Community Partner']

  return (
    <div className={styles.addDonorForm}>
      <h2 className={styles.formTitle}>Add New Donor</h2>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      {/* AI Generation Button */}
      <div className={styles.aiGenerationSection}>
        <button
          type="button"
          onClick={handleGenerateWithAI}
          disabled={aiGenerating}
          className={styles.aiButton}
        >
          <SparklesIcon className={styles.btnIcon} />
          {aiGenerating ? 'Generating...' : 'Generate with AI'}
        </button>
        <p className={styles.aiHint}>
          Let AI fill in realistic donor information for you
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ... rest of your form remains exactly the same ... */}
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
                disabled={loading}
              />
            </div>
          ))}
        </div>

        {/* ... rest of your form fields ... */}

        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={loading}>
            <XMarkIcon className={styles.btnIcon} /> Cancel
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? <div className={styles.spinner} /> : <><PlusIcon className={styles.btnIcon} /> Create Donor</>}
          </button>
        </div>
      </form>
    </div>
  )
}