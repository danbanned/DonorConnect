'use client';

import { useState } from 'react';
import EmailTemplatePicker from './EmailTemplatePicker';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailComposer() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    from: process.env.NEXT_PUBLIC_DEFAULT_FROM_EMAIL || '',
    cc: '',
    bcc: ''
  });
  const [customHtml, setCustomHtml] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Set default subject based on template
    if (template && !emailData.subject) {
      setEmailData(prev => ({
        ...prev,
        subject: template.name
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate) {
      setResult({ type: 'error', message: 'Please select a template' });
      return;
    }

    if (!emailData.to) {
      setResult({ type: 'error', message: 'Please enter recipient email(s)' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const payload = {
        to: emailData.to.split(',').map(email => email.trim()),
        subject: emailData.subject,
        template: selectedTemplate.id,
        from: emailData.from,
        cc: emailData.cc || undefined,
        bcc: emailData.bcc || undefined,
        variables: selectedTemplate.variablesData || {},
        ...(selectedTemplate.id === 'custom' && customHtml && { 
          customHtml 
        })
      };

      const response = await fetch('/api/communications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setResult({ 
        type: 'success', 
        message: data.message || 'Email sent successfully!',
        data: data.data 
      });

      // Reset form on success
      if (data.success) {
        setTimeout(() => {
          setSelectedTemplate(null);
          setEmailData({
            to: '',
            subject: '',
            from: process.env.NEXT_PUBLIC_DEFAULT_FROM_EMAIL || '',
            cc: '',
            bcc: ''
          });
          setCustomHtml('');
          setResult(null);
        }, 3000);
      }

    } catch (error) {
      setResult({ 
        type: 'error', 
        message: error.message || 'Failed to send email. Please try again.' 
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Email Composer</h1>
        <p className="text-gray-600">Compose and send emails using templates</p>
      </div>

      <div className="space-y-8">
        {/* Email Template Picker */}
        <EmailTemplatePicker
          onTemplateSelect={handleTemplateSelect}
          selectedTemplate={selectedTemplate}
        />

        {/* Email Details Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Email Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To (comma-separated for multiple recipients)
              </label>
              <input
                type="text"
                name="to"
                value={emailData.to}
                onChange={handleInputChange}
                placeholder="recipient@example.com, another@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={emailData.subject}
                onChange={handleInputChange}
                placeholder="Email subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="email"
                name="from"
                value={emailData.from}
                onChange={handleInputChange}
                placeholder="sender@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CC (optional)
              </label>
              <input
                type="text"
                name="cc"
                value={emailData.cc}
                onChange={handleInputChange}
                placeholder="cc@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BCC (optional)
              </label>
              <input
                type="text"
                name="bcc"
                value={emailData.bcc}
                onChange={handleInputChange}
                placeholder="bcc@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Custom HTML Editor */}
          {selectedTemplate?.id === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom HTML Content
              </label>
              <textarea
                value={customHtml}
                onChange={(e) => setCustomHtml(e.target.value)}
                placeholder="<html>Your custom HTML here...</html>"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Preview Section */}
          {selectedTemplate && selectedTemplate.id !== 'custom' && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Template:</strong> {selectedTemplate.name}</p>
                <p><strong>Subject:</strong> {emailData.subject || '(No subject)'}</p>
                <p><strong>To:</strong> {emailData.to || '(No recipients)'}</p>
                {selectedTemplate.variablesData && (
                  <div>
                    <strong>Variables:</strong>
                    <pre className="mt-1 text-xs bg-white p-2 rounded border">
                      {JSON.stringify(selectedTemplate.variablesData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result Message */}
          {result && (
            <div className={`p-4 rounded-md ${
              result.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {result.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                )}
                <span className={`font-medium ${
                  result.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </span>
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSendEmail}
              disabled={sending || !selectedTemplate || !emailData.to}
              className={`px-6 py-3 rounded-md font-medium ${
                sending || !selectedTemplate || !emailData.to
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } flex items-center`}
            >
              {sending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}