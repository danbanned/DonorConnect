// components/DonorBrief.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAI } from '../providers/AIProvider';
import { 
  DocumentTextIcon, 
  UserIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
// At the top of DonorBrief.jsx, add:
import './DonorBrief.css';

export default function DonorBrief({ donorId, organizationId, onClose, isOpen = false }) {
  const { apiClient } = useAI();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  const generateBrief = async () => {
  if (!donorId || !organizationId) {
    console.error('Missing required params:', { donorId, organizationId });
    setError('Missing donor ID or organization ID');
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);
    
    try {
      // Single consolidated API call using the new 'generateBrief' method
      console.log('Testing API directly...');
      const response = await apiClient.fetchData('generateBrief', { 
        donorId,
        orgId: organizationId,
        context: 'meeting_preparation'
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate donor brief');
      }
      
      if (response.data) {
        // Use the data from the API
        const fullBrief = {
          donor: response.data.donor || {
            id: donorId,
            name: 'Donor Name',
            email: 'email@example.com',
            status: 'ACTIVE',
            relationshipStage: 'STEWARDSHIP',
            notes: ''
          },
          stats: response.data.stats || {
            totalDonations: 0,
            donationCount: 0,
            lastDonation: null,
            avgDonation: 0,
            givingFrequency: 'OCCASIONAL'
          },
          activity: response.data.activity || [],
          aiInsights: response.data.aiInsights || {
            recommendations: [],
            suggestedAsk: 0,
            nextBestTime: 'Unknown',
            recommendedPurpose: 'General support'
          },
          generatedAt: response.data.generatedAt || new Date().toISOString(),
          sections: response.data.sections || {
            overview: true,
            givingHistory: true,
            recommendations: true,
            talkingPoints: true
          },
          isFallback: response.data.isFallback || false
        };
        
        setBrief(fullBrief);
        
        if (response.data.isFallback || response.data.error) {
          setError(response.data.error || 'Using simulated data');
        }
      }
      
    } catch (error) {
      console.error('Failed to generate donor brief:', error);
      setError(error.message || 'Failed to generate donor brief. Using sample data.');
      
      // Create fallback brief
      createFallbackBrief(`API Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createFallbackBrief = (errorMessage = '') => {
    console.log('Creating fallback brief for donor:', donorId);
    
    // Mock data for testing
    const fallbackBrief = {
      donor: {
        id: donorId,
        name: 'John Smith',
        email: 'john.smith@example.com',
        status: 'ACTIVE',
        relationshipStage: 'ENGAGED',
        notes: 'Consistent donor with interest in educational programs. Last contact was 2 months ago.'
      },
      stats: {
        totalDonations: 5000,
        donationCount: 8,
        lastDonation: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        avgDonation: 625,
        givingFrequency: 'QUARTERLY',
        lifetimeValue: 5000,
        firstDonation: new Date(Date.now() - 365 * 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      activity: [
        {
          type: 'DONATION',
          amount: 750,
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Quarterly educational program donation'
        },
        {
          type: 'DONATION',
          amount: 500,
          date: new Date(Date.now() - 135 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Quarterly donation'
        },
        {
          type: 'DONATION',
          amount: 1000,
          date: new Date(Date.now() - 225 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Special year-end gift'
        },
        {
          type: 'EMAIL',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Thank you email sent for last donation'
        },
        {
          type: 'CALL',
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Follow-up call about program impact'
        }
      ],
      aiInsights: {
        recommendations: [
          {
            title: 'Schedule In-Person Meeting',
            description: 'Donor is ready for a deeper relationship. Suggest an in-person meeting to discuss program impact.',
            priority: 'high',
            confidence: 92,
            actionItems: [
              'Send meeting invitation',
              'Prepare impact report',
              'Bring program director'
            ]
          },
          {
            title: 'Increase Recurring Donation',
            description: 'Based on giving pattern, donor is likely to increase recurring donation by 25-30%.',
            priority: 'medium',
            confidence: 78,
            actionItems: [
              'Prepare proposal',
              'Highlight specific program impact',
              'Offer facility tour'
            ]
          },
          {
            title: 'Invite to Exclusive Event',
            description: 'Invite donor to exclusive donor appreciation event next month.',
            priority: 'medium',
            confidence: 85,
            actionItems: [
              'Send formal invitation',
              'Arrange VIP seating',
              'Schedule personal meet-and-greet'
            ]
          }
        ],
        suggestedAsk: 850,
        nextBestTime: 'Early next quarter',
        recommendedPurpose: 'Educational program expansion',
        interests: ['Education', 'Children', 'Community Development'],
        communicationPreference: 'Email',
        bestContactTime: 'Weekday afternoons',
        engagementScore: 78
      },
      generatedAt: new Date().toISOString(),
      sections: {
        overview: true,
        givingHistory: true,
        recommendations: true,
        talkingPoints: true
      },
      isFallback: true,
      fallbackReason: errorMessage
    };
    
    setBrief(fallbackBrief);
    if (errorMessage) {
      setError(`Using simulated data. ${errorMessage}`);
    }
  };

  // Debug function to test API directly
  const testAPIDirectly = async () => {
    try {
      console.log('Testing API directly with:', { donorId, organizationId });
      
      // Test both donor API and AI API
      const donorResponse = await fetch(`/api/donors/${donorId}`);
      const donorData = await donorResponse.json();
      
      // Test AI API
      const aiResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organizationId || 'default-org'
        },
        body: JSON.stringify({
          method: 'generateBrief',
          params: { donorId, orgId: organizationId }
        })
      });
      
      const aiData = await aiResponse.json();
      
      console.log('Direct donor API response:', donorData);
      console.log('Direct AI API response:', aiData);
      
      return { donorData, aiData };
    } catch (error) {
      console.error('Direct API test failed:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('DonorBrief mounted with:', { 
      donorId, 
      organizationId, 
      isOpen,
      hasApiClient: !!apiClient 
    });
    
    if (isOpen && donorId) {
      // Generate brief immediately
      generateBrief();
      
      // Optional: Also test the API directly for debugging
      if (process.env.NODE_ENV === 'development') {
        testAPIDirectly();
      }
    }
  }, [isOpen, donorId, organizationId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const printBrief = () => {
    window.print();
  };

  const downloadBrief = () => {
    if (!brief || !brief.donor) return;
    
    const data = {
      donor: brief.donor,
      stats: brief.stats,
      aiInsights: brief.aiInsights,
      generatedAt: brief.generatedAt,
      isFallback: brief.isFallback || false
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donor-brief-${(brief.donor.name || 'donor').replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="donor-brief-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Generating Donor Brief</h2>
            {onClose && (
              <button onClick={onClose} className="close-btn">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="loading-content">
            <div className="spinner-large"></div>
            <p>Analyzing donor data and generating comprehensive brief...</p>
            <p className="text-sm text-gray-500">Donor ID: {donorId}</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if brief exists and has donor property
  if (!brief || !brief.donor) {
    return (
      <div className="donor-brief-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Donor Brief</h2>
            {onClose && (
              <button onClick={onClose} className="close-btn">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="error-content">
            <ExclamationTriangleIcon className="error-icon w-12 h-12 text-yellow-500" />
            <p className="error-message">Unable to generate brief. Data is missing.</p>
            <p className="text-sm text-gray-600 mt-2">Donor ID: {donorId}</p>
            <div className="mt-4 space-x-2">
              <button onClick={generateBrief} className="retry-btn">
                Retry with API
              </button>
              <button onClick={() => createFallbackBrief('Manual fallback')} className="btn-secondary">
                Use Sample Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add safe access to donor properties
  const donorName = brief.donor?.name || 'Donor';
  const donorEmail = brief.donor?.email || 'No email';
  const donorStatus = brief.donor?.status || 'UNKNOWN';
  const donorStage = brief.donor?.relationshipStage || 'NEW';

  return (
    <div className="donor-brief-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Donor Brief: {donorName}</h2>
          <div className="header-actions">
            {brief.isFallback && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                Demo Data
              </span>
            )}
            <button onClick={downloadBrief} className="action-btn" disabled={!brief}>
              <ArrowDownTrayIcon className="icon" />
              Download
            </button>
            <button onClick={printBrief} className="action-btn" disabled={!brief}>
              <PrinterIcon className="icon" />
              Print
            </button>
            {onClose && (
              <button onClick={onClose} className="close-btn">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="warning-banner">
            <ExclamationTriangleIcon className="warning-icon" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="brief-metadata">
          <span className="generated-time">
            <ClockIcon className="icon" />
            Generated {formatDate(brief.generatedAt)}
            {brief.isFallback && ' (Using Demo Data)'}
          </span>
          <span className="brief-id">Donor ID: {donorId?.slice(0, 8) || 'N/A'}</span>
        </div>
        
        <div className="brief-sections">
          <div className="section-nav">
            {Object.entries(brief.sections || {}).map(([key, enabled]) => (
              enabled && (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`nav-btn ${activeSection === key ? 'active' : ''}`}
                >
                  {key.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </button>
              )
            ))}
          </div>
          
          <div className="section-content">
            {activeSection === 'overview' && (
              <div className="overview-section">
                <div className="donor-profile">
                  <div className="profile-header">
                    <UserIcon className="profile-icon" />
                    <div>
                      <h3>{donorName}</h3>
                      <p className="donor-email">{donorEmail}</p>
                      <p className="donor-status">
                        <span className={`status-badge ${donorStatus.toLowerCase()}`}>
                          {donorStatus}
                        </span>
                        <span className="relationship-stage">
                          {donorStage}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="quick-stats">
                    <div className="stat-card">
                      <CurrencyDollarIcon className="stat-icon" />
                      <div className="stat-content">
                        <span className="stat-value">
                          {formatCurrency(brief.stats?.totalDonations || 0)}
                        </span>
                        <span className="stat-label">Total Given</span>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <ChartBarIcon className="stat-icon" />
                      <div className="stat-content">
                        <span className="stat-value">{brief.stats?.donationCount || 0}</span>
                        <span className="stat-label">Total Gifts</span>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <CalendarIcon className="stat-icon" />
                      <div className="stat-content">
                        <span className="stat-value">
                          {formatDate(brief.stats?.lastDonation)}
                        </span>
                        <span className="stat-label">Last Gift</span>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <CheckCircleIcon className="stat-icon" />
                      <div className="stat-content">
                        <span className="stat-value">
                          {formatCurrency(brief.stats?.avgDonation || 0)}
                        </span>
                        <span className="stat-label">Average Gift</span>
                      </div>
                    </div>
                  </div>
                  
                  {brief.donor?.notes && (
                    <div className="donor-notes">
                      <h4>Notes</h4>
                      <p>{brief.donor.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeSection === 'givingHistory' && (
              <div className="giving-history-section">
                <h3>Giving History</h3>
                {brief.activity?.filter(a => a.type === 'DONATION').length > 0 ? (
                  <div className="donation-timeline">
                    {brief.activity
                      .filter(a => a.type === 'DONATION')
                      .slice(0, 10)
                      .map((donation, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="donation-amount">
                                {formatCurrency(donation.amount)}
                              </span>
                              <span className="donation-date">
                                {formatDate(donation.date)}
                              </span>
                            </div>
                            <p className="donation-description">
                              {donation.description || 'Donation'}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="no-data">No donation history available</p>
                )}
              </div>
            )}
            
            {activeSection === 'recommendations' && (
              <div className="recommendations-section">
                <h3>AI Recommendations</h3>
                <div className="ai-insights">
                  <div className="insight-header">
                    <LightBulbIcon className="insight-icon" />
                    <span>Personalized Suggestions</span>
                  </div>
                  
                  {brief.aiInsights?.recommendations?.length > 0 ? (
                    <div className="recommendations-list">
                      {brief.aiInsights.recommendations.map((rec, index) => (
                        <div key={index} className="recommendation-item">
                          <div className="rec-header">
                            <span className={`rec-priority ${rec.priority || 'medium'}`}>
                              {(rec.priority || 'MEDIUM').toUpperCase()}
                            </span>
                            <span className="rec-confidence">
                              Confidence: {rec.confidence || 75}%
                            </span>
                          </div>
                          <h4>{rec.title || 'Untitled Recommendation'}</h4>
                          <p className="rec-description">
                            {rec.description || 'No description available'}
                          </p>
                          {rec.actionItems && (
                            <div className="action-items">
                              <p className="action-label">Suggested Actions:</p>
                              <ul>
                                {rec.actionItems.map((action, idx) => (
                                  <li key={idx}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="fallback-recommendations">
                      <p>Based on donor's giving pattern, consider:</p>
                      <ul>
                        <li>Invite to exclusive donor update event</li>
                        <li>Schedule a personal thank-you call</li>
                        <li>Share impact report specific to their interests</li>
                        <li>Discuss potential for increased giving</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeSection === 'talkingPoints' && (
              <div className="talking-points-section">
                <h3>Meeting Talking Points</h3>
                <div className="talking-points">
                  <div className="point-category">
                    <h4>Opening & Rapport Building</h4>
                    <ul>
                      <li>Thank them for their generous support</li>
                      <li>Mention their last donation date: {formatDate(brief.stats?.lastDonation)}</li>
                      <li>Ask about their experience with our recent communications</li>
                    </ul>
                  </div>
                  
                  <div className="point-category">
                    <h4>Impact Sharing</h4>
                    <ul>
                      <li>Share specific outcomes from their donations</li>
                      <li>Discuss upcoming initiatives</li>
                      <li>Show how recurring gifts provide sustained impact</li>
                    </ul>
                  </div>
                  
                  <div className="point-category">
                    <h4>Future Engagement</h4>
                    <ul>
                      <li>Discuss potential for increased support</li>
                      <li>Mention exclusive donor opportunities</li>
                      <li>Ask about their preferences for updates</li>
                    </ul>
                  </div>
                  
                  <div className="point-category">
                    <h4>Potential Ask Points</h4>
                    <ul>
                      <li>Suggested ask amount: {formatCurrency(brief.aiInsights?.suggestedAsk || brief.stats?.avgDonation * 1.5 || 150)}</li>
                      <li>Timing: Next {brief.aiInsights?.nextBestTime || 'quarter'}</li>
                      <li>Purpose: {brief.aiInsights?.recommendedPurpose || 'General operating support'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="brief-footer">
          <div className="footer-notes">
            <p className="note">
              <strong>Note:</strong> This brief is generated based on available data and should be reviewed before use.
            </p>
            <p className="refresh-note">
              Data current as of {formatDate(brief.generatedAt)}
            </p>
          </div>
          <div className="footer-actions">
            <button onClick={generateBrief} className="refresh-btn">
              Refresh Brief
            </button>
            <button onClick={() => setActiveSection('overview')} className="back-btn">
              Back to Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}