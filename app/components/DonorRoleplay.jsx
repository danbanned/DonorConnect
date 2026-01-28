// components/DonorRoleplay.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAI } from '../providers/AIProvider';
import { 
  UserIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon, 
  XMarkIcon,
  SparklesIcon,
  LightBulbIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import './DonorRoleplay.css'

export default function DonorRoleplay({ donorId, donorName, onClose }) {
  const { apiClient } = useAI();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // Start a new roleplay session
  const startSession = async () => {
    if (!donorId) return;
    
    setIsStarting(true);
    setError(null);
    try {
      // Try using direct POST request as a fallback
      let response;
      
      if (apiClient && typeof apiClient.fetchData === 'function') {
        try {
          response = await apiClient.fetchData('startRoleplay', {
            donorId,
            context: {
              topic: 'general conversation',
              purpose: 'relationship building'
            }
          });
        } catch (apiError) {
          console.log('API client failed, trying direct POST:', apiError);
          // Fallback to direct POST request
          response = await makeDirectPostRequest('startRoleplay', {
            donorId,
            context: {
              topic: 'general conversation',
              purpose: 'relationship building'
            }
          });
        }
      } else {
        // Use direct POST request if no apiClient
        response = await makeDirectPostRequest('startRoleplay', {
          donorId,
          context: {
            topic: 'general conversation',
            purpose: 'relationship building'
          }
        });
      }
      
      if (response.data) {
        setSession(response.data);
        
        // Add initial greeting
        setMessages([{
          id: 'greeting',
          content: response.data.greeting,
          sender: 'donor',
          timestamp: new Date().toISOString()
        }]);
        
        // Analyze donor persona
        analyzeDonor();
      } else {
        throw new Error('No data returned from API');
      }
    } catch (error) {
      console.error('Failed to start roleplay session:', error);
      setError(error.message || 'Failed to start session');
      
      // Create a mock session for testing
      const mockSession = {
        sessionId: `mock_${Date.now()}_${donorId}`,
        donor: {
          id: donorId,
          name: donorName || 'Test Donor',
          email: 'test@example.com'
        },
        persona: {
          type: 'SUPPORTER',
          traits: ['generous', 'engaged'],
          communicationStyle: 'balanced',
          givingPattern: 'regular',
          interests: ['education', 'healthcare'],
          description: 'Supporter interested in education and healthcare'
        },
        greeting: "Hello! Thanks for reaching out. I'm glad to connect with you.",
        context: {
          topic: 'general conversation',
          purpose: 'relationship building'
        },
        startedAt: new Date().toISOString(),
        isMock: true
      };
      
      setSession(mockSession);
      setMessages([{
        id: 'greeting',
        content: mockSession.greeting,
        sender: 'donor',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsStarting(false);
    }
  };

  // Helper function for direct POST requests
  const makeDirectPostRequest = async (method, params) => {
    const orgId = localStorage.getItem('currentOrgId') || 'default-org';
    
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-org-id': orgId
      },
      body: JSON.stringify({ method, params })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Failed to ${method}`);
    }
    
    return data;
  };

  const analyzeDonor = async () => {
    try {
      let response;
      
      if (apiClient && typeof apiClient.fetchData === 'function') {
        response = await apiClient.fetchData('askDonor', {
          donorId,
          question: "What are your main interests in our organization?"
        });
      } else {
        response = await makeDirectPostRequest('askDonor', {
          donorId,
          question: "What are your main interests in our organization?"
        });
      }
      
      setAnalysis(response.data);
    } catch (error) {
      console.error('Failed to analyze donor:', error);
      // Set mock analysis for testing
      setAnalysis({
        persona: {
          description: 'Supporter interested in general programs',
          communicationStyle: 'Balanced',
          interests: ['education', 'healthcare']
        },
        sentiment: 'POSITIVE',
        isMock: true
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !session || isLoading) return;
    
    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      let response;
      
      if (apiClient && typeof apiClient.fetchData === 'function') {
        response = await apiClient.fetchData('askDonor', {
          donorId,
          question: inputMessage
        });
      } else {
        response = await makeDirectPostRequest('askDonor', {
          donorId,
          question: inputMessage
        });
      }
      
      const donorMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        sender: 'donor',
        timestamp: new Date().toISOString(),
        sentiment: response.data.sentiment,
        followUpQuestions: response.data.followUpQuestions
      };
      
      setMessages(prev => [...prev, donorMessage]);
      
      // Update session with new insights
      if (response.data.sentiment === 'NEGATIVE') {
        setSession(prev => ({
          ...prev,
          insights: {
            ...prev?.insights,
            cautionNeeded: true,
            lastNegativeResponse: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        id: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'system',
        timestamp: new Date().toISOString()
      }]);
      
      // Add a mock response for testing
      const mockResponse = {
        id: (Date.now() + 1).toString(),
        content: "That's a great question! I appreciate you asking about that.",
        sender: 'donor',
        timestamp: new Date().toISOString(),
        sentiment: 'POSITIVE',
        followUpQuestions: [
          "Could you tell me more about that?",
          "How does this align with your organization's goals?"
        ],
        isMock: true
      };
      
      setMessages(prev => [...prev, mockResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSuggestedQuestions = () => [
    "What inspired you to support our organization?",
    "How would you like to stay informed about our impact?",
    "What programs are you most interested in?",
    "Would you consider becoming a monthly donor?",
    "How can we make your donation experience better?"
  ];

  // Start session on mount if donorId is provided
  useEffect(() => {
    if (donorId && !session) {
      startSession();
    }
  }, [donorId]);

  const retryStartSession = () => {
    setError(null);
    startSession();
  };

  if (isStarting) {
    return (
      <div className="donor-roleplay">
        <div className="roleplay-header">
          <h3>Preparing Roleplay Session</h3>
        </div>
        <div className="roleplay-loading">
          <div className="spinner"></div>
          <p>Analyzing donor persona and preparing conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="donor-roleplay">
        <div className="roleplay-header">
          <h3>Donor Roleplay</h3>
          {onClose && (
            <button onClick={onClose} className="close-btn">
              <XMarkIcon className="icon" />
            </button>
          )}
        </div>
        <div className="roleplay-error">
          <div className="error-icon">⚠️</div>
          <h4>Failed to Start Session</h4>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={retryStartSession} className="btn-primary">
              Try Again
            </button>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="donor-roleplay">
        <div className="roleplay-header">
          <h3>Donor Roleplay</h3>
          {onClose && (
            <button onClick={onClose} className="close-btn">
              <XMarkIcon className="icon" />
            </button>
          )}
        </div>
        <div className="roleplay-empty">
          <ChatBubbleLeftRightIcon className="empty-icon" />
          <p>Start a conversation with {donorName || 'this donor'}</p>
          <button onClick={startSession} className="start-btn">
            <SparklesIcon className="icon" />
            Start Roleplay Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-roleplay">
      <div className="roleplay-header">
        <div className="session-info">
          <UserIcon className="icon" />
          <div>
            <h3>Conversation with {donorName || session.donor?.name}</h3>
            <p className="session-time">
              <ClockIcon className="icon" />
              Started {new Date(session.startedAt).toLocaleTimeString()}
              {session.isMock && <span className="mock-badge">Mock</span>}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="close-btn">
            <XMarkIcon className="icon" />
          </button>
        )}
      </div>

      {analysis && (
        <div className="donor-analysis-brief">
          <div className="analysis-header">
            <LightBulbIcon className="icon" />
            <span>AI Analysis</span>
            {analysis.isMock && <span className="mock-badge small">Mock</span>}
          </div>
          <div className="analysis-content">
            <p><strong>Persona:</strong> {analysis.persona?.description || 'Supporter'}</p>
            <p><strong>Communication Style:</strong> {analysis.persona?.communicationStyle || 'Balanced'}</p>
            <p><strong>Suggested Topics:</strong> {analysis.persona?.interests?.join(', ') || 'General'}</p>
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender}`}
            data-sentiment={message.sentiment}
          >
            <div className="message-content">
              <p>{message.content}</p>
              {message.followUpQuestions && (
                <div className="follow-up-questions">
                  <p className="follow-up-label">Suggested follow-up questions:</p>
                  {message.followUpQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMessage(question)}
                      className="follow-up-btn"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="message-time">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
              {message.isMock && <span className="mock-indicator">Mock</span>}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="message donor typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="suggested-questions">
        <p className="suggested-label">Quick questions:</p>
        <div className="question-chips">
          {getSuggestedQuestions().map((question, idx) => (
            <button
              key={idx}
              onClick={() => setInputMessage(question)}
              className="question-chip"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div className="input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask the donor a question..."
          disabled={isLoading}
          rows="2"
        />
        <button 
          onClick={sendMessage} 
          disabled={!inputMessage.trim() || isLoading}
          className="send-btn"
        >
          Send
        </button>
      </div>

      {session.insights?.cautionNeeded && (
        <div className="caution-alert">
          <DocumentTextIcon className="icon" />
          <p>This donor has expressed concerns. Consider reviewing the conversation history before proceeding.</p>
        </div>
      )}
    </div>
  );
}