// components/TemplatesSection.jsx
'use client'

import { useState, useEffect } from 'react'
import { 
  EnvelopeIcon, 
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CalendarIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  AtSymbolIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PhotoIcon,
  CodeBracketIcon,
  BugAntIcon
} from '@heroicons/react/24/outline'
import styles from './templates.module.css'

// Console logger with styling
const consoleLog = (message, data = null, type = 'log') => {
  const timestamp = new Date().toLocaleTimeString();
  const styles = {
    log: 'color: #667eea; font-weight: bold;',
    error: 'color: #ef4444; font-weight: bold;',
    success: 'color: #10b981; font-weight: bold;',
    warning: 'color: #f59e0b; font-weight: bold;',
    info: 'color: #3b82f6; font-weight: bold;'
  };
  
  console.groupCollapsed(`%c📧 DonorConnect Template System - ${type.toUpperCase()}`, styles[type]);
  console.log(`%c${timestamp}`, 'color: #9ca3af; font-size: 0.8em;');
  console.log(`%c${message}`, 'color: #ffffff;');
  if (data) {
    console.log('Data:', data);
  }
  console.groupEnd();
  
  // Add to UI console if available
  if (typeof window !== 'undefined') {
    const consoleDiv = document.getElementById('template-console-entries');
    if (consoleDiv) {
      const logEntry = document.createElement('div');
      logEntry.className = `console-entry ${type}`;
      logEntry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="type">${type.toUpperCase()}:</span>
        <span class="message">${message}</span>
        ${data ? `<pre class="data">${JSON.stringify(data, null, 2)}</pre>` : ''}
      `;
      consoleDiv.appendChild(logEntry);
      consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
  }
};

// Alert system with feedback
const showAlert = (title, message, type = 'info', duration = 5000) => {
  const alertTypes = {
    success: {
      bg: 'linear-gradient(135deg, #10b981, #059669)',
      icon: '✅',
      border: '#059669'
    },
    error: {
      bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      icon: '❌',
      border: '#dc2626'
    },
    warning: {
      bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      icon: '⚠️',
      border: '#d97706'
    },
    info: {
      bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      icon: 'ℹ️',
      border: '#2563eb'
    }
  };
  
  const alertBox = document.createElement('div');
  alertBox.className = 'alert-box';
  alertBox.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${alertTypes[type].bg};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
    backdrop-filter: blur(10px);
    border-left: 5px solid ${alertTypes[type].border};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  alertBox.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <span style="font-size: 24px; flex-shrink: 0;">${alertTypes[type].icon}</span>
      <div style="flex: 1;">
        <h4 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; line-height: 1.3;">${title}</h4>
        <p style="margin: 0; font-size: 14px; opacity: 0.9; line-height: 1.4;">${message}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: rgba(255, 255, 255, 0.2); color: white; border: none; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 12px; flex-shrink: 0; font-size: 18px; line-height: 1;">
        ×
      </button>
    </div>
  `;
  
  document.body.appendChild(alertBox);
  
  // Add animation styles if not present
  if (!document.querySelector('#alert-animations')) {
    const style = document.createElement('style');
    style.id = 'alert-animations';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Auto-remove after duration
  setTimeout(() => {
    if (alertBox.parentElement) {
      alertBox.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        if (alertBox.parentElement) {
          alertBox.parentElement.removeChild(alertBox);
        }
      }, 300);
    }
  }, duration);
  
  return alertBox;
};

export default function TemplatesSection({ donorId, donorInfo }) {
  consoleLog('🔄 TemplatesSection component initialized', { donorId, donorInfo }, 'info');
  
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewContent, setPreviewContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState({})
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sendStatus, setSendStatus] = useState({ type: null, message: '' })
  const [showEmailComposer, setShowEmailComposer] = useState(false)
  const [composerMode, setComposerMode] = useState('template')
  const [emailData, setEmailData] = useState({
    to: donorInfo?.email || '',
    subject: '',
    from: process.env.NEXT_PUBLIC_EMAIL_FROM || 'Acme <onboarding@resend.dev>',
    cc: '',
    bcc: ''
  })
  const [customHtml, setCustomHtml] = useState('')
  const [composerLoading, setComposerLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('compose')
  const [debugMode, setDebugMode] = useState(false)
  const [consoleVisible, setConsoleVisible] = useState(false)

  consoleLog('📧 Email data initialized', emailData, 'info');

  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'EMAIL',
    subject: '',
    content: '',
    category: 'THANK_YOU'
  })

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
    consoleLog('🔍 useEffect triggered for loading templates', null, 'info');
    loadTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      consoleLog('📋 Generating preview for selected template', { template: selectedTemplate.name }, 'info');
      generatePreview(selectedTemplate)
    }
  }, [selectedTemplate, donorInfo])

  async function loadTemplates() {
    try {
      setLoading(true)
      consoleLog('📂 Loading templates from localStorage', null, 'info');
      
      const savedTemplates = localStorage.getItem('emailTemplates')
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates)
        consoleLog('✅ Templates loaded from localStorage', { count: parsed.length }, 'success');
        setTemplates(parsed)
      } else {
        const defaultTemplates = templateCategories.flatMap(category => 
          category.defaultTemplates.map(template => ({
            ...template,
            category: category.id,
            type: 'EMAIL',
            subject: template.subject || template.name
          }))
        )
        consoleLog('📝 Loading default templates', { count: defaultTemplates.length }, 'info');
        setTemplates(defaultTemplates)
        localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates))
        showAlert('Default Templates Loaded', `Loaded ${defaultTemplates.length} default templates`, 'success', 3000);
      }
    } catch (err) {
      consoleLog('❌ Failed to load templates', err.message, 'error');
      showAlert('Load Error', 'Failed to load templates: ' + err.message, 'error');
    } finally {
      setLoading(false)
    }
  }

  function generatePreview(template) {
    if (!template || !donorInfo) return
    
    let preview = template.content
    
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
      '{{organization}}': process.env.NEXT_PUBLIC_ORGANIZATION_NAME || '[Your Organization Name]'
    }

    consoleLog('🔧 Generating preview with replacements', { replacements }, 'info');

    Object.entries(replacements).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(key, 'g'), value)
    })

    setPreviewContent(preview)
    consoleLog('✅ Preview generated', { previewLength: preview.length }, 'success');
  }

  const handleSendEmailEnhanced = async (templateData = null) => {
    const templateToUse = templateData || selectedTemplate
    const recipientEmail = emailData.to || donorInfo?.email
    
    consoleLog('🚀 Starting email send process', { 
      template: templateToUse?.name, 
      recipientEmail,
      mode: composerMode,
      subject: emailData.subject
    }, 'info');
    
    showAlert('Sending Email', 'Preparing to send email...', 'info', 2000);

    if (!recipientEmail) {
      const errorMsg = 'Please enter recipient email address'
      consoleLog('❌ Email validation failed', errorMsg, 'error');
      showAlert('Email Error', errorMsg, 'error');
      setSendStatus({
        type: 'error',
        message: errorMsg
      })
      return
    }

    if (!emailData.subject && !templateToUse?.subject) {
      const errorMsg = 'Please enter email subject'
      consoleLog('❌ Email validation failed', errorMsg, 'error');
      showAlert('Email Error', errorMsg, 'error');
      setSendStatus({
        type: 'error',
        message: errorMsg
      })
      return
    }

    try {
      setComposerLoading(true)
      setSendStatus({ type: null, message: '' })

      const isCustomEmail = composerMode === 'custom' || templateToUse?.id === 'custom'
      let emailHtml = ''
      let templateType = 'custom'

      if (isCustomEmail) {
        consoleLog('🎨 Using custom HTML email', { contentLength: customHtml.length }, 'info');
        emailHtml = formatEmailHtml(customHtml || previewContent, composerMode === 'custom')
        templateType = 'custom'
      } else if (templateToUse) {
        consoleLog('📄 Using template for email', { template: templateToUse.name, category: templateToUse.category }, 'info');
        const previewContent = generatePreview(templateToUse)
        emailHtml = formatEmailHtml(previewContent, false)
        
        if (templateToUse.category === 'YEAR_END' || templateToUse.category === 'RECURRING') {
          templateType = 'newsletter'
        } else if (templateToUse.category === 'EVENT') {
          templateType = 'promotion'
        } else {
          templateType = 'welcome'
        }
      }

      consoleLog('📤 Sending API request to /api/communications/email', {
        to: emailData.to,
        subject: emailData.subject || templateToUse?.subject || templateToUse?.name,
        templateType,
        htmlLength: emailHtml.length
      }, 'info');

      const response = await fetch('/api/communications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.to.split(',').map(e => e.trim()),
          subject: emailData.subject || templateToUse?.subject || templateToUse?.name,
          template: templateType,
          html: emailHtml,
          variables: {
            firstName: donorInfo?.firstName || 'Valued Supporter',
          },
          from: emailData.from,
          cc: emailData.cc || undefined,
          bcc: emailData.bcc || undefined
        })
      })

      const result = await response.json()
      consoleLog('📨 API Response received', { status: response.status, result }, response.ok ? 'success' : 'error');

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      consoleLog('📝 Logging communication to /api/communications', {
        donorId,
        templateId: templateToUse?.id,
        templateType
      }, 'info');

      await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId,
          type: 'EMAIL',
          direction: 'OUTBOUND',
          subject: emailData.subject || templateToUse?.subject || templateToUse?.name,
          content: composerMode === 'custom' ? customHtml : previewContent,
          templateId: templateToUse?.id,
          templateUsed: templateType,
          status: 'SENT',
          messageId: result.data?.id,
          sentAt: new Date().toISOString(),
          metadata: {
            resendId: result.data?.id,
            from: emailData.from,
            cc: emailData.cc,
            bcc: emailData.bcc
          }
        })
      })

      const successMsg = `Email sent successfully to ${emailData.to}`
      consoleLog('✅ Email sent successfully', { recipient: emailData.to, messageId: result.data?.id }, 'success');
      showAlert('Email Sent!', successMsg, 'success');

      setSendStatus({
        type: 'success',
        message: successMsg
      })

      if (showEmailComposer) {
        setTimeout(() => {
          setShowEmailComposer(false)
          resetComposerState()
        }, 2000)
      }

      setTimeout(() => {
        setSendStatus({ type: null, message: '' })
      }, 5000)

    } catch (err) {
      consoleLog('❌ Error sending email', err.message, 'error');
      showAlert('Email Failed', err.message || 'Failed to send email', 'error');
      setSendStatus({
        type: 'error',
        message: err.message || 'Failed to send email'
      })
    } finally {
      setComposerLoading(false)
    }
  }

  const resetComposerState = () => {
    consoleLog('🔄 Resetting composer state', null, 'info');
    setEmailData({
      to: donorInfo?.email || '',
      subject: selectedTemplate?.subject || selectedTemplate?.name || '',
      from: process.env.NEXT_PUBLIC_EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      cc: '',
      bcc: ''
    })
    setCustomHtml('')
    setComposerMode('template')
    setActiveTab('compose')
  }

  const handleSendEmail = async () => {
    consoleLog('📨 handleSendEmail called', { selectedTemplate: selectedTemplate?.name }, 'info');
    await handleSendEmailEnhanced()
  }

  const convertTextToHtml = (text) => {
    consoleLog('🔧 Converting text to HTML', { textLength: text.length }, 'info');
    return text
      .split('\n\n')
      .map(paragraph => {
        if (paragraph.trim() === '') return '<p><br></p>'
        if (paragraph.trim().endsWith(':')) {
          return `<h3 style="color: #333; margin: 16px 0 8px 0; font-size: 16px; font-weight: bold;">${paragraph.trim()}</h3>`
        }
        return `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #333;">${paragraph.replace(/\n/g, '<br>')}</p>`
      })
      .join('')
  }

  const formatEmailHtml = (content, isHtml = false) => {
    consoleLog('🎨 Formatting email HTML', { contentLength: content.length, isHtml }, 'info');
    const bodyContent = isHtml ? content : convertTextToHtml(content)
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailData.subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2c5282; margin-top: 0;">${process.env.NEXT_PUBLIC_ORGANIZATION_NAME || '[Your Organization]'}</h1>
      </div>
      
      ${bodyContent}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
        <p>
          ${process.env.NEXT_PUBLIC_ORGANIZATION_NAME ? process.env.NEXT_PUBLIC_ORGANIZATION_NAME : 'Your Organization'} <br>
          <a href="${process.env.NEXT_PUBLIC_WEBSITE_URL || '#'}" style="color: #4299e1;">Visit our website</a>
        </p>
      </div>
    </body>
    </html>
    `
    
    consoleLog('✅ HTML formatted', { htmlLength: html.length }, 'success');
    return html
  }

  const handleSaveTemplate = async (e) => {
    e.preventDefault()
    
    consoleLog('💾 Saving template', { 
      name: templateForm.name,
      category: templateForm.category,
      contentLength: templateForm.content.length 
    }, 'info');
    
    try {
      let updatedTemplates
      
      if (editingTemplate) {
        consoleLog('✏️ Updating existing template', { templateId: editingTemplate.id }, 'info');
        updatedTemplates = templates.map(t => 
          t.id === editingTemplate.id ? { ...templateForm, id: editingTemplate.id } : t
        )
      } else {
        const newTemplate = {
          ...templateForm,
          id: `template-${Date.now()}`,
          type: 'EMAIL'
        }
        consoleLog('🆕 Creating new template', { templateId: newTemplate.id }, 'info');
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
      
      const successMsg = editingTemplate ? 'Template updated successfully!' : 'Template created successfully!'
      consoleLog('✅ Template saved', { totalTemplates: updatedTemplates.length }, 'success');
      showAlert('Template Saved', successMsg, 'success');
      
      setSendStatus({
        type: 'success',
        message: successMsg
      })
      
      setTimeout(() => {
        setSendStatus({ type: null, message: '' })
      }, 3000)
      
    } catch (err) {
      consoleLog('❌ Error saving template', err.message, 'error');
      showAlert('Save Error', 'Failed to save template: ' + err.message, 'error');
      setSendStatus({
        type: 'error',
        message: 'Failed to save template'
      })
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    consoleLog('🗑️ Deleting template', { templateId }, 'warning');
    
    if (!confirm('Are you sure you want to delete this template?')) {
      consoleLog('❌ Template deletion cancelled', null, 'info');
      return
    }

    try {
      const updatedTemplates = templates.filter(t => t.id !== templateId)
      setTemplates(updatedTemplates)
      localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates))
      
      if (selectedTemplate?.id === templateId) {
        consoleLog('📋 Clearing selected template', null, 'info');
        setSelectedTemplate(null)
      }
      
      consoleLog('✅ Template deleted', { remainingTemplates: updatedTemplates.length }, 'success');
      showAlert('Template Deleted', 'Template was deleted successfully', 'success');
      
      setSendStatus({
        type: 'success',
        message: 'Template deleted successfully!'
      })
      
      setTimeout(() => {
        setSendStatus({ type: null, message: '' })
      }, 3000)
    } catch (err) {
      consoleLog('❌ Error deleting template', err.message, 'error');
      showAlert('Delete Error', 'Failed to delete template: ' + err.message, 'error');
      setSendStatus({
        type: 'error',
        message: 'Failed to delete template'
      })
    }
  }

  const handleEditTemplate = (template) => {
    consoleLog('✏️ Editing template', { template: template.name, id: template.id }, 'info');
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
    consoleLog('🎯 Using template', { template: template.name }, 'info');
    setSelectedTemplate(template)
    generatePreview(template)
  }

  const handleQuickSend = async (template) => {
    if (!donorId || !donorInfo?.email) {
      const errorMsg = 'Please select a donor with an email address first'
      consoleLog('❌ Quick send validation failed', errorMsg, 'error');
      showAlert('Quick Send Error', errorMsg, 'error');
      setSendStatus({
        type: 'error',
        message: errorMsg
      })
      return
    }
    
    consoleLog('⚡ Quick send initiated', { template: template.name, recipient: donorInfo.email }, 'info');
    showAlert('Quick Send', `Sending "${template.name}" to ${donorInfo.email}...`, 'info', 2000);
    
    handleUseTemplate(template)
    
    setTimeout(async () => {
      await handleSendEmail()
    }, 100)
  }

  const getFilteredTemplates = () => {
    let filtered = templates.filter(template => template.type === 'EMAIL')
    
    if (searchQuery.trim()) {
      consoleLog('🔍 Filtering templates', { searchQuery, before: filtered.length }, 'info');
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      consoleLog('✅ Templates filtered', { after: filtered.length }, 'success');
    }
    
    return filtered
  }

  const toggleCategory = (categoryId) => {
    consoleLog('📂 Toggling category', { categoryId, currentlyExpanded: expandedCategories[categoryId] }, 'info');
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const getTemplatesByCategory = (categoryId) => {
    return getFilteredTemplates().filter(template => template.category === categoryId)
  }

  const expandAllCategories = () => {
    consoleLog('📂 Expanding all categories', null, 'info');
    const expanded = {}
    templateCategories.forEach(cat => {
      expanded[cat.id] = true
    })
    setExpandedCategories(expanded)
  }

  const collapseAllCategories = () => {
    consoleLog('📂 Collapsing all categories', null, 'info');
    setExpandedCategories({})
  }

  const handleTestNotification = () => {
    consoleLog('🧪 Test notification triggered', null, 'info');
    showAlert('Test Notification', 'This is a test notification from the Template System', 'info');
    
    // Test various console log types
    consoleLog('Test info message', { test: 'data' }, 'info');
    consoleLog('Test success message', null, 'success');
    consoleLog('Test warning message', null, 'warning');
    consoleLog('Test error message', { errorCode: 404 }, 'error');
  }

  const handleDebugToggle = () => {
    setDebugMode(!debugMode);
    consoleLog('🐛 Debug mode toggled', { debugMode: !debugMode }, debugMode ? 'info' : 'warning');
    showAlert('Debug Mode', debugMode ? 'Debug mode disabled' : 'Debug mode enabled', debugMode ? 'info' : 'warning');
  }

  const handleClearConsole = () => {
    const consoleDiv = document.getElementById('template-console-entries');
    if (consoleDiv) {
      consoleDiv.innerHTML = '';
      consoleLog('🧹 Console cleared', null, 'info');
      showAlert('Console Cleared', 'All console logs have been cleared', 'info');
    }
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
      {/* Debug console panel */}
      {debugMode && consoleVisible && (
        <div className={styles.consolePanel}>
          <div className={styles.consoleHeader}>
            <div className={styles.consoleTitle}>
              <CodeBracketIcon className={styles.icon} />
              <h4>Template System Console</h4>
              <span className={styles.consoleBadge}>DEBUG</span>
            </div>
            <div className={styles.consoleControls}>
              <button 
                className={styles.consoleButton}
                onClick={handleTestNotification}
                title="Test notifications"
              >
                <BugAntIcon className={styles.icon} />
              </button>
              <button 
                className={styles.consoleButton}
                onClick={handleClearConsole}
                title="Clear console"
              >
                <TrashIcon className={styles.icon} />
              </button>
              <button 
                className={styles.consoleButton}
                onClick={() => setConsoleVisible(false)}
                title="Hide console"
              >
                <XMarkIcon className={styles.icon} />
              </button>
            </div>
          </div>
          <div className={styles.consoleBody} id="template-console-entries">
            {/* Console entries will be appended here */}
          </div>
        </div>
      )}

      {/* Status display */}
      {sendStatus.type && (
        <div className={`${styles.statusAlert} ${sendStatus.type === 'success' ? styles.success : styles.error}`}>
          <div className={styles.statusContent}>
            {sendStatus.type === 'success' ? (
              <CheckIcon className={styles.statusIcon} />
            ) : (
              <ExclamationTriangleIcon className={styles.statusIcon} />
            )}
            <span>{sendStatus.message}</span>
          </div>
          <button 
            className={styles.statusClose}
            onClick={() => setSendStatus({ type: null, message: '' })}
          >
            <XMarkIcon className={styles.icon} />
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Email & Message Templates</h2>
          <p className={styles.subtitle}>Create and manage email templates for donor communications</p>
        </div>
        <div className={styles.headerRight}>
          {/* Debug toggle button */}
          <button 
            className={`${styles.secondaryButton} ${debugMode ? styles.debugActive : ''}`}
            onClick={handleDebugToggle}
            title={debugMode ? 'Disable debug mode' : 'Enable debug mode'}
          >
            <BugAntIcon className={styles.icon} />
            {debugMode ? 'Debug On' : 'Debug'}
          </button>
          
          {debugMode && (
            <button 
              className={styles.secondaryButton}
              onClick={() => setConsoleVisible(!consoleVisible)}
              title={consoleVisible ? 'Hide console' : 'Show console'}
            >
              <CodeBracketIcon className={styles.icon} />
              Console
            </button>
          )}
          
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
              consoleLog('➕ Creating new template', null, 'info');
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
            onChange={(e) => {
              setSearchQuery(e.target.value)
              consoleLog('🔍 Search query updated', { query: e.target.value }, 'info');
            }}
          />
          {searchQuery && (
            <button 
              className={styles.clearButton}
              onClick={() => {
                consoleLog('🧹 Clearing search', null, 'info');
                setSearchQuery('')
              }}
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
                                disabled={!donorId || !donorInfo?.email}
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
                              consoleLog('➕ Creating new template for category', { category: category.name }, 'info');
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
                  onClick={() => {
                    consoleLog('➕ Creating first template', null, 'info');
                    setShowTemplateModal(true)
                  }}
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
                  onClick={() => {
                    consoleLog('❌ Closing template preview', { template: selectedTemplate.name }, 'info');
                    setSelectedTemplate(null)
                  }}
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
                  <code onClick={() => {
                    navigator.clipboard.writeText('{{firstName}}')
                    consoleLog('📋 Copied placeholder', { placeholder: '{{firstName}}' }, 'info');
                    showAlert('Copied!', 'Placeholder {{firstName}} copied to clipboard', 'success', 2000);
                  }} title="Click to copy">{'{{firstName}}'}</code>
                  <code onClick={() => {
                    navigator.clipboard.writeText('{{lastName}}')
                    consoleLog('📋 Copied placeholder', { placeholder: '{{lastName}}' }, 'info');
                    showAlert('Copied!', 'Placeholder {{lastName}} copied to clipboard', 'success', 2000);
                  }} title="Click to copy">{'{{lastName}}'}</code>
                  <code onClick={() => {
                    navigator.clipboard.writeText('{{fullName}}')
                    consoleLog('📋 Copied placeholder', { placeholder: '{{fullName}}' }, 'info');
                    showAlert('Copied!', 'Placeholder {{fullName}} copied to clipboard', 'success', 2000);
                  }} title="Click to copy">{'{{fullName}}'}</code>
                  <code onClick={() => {
                    navigator.clipboard.writeText('{{email}}')
                    consoleLog('📋 Copied placeholder', { placeholder: '{{email}}' }, 'info');
                    showAlert('Copied!', 'Placeholder {{email}} copied to clipboard', 'success', 2000);
                  }} title="Click to copy">{'{{email}}'}</code>
                  <code onClick={() => {
                    navigator.clipboard.writeText('{{amount}}')
                    consoleLog('📋 Copied placeholder', { placeholder: '{{amount}}' }, 'info');
                    showAlert('Copied!', 'Placeholder {{amount}} copied to clipboard', 'success', 2000);
                  }} title="Click to copy">{'{{amount}}'}</code>
                  <code onClick={() => {
                    navigator.clipboard.writeText('{{date}}')
                    consoleLog('📋 Copied placeholder', { placeholder: '{{date}}' }, 'info');
                    showAlert('Copied!', 'Placeholder {{date}} copied to clipboard', 'success', 2000);
                  }} title="Click to copy">{'{{date}}'}</code>
                  <code onClick={() => {
                    navigator.clipboard.writeText('{{year}}')
                    consoleLog('📋 Copied placeholder', { placeholder: '{{year}}' }, 'info');
                    showAlert('Copied!', 'Placeholder {{year}} copied to clipboard', 'success', 2000);
                  }} title="Click to copy">{'{{year}}'}</code>
                  <code onClick={() => {
                    navigator.clipboard.writeText('{{organization}}')
                    consoleLog('📋 Copied placeholder', { placeholder: '{{organization}}' }, 'info');
                    showAlert('Copied!', 'Placeholder {{organization}} copied to clipboard', 'success', 2000);
                  }} title="Click to copy">{'{{organization}}'}</code>
                </div>
                <small>Click on a placeholder to copy it to clipboard</small>
              </div>

              {/* Action Buttons */}
              <div className={styles.previewActions}>
                <button 
                  className={styles.primaryButton}
                  onClick={handleSendEmail}
                  disabled={!donorId || !donorInfo?.email || sendingEmail}
                >
                  {sendingEmail ? (
                    <>
                      <ArrowPathIcon className={`${styles.icon} ${styles.spinning}`} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className={styles.icon} /> 
                      Send Email to {donorInfo?.firstName || 'Donor'}
                    </>
                  )}
                </button>
                
                <button 
                  className={styles.secondaryButton}
                  onClick={() => {
                    navigator.clipboard.writeText(previewContent)
                    consoleLog('📋 Copied template content to clipboard', { contentLength: previewContent.length }, 'info');
                    showAlert('Copied!', 'Template content copied to clipboard', 'success', 2000);
                    setSendStatus({
                      type: 'success',
                      message: 'Template content copied to clipboard!'
                    })
                    setTimeout(() => setSendStatus({ type: null, message: '' }), 2000)
                  }}
                >
                  <ClipboardDocumentIcon className={styles.icon} />
                  Copy Content
                </button>
              </div>
              
              {donorInfo?.email && (
                <div className={styles.recipientInfo}>
                  <strong>Recipient:</strong> {donorInfo.email}
                </div>
              )}
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
                    consoleLog('❌ Closing template modal', { editing: !!editingTemplate }, 'info');
                    setShowTemplateModal(false)
                    setEditingTemplate(null)
                  }}
                >
                  <XMarkIcon className={styles.icon} />
                </button>

                <button 
                  className={styles.composerButton}
                  onClick={() => {
                    consoleLog('📧 Opening email composer from template modal', null, 'info');
                    setShowEmailComposer(true);
                    setEmailData(prev => ({
                      ...prev,
                      to: donorInfo?.email || prev.to,
                      subject: prev.subject || selectedTemplate?.subject || selectedTemplate?.name || ''
                    }));
                  }}
                  disabled={!donorInfo?.email}
                >
                  <EnvelopeIcon className={styles.icon} /> Compose Email
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
                      onChange={(e) => {
                        consoleLog('📂 Category selected', { category: e.target.value }, 'info');
                        setTemplateForm({...templateForm, category: e.target.value})
                      }}
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
                      consoleLog('❌ Cancelling template creation/editing', null, 'info');
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

        {/* Email Composer Modal */}
  {showEmailComposer && (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.composerModal}`}>
        <div className={styles.modalHeader}>
          <h3>
            <EnvelopeIcon className={styles.icon} /> 
            Compose Email
          </h3>
          <button 
            className={styles.iconButton}
            onClick={() => {
              consoleLog('❌ Closing email composer', null, 'info');
              setShowEmailComposer(false)
              resetComposerState()
            }}
          >
            <XMarkIcon className={styles.icon} />
          </button>
        </div>

        <div className={styles.composerContainer}>
          {/* Email Header */}
          <div className={styles.composerHeader}>
            <div className={styles.emailFields}>
              <div className={styles.formGroup}>
                <label><AtSymbolIcon className={styles.iconSm} /> To</label>
                <input
                  type="text"
                  value={emailData.to}
                  onChange={(e) => {
                    consoleLog('📧 To field updated', { to: e.target.value }, 'info');
                    setEmailData({...emailData, to: e.target.value})
                  }}
                  placeholder="recipient@example.com, another@example.com"
                  className={styles.emailInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label><DocumentTextIcon className={styles.iconSm} /> Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => {
                    consoleLog('📧 Subject field updated', { subject: e.target.value }, 'info');
                    setEmailData({...emailData, subject: e.target.value})
                  }}
                  placeholder="Email subject"
                  className={styles.emailInput}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>From</label>
                  <input
                    type="email"
                    value={emailData.from}
                    onChange={(e) => {
                      consoleLog('📧 From field updated', { from: e.target.value }, 'info');
                      setEmailData({...emailData, from: e.target.value})
                    }}
                    className={styles.emailInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>CC</label>
                  <input
                    type="text"
                    value={emailData.cc}
                    onChange={(e) => {
                      consoleLog('📧 CC field updated', { cc: e.target.value }, 'info');
                      setEmailData({...emailData, cc: e.target.value})
                    }}
                    placeholder="cc@example.com"
                    className={styles.emailInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>BCC</label>
                  <input
                    type="text"
                    value={emailData.bcc}
                    onChange={(e) => {
                      consoleLog('📧 BCC field updated', { bcc: e.target.value }, 'info');
                      setEmailData({...emailData, bcc: e.target.value})
                    }}
                    placeholder="bcc@example.com"
                    className={styles.emailInput}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className={styles.modeSelector}>
            <div className={styles.modeButtons}>
              <button
                className={`${styles.modeButton} ${composerMode === 'template' ? styles.active : ''}`}
                onClick={() => {
                  consoleLog('📄 Switching to template mode', null, 'info');
                  setComposerMode('template')
                }}
              >
                <DocumentTextIcon className={styles.icon} />
                Template
              </button>
              <button
                className={`${styles.modeButton} ${composerMode === 'custom' ? styles.active : ''}`}
                onClick={() => {
                  consoleLog('🎨 Switching to custom HTML mode', null, 'info');
                  setComposerMode('custom')
                }}
              >
                <PhotoIcon className={styles.icon} />
                Custom HTML
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className={styles.composerContent}>
            {composerMode === 'template' && selectedTemplate ? (
              <div className={styles.templatePreview}>
                <h4>Template: {selectedTemplate.name}</h4>
                <div className={styles.previewText}>
                  {previewContent.split('\n').map((line, i) => (
                    <p key={i}>{line || <br />}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.htmlEditor}>
                <div className={styles.editorTabs}>
                  <button
                    className={`${styles.tabButton} ${activeTab === 'compose' ? styles.active : ''}`}
                    onClick={() => {
                      consoleLog('📝 Switching to compose tab', null, 'info');
                      setActiveTab('compose')
                    }}
                  >
                    Compose
                  </button>
                  <button
                    className={`${styles.tabButton} ${activeTab === 'preview' ? styles.active : ''}`}
                    onClick={() => {
                      consoleLog('👁️ Switching to preview tab', null, 'info');
                      setActiveTab('preview')
                    }}
                  >
                    Preview
                  </button>
                  <button
                    className={`${styles.tabButton} ${activeTab === 'code' ? styles.active : ''}`}
                    onClick={() => {
                      consoleLog('💻 Switching to code tab', null, 'info');
                      setActiveTab('code')
                    }}
                  >
                    HTML
                  </button>
                </div>

                <div className={styles.editorContent}>
                  {activeTab === 'compose' ? (
                    <textarea
                      value={customHtml}
                      onChange={(e) => {
                        consoleLog('📝 Custom HTML updated', { length: e.target.value.length }, 'info');
                        setCustomHtml(e.target.value)
                      }}
                      placeholder="Write your email content here..."
                      rows={15}
                      className={styles.htmlTextarea}
                    />
                  ) : activeTab === 'preview' ? (
                    <div 
                      className={styles.htmlPreview}
                      dangerouslySetInnerHTML={{ 
                        __html: formatEmailHtml(customHtml, true) 
                      }}
                    />
                  ) : (
                    <pre className={styles.htmlCode}>
                      {formatEmailHtml(customHtml, true)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.composerActions}>
            <button 
              className={styles.secondaryButton}
              onClick={() => {
                const content = composerMode === 'template' ? previewContent : customHtml
                navigator.clipboard.writeText(content)
                consoleLog('📋 Copied content to clipboard', { 
                  mode: composerMode, 
                  contentLength: content.length 
                }, 'info');
                showAlert('Copied!', 'Content copied to clipboard', 'success', 2000);
                setSendStatus({
                  type: 'success',
                  message: 'Content copied to clipboard!'
                })
              }}
            >
              <ClipboardDocumentIcon className={styles.icon} />
              Copy Content
            </button>
            
            <button 
              className={styles.primaryButton}
              onClick={handleSendEmailEnhanced}
              disabled={composerLoading || !emailData.to}
            >
              {composerLoading ? (
                <>
                  <ArrowPathIcon className={`${styles.icon} ${styles.spinning}`} />
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className={styles.icon} />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
    </div>
  )
}