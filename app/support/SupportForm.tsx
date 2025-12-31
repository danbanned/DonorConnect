'use client';

export const dynamic = 'force-dynamic'
import { useState } from 'react';
import styles from './support.module.css'

const issueTypes = [
  'Account & Login',
  'Billing & Payments',
  'Technical Issues',
  'Feature Request',
  'Bug Report',
  'General Inquiry'
];

const priorityLevels = [
  { value: 'low', label: 'Low', description: 'General question, no urgency' },
  { value: 'normal', label: 'Normal', description: 'Standard issue, needs attention' },
  { value: 'high', label: 'High', description: 'Affects my work, needs timely response' },
  { value: 'critical', label: 'Critical', description: 'Service down or major issue' }
];

export default function SupportForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: 'General Inquiry',
    priority: 'normal',
    subject: '',
    description: '',
    attachments: [] as string[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Support ticket submitted:', formData);
      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        issueType: 'General Inquiry',
        priority: 'normal',
        subject: '',
        description: '',
        attachments: []
      });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...fileNames]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className={styles.supportForm}>
      <h3 className={styles.formTitle}>Submit a Support Ticket</h3>
      <p className={styles.formDescription}>
        Fill out the form below and we&apos;ll get back to you as soon as possible.
      </p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Full Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="Your full name"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Your email address"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="issueType" className={styles.label}>Issue Type *</label>
            <select
              id="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className={styles.select}
              disabled={isSubmitting}
            >
              {issueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="priority" className={styles.label}>Priority Level *</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={handleChange}
              className={styles.select}
              disabled={isSubmitting}
            >
              {priorityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <small className={styles.priorityHint}>
              {priorityLevels.find(l => l.value === formData.priority)?.description}
            </small>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="subject" className={styles.label}>Subject *</label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className={styles.input}
            placeholder="Brief description of your issue"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>Description *</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.textarea}
            rows={6}
            placeholder="Please provide as much detail as possible about your issue..."
            required
            disabled={isSubmitting}
          />
          <small className={styles.textareaHint}>
            Include steps to reproduce, error messages, and any relevant information
          </small>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Attachments (Optional)</label>
          <div className={styles.uploadArea}>
            <label htmlFor="file-upload" className={styles.uploadLabel}>
              <span className={styles.uploadIcon}>📎</span>
              <span>Click to attach files</span>
              <input
                type="file"
                id="file-upload"
                className={styles.fileInput}
                onChange={handleAttachment}
                multiple
                disabled={isSubmitting}
              />
            </label>
            <p className={styles.uploadHint}>Maximum file size: 10MB each</p>
          </div>
          
          {formData.attachments.length > 0 && (
            <div className={styles.attachmentsList}>
              {formData.attachments.map((file, index) => (
                <div key={index} className={styles.attachmentItem}>
                  <span className={styles.attachmentName}>📄 {file}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className={styles.removeAttachment}
                    disabled={isSubmitting}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={styles.formFooter}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
          </button>
          
          <p className={styles.formNote}>
            By submitting this form, you agree to our{' '}
            <a href="/privacy" className={styles.formLink}>Privacy Policy</a>.
            We&apos;ll respond within 24 hours.
          </p>
        </div>
      </form>
      
      {submitStatus === 'success' && (
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>✅</div>
          <div>
            <h4 className={styles.successTitle}>Ticket Submitted Successfully!</h4>
            <p className={styles.successText}>
              Your support ticket has been received. We&apos;ve sent a confirmation email to {formData.email}.
              Ticket ID: <strong>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</strong>
            </p>
          </div>
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className={styles.errorMessage}>
          <div className={styles.errorIcon}>❌</div>
          <div>
            <h4 className={styles.errorTitle}>Submission Failed</h4>
            <p className={styles.errorText}>
              Sorry, there was an error submitting your ticket. Please try again or email us directly at support@example.com
            </p>
          </div>
        </div>
      )}
    </div>
  );
}