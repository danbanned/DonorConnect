'use client'

import { useState } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import styles from './AddDonorForm.module.css'

// Function to create a new donor
async function createDonor(donorData) {
  try {
    const response = await fetch('/api/donors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donorData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create donor')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating donor:', error)
    throw error
  }
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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
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

      // Map form data to Prisma donor schema
      const donorPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        preferredContact: formData.preferredCommunication?.toUpperCase() || 'EMAIL',
        interests: formData.interests || [],
        personalNotes: formData.notes ? { notes: formData.notes } : {},
        totalGiven: 0,
        giftsCount: 0,
        hasActivePledge: false,
        pledgeTotal: 0,
        pledgePaid: 0,
        pledgeFrequency: null,
        status: 'ACTIVE',
        tags: formData.tags || [],
        organizationId, // Pass from parent or context
      }

      const newDonor = await createDonor(donorPayload)
      setSuccess('Donor created successfully!')

      setTimeout(() => {
        if (onSuccess) onSuccess(newDonor.id)
      }, 1000)
    } catch (err) {
      setError(err.message || 'Failed to create donor')
    } finally {
      setLoading(false)
    }
  }

  const interestOptions = [
    'Education', 'Arts', 'Healthcare', 'Environment', 'Youth Programs',
    'Community Development', 'Scholarships', 'Technology'
  ]

  const tagOptions = [
    'Major Donor', 'Recurring', 'Volunteer', 'Board Member', 'Alumni', 'Parent', 'Community Partner'
  ]

  return (
    <div className={styles.addDonorForm}>
      <h2 className={styles.formTitle}>Add New Donor</h2>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Name & Contact */}
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

        {/* Communication */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Preferred Communication</label>
          <select
            name="preferredCommunication"
            value={formData.preferredCommunication}
            onChange={handleChange}
            className={styles.formSelect}
            disabled={loading}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="mail">Mail</option>
            <option value="text">Text Message</option>
          </select>
        </div>

        {/* Interests */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Areas of Interest</label>
          <div className={styles.checkboxGrid}>
            {interestOptions.map(interest => (
              <div key={interest} className={styles.formCheckbox}>
                <input
                  type="checkbox"
                  id={`interest-${interest}`}
                  name="interests"
                  value={interest}
                  checked={formData.interests.includes(interest)}
                  onChange={handleChange}
                  className={styles.checkboxInput}
                  disabled={loading}
                />
                <label htmlFor={`interest-${interest}`} className={styles.checkboxLabel}>{interest}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tags</label>
          <div className={styles.checkboxGrid}>
            {tagOptions.map(tag => (
              <div key={tag} className={styles.formCheckbox}>
                <input
                  type="checkbox"
                  id={`tag-${tag}`}
                  name="tags"
                  value={tag}
                  checked={formData.tags.includes(tag)}
                  onChange={handleChange}
                  className={styles.checkboxInput}
                  disabled={loading}
                />
                <label htmlFor={`tag-${tag}`} className={styles.checkboxLabel}>{tag}</label>
              </div>
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
            disabled={loading}
            placeholder="Any additional notes about the donor..."
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            <XMarkIcon className={styles.btnIcon} /> Cancel
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? (
              <>
                <div className={styles.spinner} /> Creating...
              </>
            ) : (
              <>
                <PlusIcon className={styles.btnIcon} /> Create Donor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
