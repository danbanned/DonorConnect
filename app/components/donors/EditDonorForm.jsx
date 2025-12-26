// components/EditForm.jsx
'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  TagIcon,
  ChartBarIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import styles from './EditDonorForm.module.css'

export default function EditForm({ 
  initialData, 
  onSave, 
  onCancel,
  onDelete,
  title = "Edit Donor Information",
  allowDelete = false 
}) {
  // State for form data and original data
  const [formData, setFormData] = useState(initialData || getDefaultData())
  const [originalData, setOriginalData] = useState(initialData || getDefaultData())
  const [errors, setErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Status options
  const statusOptions = [
    { value: 'ACTIVE', label: 'Active', color: 'green' },
    { value: 'LAPSED', label: 'Lapsed', color: 'red' },
    { value: 'PROSPECT', label: 'Prospect', color: 'yellow' },
    { value: 'INACTIVE', label: 'Inactive', color: 'gray' }
  ]

  // Relationship stage options
  const relationshipStages = [
    { value: 'NEW', label: 'New Donor', description: 'First-time donor' },
    { value: 'CULTIVATION', label: 'Cultivation', description: 'Building relationship' },
    { value: 'ASK_READY', label: 'Ask Ready', description: 'Ready for major gift ask' },
    { value: 'STEWARDSHIP', label: 'Stewardship', description: 'Post-donation follow-up' },
    { value: 'MAJOR_GIFT', label: 'Major Gift', description: 'Major donor' },
    { value: 'LEGACY', label: 'Legacy', description: 'Planned giving donor' }
  ]

  // Preferred contact options
  const contactOptions = [
    { value: 'EMAIL', label: 'Email', icon: EnvelopeIcon },
    { value: 'PHONE', label: 'Phone', icon: PhoneIcon },
    { value: 'TEXT', label: 'Text Message', icon: PhoneIcon },
    { value: 'MAIL', label: 'Mail', icon: EnvelopeIcon }
  ]

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setOriginalData(initialData)
    }
  }, [initialData])

  // Check if form is dirty
  useEffect(() => {
    const dirty = JSON.stringify(formData) !== JSON.stringify(originalData)
    setIsDirty(dirty)
  }, [formData, originalData])

  function getDefaultData() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      status: 'ACTIVE',
      relationshipStage: 'NEW',
      preferredContact: 'EMAIL',
      notes: '',
      tags: [],
      customFields: {}
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    const tagInput = document.getElementById('newTag')
    const newTag = tagInput.value.trim()
    
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }))
      tagInput.value = ''
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleCustomFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldName]: value
      }
    }))
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      setFormData(originalData)
      setErrors({})
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (formData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    if (onSave) {
      onSave(formData)
    }
  }

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(formData.id)
    }
    setShowDeleteConfirm(false)
  }

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption ? statusOption.color : 'gray'
  }

  return (
    <div className={styles.editFormContainer}>
      <div className={styles.formHeader}>
        <div>
          <h2 className={styles.formTitle}>{title}</h2>
          {isDirty && (
            <span className={styles.unsavedIndicator}>
              • Unsaved changes
            </span>
          )}
        </div>
        <div className={styles.headerActions}>
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
              title="Reset all changes"
            >
              <ArrowPathIcon className={styles.icon} />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            <XMarkIcon className={styles.icon} />
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Personal Information Section */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <UserIcon className={styles.sectionIcon} />
            Personal Information
          </h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                placeholder="John"
              />
              {errors.firstName && (
                <span className={styles.errorMessage}>{errors.firstName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <span className={styles.errorMessage}>{errors.lastName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWithIcon}>
                <EnvelopeIcon className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Phone Number
              </label>
              <div className={styles.inputWithIcon}>
                <PhoneIcon className={styles.inputIcon} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                  placeholder="(555) 123-4567"
                />
              </div>
              {errors.phone && (
                <span className={styles.errorMessage}>{errors.phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <UserIcon className={styles.sectionIcon} />
            Address Information
          </h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroupFull}>
              <label htmlFor="address" className={styles.label}>
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="123 Main St"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="city" className={styles.label}>
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="New York"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="state" className={styles.label}>
                State/Province
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="NY"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="zipCode" className={styles.label}>
                ZIP/Postal Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="10001"
              />
            </div>
          </div>
        </div>

        {/* Donor Status & Relationship */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <ChartBarIcon className={styles.sectionIcon} />
            Donor Status & Relationship
          </h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.label}>
                Donor Status
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'ACTIVE'}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div 
                  className={styles.statusIndicator}
                  style={{ backgroundColor: `var(--color-${getStatusColor(formData.status)})` }}
                />
              </div>
              <div className={styles.statusOptions}>
                {statusOptions.map(option => (
                  <span 
                    key={option.value}
                    className={styles.statusOption}
                    onClick={() => handleSelectChange('status', option.value)}
                  >
                    <span 
                      className={styles.statusDot}
                      style={{ backgroundColor: `var(--color-${option.color})` }}
                    />
                    {option.label}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="relationshipStage" className={styles.label}>
                Relationship Stage
              </label>
              <select
                id="relationshipStage"
                name="relationshipStage"
                value={formData.relationshipStage || 'NEW'}
                onChange={handleChange}
                className={styles.select}
              >
                {relationshipStages.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
              <div className={styles.stageDescription}>
                {relationshipStages.find(s => s.value === formData.relationshipStage)?.description}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="preferredContact" className={styles.label}>
                Preferred Contact Method
              </label>
              <div className={styles.contactOptions}>
                {contactOptions.map(option => {
                  const Icon = option.icon
                  return (
                    <label key={option.value} className={styles.contactOption}>
                      <input
                        type="radio"
                        name="preferredContact"
                        value={option.value}
                        checked={formData.preferredContact === option.value}
                        onChange={handleChange}
                        className={styles.radioInput}
                      />
                      <div className={styles.contactOptionContent}>
                        <Icon className={styles.contactIcon} />
                        <span>{option.label}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <TagIcon className={styles.sectionIcon} />
            Tags & Categories
          </h3>
          
          <div className={styles.tagsContainer}>
            <div className={styles.tagsInput}>
              <input
                type="text"
                id="newTag"
                placeholder="Add a tag..."
                className={styles.input}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className={styles.addTagButton}
              >
                Add
              </button>
            </div>
            
            {formData.tags && formData.tags.length > 0 && (
              <div className={styles.tagsList}>
                {formData.tags.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className={styles.removeTagButton}
                    >
                      <XMarkIcon className={styles.smallIcon} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <DocumentTextIcon className={styles.sectionIcon} />
            Notes & Additional Information
          </h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>
              Donor Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Enter any additional notes about this donor..."
              rows={5}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <div className={styles.leftActions}>
            {allowDelete && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className={styles.deleteButton}
              >
                <TrashIcon className={styles.icon} />
                Delete Donor
              </button>
            )}
            
            {showDeleteConfirm && (
              <div className={styles.deleteConfirm}>
                <span>Are you sure? This cannot be undone.</span>
                <div className={styles.deleteConfirmActions}>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className={styles.cancelDeleteButton}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className={styles.confirmDeleteButton}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.rightActions}>
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                className={styles.resetFormButton}
              >
                <ArrowPathIcon className={styles.icon} />
                Reset Changes
              </button>
            )}
            
            <button
              type="submit"
              className={styles.saveButton}
              disabled={!isDirty}
            >
              <CheckIcon className={styles.icon} />
              Save Changes
            </button>
          </div>
        </div>
      </form>

      {/* Change Summary (only shows when there are changes) */}
      {isDirty && (
        <div className={styles.changeSummary}>
          <h4>Changes Summary</h4>
          <div className={styles.changesList}>
            {Object.keys(formData).map(key => {
              if (JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])) {
                return (
                  <div key={key} className={styles.changeItem}>
                    <span className={styles.changeField}>{key}:</span>
                    <span className={styles.changeOld}>{String(originalData[key] || 'empty')}</span>
                    <span className={styles.changeArrow}>→</span>
                    <span className={styles.changeNew}>{String(formData[key] || 'empty')}</span>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}