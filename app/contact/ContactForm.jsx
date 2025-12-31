'use client';

import { useState } from 'react';
import styles from './contact.module.css';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Form submitted:', formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Name *</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            placeholder="Your name"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email *</label>
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

        <div className={styles.formGroup}>
          <label htmlFor="subject" className={styles.label}>Subject *</label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className={styles.input}
            placeholder="What is this regarding?"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>Message *</label>
          <textarea
            id="message"
            value={formData.message}
            onChange={handleChange}
            className={styles.textarea}
            rows="5"
            placeholder="Your message..."
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {submitStatus === 'success' && (
        <div className={styles.successMessage}>
          <p>Thank you for your message! We will get back to you soon.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className={styles.errorMessage}>
          <p>Sorry, there was an error sending your message. Please try again.</p>
        </div>
      )}
    </>
  );
}