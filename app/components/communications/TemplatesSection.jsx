// components/TemplatesSection.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  EnvelopeIcon, 
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import styles from './templates.module.css'

export default function TemplatesSection({ donorId, donorInfo }) {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewContent, setPreviewContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState({})
  
  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'EMAIL',
    subject: '',
    content: '',
    category: 'THANK_YOU'
  })

  // Template categories
  const templateCategories = [
    { 
      id: 'THANK_YOU', 
      name: 'Thank You', 
      description: 'Express gratitude for donations',
      icon: CheckIcon,
      defaultTemplates: [
        {
          id: 'thank-you-1',
          name: 'Standard Thank You',
          content: 'Hi {{firstName}},\n\nThank you so much for your generous donation of {{amount}} on {{date}}. Your support makes a real difference in our work.\n\nWe deeply appreciate your commitment to our cause.\n\nWith gratitude,\n[Organization Name]',
          subject: 'Thank you for your generous donation'
        },
        {
          id: 'thank-you-2',
          name: 'First-Time Donor Thank You',
          content: 'Dear {{firstName}},\n\nWelcome to our community of supporters! We are thrilled by your first donation of {{amount}} on {{date}}.\n\nYour contribution helps us make a real impact. We look forward to keeping you updated on our progress.\n\nThank you again,\n[Organization Name]',
          subject: 'Welcome to our community!'
        }
      ]
    },
    { 
      id: 'YEAR_END', 
      name: 'Year-End Giving', 
      description: 'End of year campaign messages',
      icon: CalendarIcon,
      defaultTemplates: [
        {
          id: 'year-end-1',
          name: 'Year-End Giving Reminder',
          content: 'Dear {{firstName}},\n\nAs the year comes to a close, we want to thank you for your support. Your generosity has helped us achieve so much.\n\nConsider making a year-end gift to help us start the new year strong. Your donation before December 31st is tax-deductible.\n\nThank you,\n[Organization Name]',
          subject: 'Year-End Giving Opportunity'
        }
      ]
    },
    { 
      id: 'RECURRING', 
      name: 'Recurring Donations', 
      description: 'Manage monthly/sustaining gifts',
      icon: ArrowPathIcon,
      defaultTemplates: [
        {
          id: 'recurring-1',
          name: 'Recurring Donation Follow-up',
          content: 'Hi {{firstName}},\n\nThank you for being a sustaining donor! Your recurring gift of {{amount}} each month provides consistent support for our programs.\n\nWould you consider increasing your monthly gift to help us meet growing needs?\n\nThank you for your ongoing support,\n[Organization Name]',
          subject: 'Thank you for your recurring support'
        }
      ]
    },
    { 
      id: 'EVENT', 
      name: 'Event Invitations', 
      description: 'Invite donors to special events',
      icon: CalendarIcon,
      defaultTemplates: [
        {
          id: 'event-1',
          name: 'Exclusive Event Invitation',
          content: 'Dear {{firstName}},\n\nYou are cordially invited to our exclusive event on [Event Date].\n\nAs a valued supporter, we would love to have you join us for this special occasion.\n\nPlease RSVP by [RSVP Date].\n\nWe hope to see you there!\n[Organization Name]',
          subject: 'Invitation to our exclusive event'
        }
      ]
    },
    { 
      id: 'FOLLOW_UP', 
      name: 'Follow Up', 
      description: 'Follow up after meetings or calls',
      icon: EnvelopeIcon,
      defaultTemplates: [
        {
          id: 'follow-up-1',
          name: 'Meeting Follow-up',
          content: 'Hi {{firstName}},\n\nIt was great speaking with you recently. As discussed, here are the next steps:\n\n1. [Action item 1]\n2. [Action item 2]\n\nLooking forward to continuing our conversation.\n\nBest regards,\n[Organization Name]',
          subject: 'Follow up from our conversation'
        }
      ]
    }
  ]

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      generatePreview(selectedTemplate)
    }
  }, [selectedTemplate, donorInfo])

  async function loadTemplates() {
    try {
      setLoading(true)
      // Try to load from localStorage first
      const savedTemplates = localStorage.getItem('emailTemplates')
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates))
      } else {
        // Load default templates
        const defaultTemplates = templateCategories.flatMap(category => 
          category.defaultTemplates.map(template => ({
            ...template,
            category: category.id,
            type: 'EMAIL',
            subject: template.subject || template.name
          }))
        )
        setTemplates(defaultTemplates)
        localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates))
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
    } finally {
      setLoading(false)
    }
  }

  function generatePreview(template) {
    if (!template || !donorInfo) return
    
    let preview = template.content
    
    // Replace placeholders with actual donor data
    const replacements = {
      '{{firstName}}': donorInfo.firstName || '[Donor First Name]',
      '{{lastName}}': donorInfo.lastName || '[Donor Last Name]',
      '{{fullName}}': `${donorInfo.firstName || ''} ${donorInfo.lastName || ''}`.trim() || '[Donor Name]',
      '{{email}}': donorInfo.email || '[Donor Email]',
      '{{amount}}': donorInfo.lastDonationAmount ? `$${donorInfo.lastDonationAmount}` : '$[Amount]',
      '{{date}}': donorInfo.lastDonationDate 
        ? new Date(donorInfo.lastDonationDate).toLocaleDateString() 
        : '[Date]',
      '{{year}}': new Date().getFullYear(),
      '{{nextYear}}': new Date().getFullYear() + 1,
      '{{organization}}': '[Your Organization Name]'
    }

    Object.entries(replacements).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(key, 'g'), value)
    })

    setPreviewContent(preview)
  }

  const handleSendEmail = async () => {
    if (!selectedTemplate || !donorId) return

    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId,
          type: 'EMAIL',
          direction: 'OUTBOUND',
          subject: selectedTemplate.subject || selectedTemplate.name,
          content: previewContent,
          templateId: selectedTemplate.id
        })
      })

      if (response.ok) {
        alert('Email sent successfully!')
      }
    } catch (err) {
      console.error('Error sending email:', err)
      alert('Failed to send email')
    }
  }

  const handleSaveTemplate = async (e) => {
    e.preventDefault()
    
    try {
      let updatedTemplates
      
      if (editingTemplate) {
        // Update existing template
        updatedTemplates = templates.map(t => 
          t.id === editingTemplate.id ? { ...templateForm, id: editingTemplate.id } : t
        )
      } else {
        // Create new template
        const newTemplate = {
          ...templateForm,
          id: `template-${Date.now()}`,
          type: 'EMAIL'
        }
        updatedTemplates = [...templates, newTemplate]
      }
      
      setTemplates(updatedTemplates)
      localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates))
      
      setShowTemplateModal(false)
      setEditingTemplate(null)
      setTemplateForm({
        name: '',
        type: 'EMAIL',
        subject: '',
        content: '',
        category: 'THANK_YOU'
      })
      
      alert('Template saved successfully!')
    } catch (err) {
      console.error('Error saving template:', err)
      alert('Failed to save template')
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const updatedTemplates = templates.filter(t => t.id !== templateId)
      setTemplates(updatedTemplates)
      localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates))
      
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null)
      }
      
      alert('Template deleted successfully!')
    } catch (err) {
      console.error('Error deleting template:', err)
      alert('Failed to delete template')
    }
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      type: template.type || 'EMAIL',
      subject: template.subject || '',
      content: template.content,
      category: template.category || 'THANK_YOU'
    })
    setShowTemplateModal(true)
  }

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template)
    generatePreview(template)
  }

  const handleQuickSend = (template) => {
    if (!donorId) {
      alert('Please select a donor first')
      return
    }
    
    handleUseTemplate(template)
    setTimeout(() => {
      handleSendEmail()
    }, 500)
  }

  const getFilteredTemplates = () => {
    let filtered = templates.filter(template => template.type === 'EMAIL')
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const getTemplatesByCategory = (categoryId) => {
    return getFilteredTemplates().filter(template => template.category === categoryId)
  }

  const expandAllCategories = () => {
    const expanded = {}
    templateCategories.forEach(cat => {
      expanded[cat.id] = true
    })
    setExpandedCategories(expanded)
  }

  const collapseAllCategories = () => {
    setExpandedCategories({})
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading templates...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Email & Message Templates</h2>
          <p className={styles.subtitle}>Create and manage email templates for donor communications</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.expandButtons}>
            <button className={styles.secondaryButton} onClick={expandAllCategories}>
              Expand All
            </button>
            <button className={styles.secondaryButton} onClick={collapseAllCategories}>
              Collapse All
            </button>
          </div>
          <button 
            className={styles.primaryButton}
            onClick={() => {
              setEditingTemplate(null)
              setTemplateForm({
                name: '',
                type: 'EMAIL',
                subject: '',
                content: '',
                category: 'THANK_YOU'
              })
              setShowTemplateModal(true)
            }}
          >
            <PlusIcon className={styles.icon} /> New Template
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <MagnifyingGlassIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search templates by name, content, or category..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className={styles.clearButton}
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <XMarkIcon className={styles.icon} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Template Categories Section */}
        <div className={styles.categoriesContainer}>
          <div className={styles.categoriesHeader}>
            <h3>Template Categories</h3>
            <span className={styles.templateCount}>{getFilteredTemplates().length} templates</span>
          </div>
          
          <div className={styles.categoriesList}>
            {templateCategories.map(category => {
              const categoryTemplates = getTemplatesByCategory(category.id)
              if (categoryTemplates.length === 0 && !searchQuery) return null
              
              const isExpanded = expandedCategories[category.id] || searchQuery.length > 0
              const Icon = category.icon || EnvelopeIcon
              
              return (
                <div key={category.id} className={styles.categorySection}>
                  <div 
                    className={styles.categoryHeader}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className={styles.categoryInfo}>
                      <Icon className={styles.categoryIcon} />
                      <div className={styles.categoryDetails}>
                        <h3>{category.name}</h3>
                        <p>{category.description}</p>
                      </div>
                    </div>
                    <div className={styles.categoryActions}>
                      <span className={styles.categoryCount}>
                        {categoryTemplates.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDownIcon className={styles.chevron} />
                      ) : (
                        <ChevronRightIcon className={styles.chevron} />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className={styles.templatesGrid}>
                      {categoryTemplates.length > 0 ? (
                        categoryTemplates.map(template => (
                          <div 
                            key={template.id}
                            className={`${styles.templateCard} ${selectedTemplate?.id === template.id ? styles.selected : ''}`}
                            onClick={() => handleUseTemplate(template)}
                          >
                            <div className={styles.cardHeader}>
                              <h4>{template.name}</h4>
                              <div className={styles.cardActions}>
                                <button 
                                  className={styles.iconButton}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditTemplate(template)
                                  }}
                                  title="Edit template"
                                >
                                  <PencilIcon className={styles.icon} />
                                </button>
                                <button 
                                  className={styles.iconButton}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteTemplate(template.id)
                                  }}
                                  title="Delete template"
                                >
                                  <TrashIcon className={styles.icon} />
                                </button>
                              </div>
                            </div>
                            <p className={styles.cardPreview}>
                              {template.content.substring(0, 80)}...
                            </p>
                            <div className={styles.cardFooter}>
                              <button 
                                className={styles.smallButton}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleQuickSend(template)
                                }}
                                disabled={!donorId}
                              >
                                <PaperAirplaneIcon className={styles.icon} />
                                Send Now
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.emptyCategory}>
                          <p>No templates found in this category.</p>
                          <button 
                            className={styles.smallButton}
                            onClick={() => {
                              setTemplateForm(prev => ({...prev, category: category.id}))
                              setShowTemplateModal(true)
                            }}
                          >
                            <PlusIcon className={styles.icon} />
                            Create {category.name} Template
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            
            {getFilteredTemplates().length === 0 && (
              <div className={styles.emptyState}>
                <EnvelopeIcon className={styles.emptyIcon} />
                <h3>No templates found</h3>
                <p>{searchQuery ? 'Try a different search term' : 'Create your first template to get started'}</p>
                <button 
                  className={styles.primaryButton}
                  onClick={() => setShowTemplateModal(true)}
                >
                  <PlusIcon className={styles.icon} />
                  Create Template
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Template Preview Panel */}
        {selectedTemplate && (
          <div className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <div className={styles.previewTitle}>
                <h3>{selectedTemplate.name}</h3>
                <span className={styles.categoryBadge}>{selectedTemplate.category}</span>
              </div>
              <div className={styles.previewHeaderActions}>
                <button 
                  className={styles.iconButton}
                  onClick={() => setSelectedTemplate(null)}
                  title="Close preview"
                >
                  <XMarkIcon className={styles.icon} />
                </button>
              </div>
            </div>

            <div className={styles.previewContent}>
              <div className={styles.previewSubject}>
                <strong>Subject:</strong> {selectedTemplate.subject || selectedTemplate.name}
              </div>
              
              <div className={styles.previewBody}>
                <h4>Preview:</h4>
                <div className={styles.previewText}>
                  {previewContent.split('\n').map((line, i) => (
                    <p key={i}>{line || <br />}</p>
                  ))}
                </div>
              </div>

              {/* Available Placeholders */}
              <div className={styles.placeholders}>
                <h4>Available Placeholders:</h4>
                <div className={styles.placeholderGrid}>
                  <code onClick={() => navigator.clipboard.writeText('{{firstName}}')} title="Click to copy">{'{{firstName}}'}</code>
                  <code onClick={() => navigator.clipboard.writeText('{{lastName}}')} title="Click to copy">{'{{lastName}}'}</code>
                  <code onClick={() => navigator.clipboard.writeText('{{fullName}}')} title="Click to copy">{'{{fullName}}'}</code>
                  <code onClick={() => navigator.clipboard.writeText('{{email}}')} title="Click to copy">{'{{email}}'}</code>
                  <code onClick={() => navigator.clipboard.writeText('{{amount}}')} title="Click to copy">{'{{amount}}'}</code>
                  <code onClick={() => navigator.clipboard.writeText('{{date}}')} title="Click to copy">{'{{date}}'}</code>
                  <code onClick={() => navigator.clipboard.writeText('{{year}}')} title="Click to copy">{'{{year}}'}</code>
                  <code onClick={() => navigator.clipboard.writeText('{{organization}}')} title="Click to copy">{'{{organization}}'}</code>
                </div>
                <small>Click on a placeholder to copy it to clipboard</small>
              </div>

              {/* Action Buttons */}
              <div className={styles.previewActions}>
                <button 
                  className={styles.primaryButton}
                  onClick={handleSendEmail}
                  disabled={!donorId}
                >
                  <PaperAirplaneIcon className={styles.icon} /> 
                  Send Email to {donorInfo?.firstName || 'Donor'}
                </button>
                
                <button 
                  className={styles.secondaryButton}
                  onClick={() => {
                    navigator.clipboard.writeText(previewContent)
                    alert('Template content copied to clipboard!')
                  }}
                >
                  <ClipboardDocumentIcon className={styles.icon} />
                  Copy Content
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {showTemplateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editingTemplate ? 'Edit Template' : 'Create New Template'}</h3>
              <button 
                className={styles.iconButton}
                onClick={() => {
                  setShowTemplateModal(false)
                  setEditingTemplate(null)
                }}
              >
                <XMarkIcon className={styles.icon} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Template Name *</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  placeholder="e.g., Thank You Email"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                    required
                  >
                    {templateCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Email Subject *</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                    placeholder="Email subject line"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Content *</label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                  placeholder="Enter your template content here. Use {{placeholders}} for dynamic content."
                  rows={12}
                  required
                />
                <small className={styles.helpText}>
                  Available placeholders: {'{{firstName}}'}, {'{{lastName}}'}, {'{{fullName}}'}, 
                  {'{{email}}'}, {'{{amount}}'}, {'{{date}}'}, {'{{year}}'}, {'{{organization}}'}
                </small>
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.secondaryButton}
                  onClick={() => {
                    setShowTemplateModal(false)
                    setEditingTemplate(null)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}