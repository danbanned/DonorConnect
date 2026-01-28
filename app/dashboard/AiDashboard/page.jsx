// app/components/ai/.jsx
'use client';

import { useAI } from '../../providers/AIProvider';
import { useState, useEffect, useRef } from 'react';
import './AIDashboard.css';

export default function AIDashboard() {
  const { 
    aiSystem, 
    apiClient, 
    isLoading, 
    status,
    // All AI methods from provider
    startSimulation,
    stopSimulation,
    pauseSimulation,
    resumeSimulation,
    getSimulationStats,
    generateFakeDonorData,
    simulateDonor,
    startRoleplay,
    askDonor,
    getDonorPersona,
    startBondingSession,
    getPredictions,
    getRecommendations,
    onSimulationEvent,
    offSimulationEvent,
    emitSimulationEvent,
    refreshData,
    getSimulatedActivities,
    quickSimulate
  } = useAI();
  
  const [insights, setInsights] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [activeDonor, setActiveDonor] = useState(null);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);
  
  // Load initial data
  useEffect(() => {
    if (status.initialized && !isLoading) {
      loadAIInsights();
      loadSimulatedActivities();
      setupEventListeners();
    }
    
    return () => {
      // Cleanup event listeners
      if (offSimulationEvent) {
        // Remove any listeners if needed
      }
    };
  }, [status.initialized, isLoading]);
  
  // Setup event listeners for real-time updates
  const setupEventListeners = () => {
    if (onSimulationEvent) {
      onSimulationEvent((event) => {
        console.log('AI Event received:', event);
        
        // Update UI based on event type
        switch (event.type) {
          case 'donation':
            // Refresh predictions when donation occurs
            loadPredictions();
            break;
          case 'simulation_started':
            // Update simulation status
            loadSimulationStats();
            break;
          case 'simulation_stopped':
            // Clear simulation stats
            setInsights(prev => ({
              ...prev,
              simulationStats: null
            }));
            break;
        }
      });
    }
  };
  
  // Load all AI insights
  const loadAIInsights = async () => {
    try {
      setError(null);
      
      // Load predictions
      await loadPredictions();
      
      // Load recommendations
      await loadRecommendations();
      
      // Load simulation stats
      await loadSimulationStats();
      
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      setError(error.message);
      setFallbackData();
    }
  };
  
  const loadPredictions = async () => {
    try {
      const preds = await getPredictions('next_quarter');
      setPredictions(preds);
    } catch (error) {
      console.warn('Using fallback predictions');
      setPredictions({
        confidence: 75,
        prediction: 125000,
        factors: ['Historical trends', 'Donor engagement', 'Seasonal patterns'],
        timeframe: 'next_quarter',
        generatedAt: new Date().toISOString()
      });
    }
  };
  
  const loadRecommendations = async () => {
    try {
      const recs = await getRecommendations(5);
      setInsights(prev => ({
        ...prev,
        recommendations: recs,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Using fallback recommendations');
      setInsights(prev => ({
        ...prev,
        recommendations: getMockRecommendations(),
        lastUpdated: new Date().toISOString()
      }));
    }
  };
  
  const loadSimulationStats = async () => {
    try {
      const stats = await getSimulationStats();
      setInsights(prev => ({
        ...prev,
        simulationStats: stats
      }));
    } catch (error) {
      console.warn('Could not load simulation stats');
    }
  };
  
  const loadSimulatedActivities = async () => {
    try {
      const activities = await getSimulatedActivities(10);
      setInsights(prev => ({
        ...prev,
        recentActivities: activities
      }));
    } catch (error) {
      console.warn('Could not load simulated activities');
    }
  };
  
  // Mock data for fallback
  const getMockRecommendations = () => {
    return {
      recommendations: [
        {
          id: 1,
          title: 'Re-engage LYBUNT donors',
          description: '45 donors from last year haven\'t donated this year. Target them with a special appeal.',
          priority: 'high',
          impact: 'high',
          estimatedValue: 22500,
          actionType: 'campaign'
        },
        {
          id: 2,
          title: 'Increase monthly giving program',
          description: 'Only 15% of donors are monthly givers. Promote recurring donations in your next campaign.',
          priority: 'medium',
          impact: 'medium',
          estimatedValue: 15000,
          actionType: 'program'
        },
        {
          id: 3,
          title: 'Personalize major donor outreach',
          description: '12 donors have high capacity but haven\'t been contacted in 6 months.',
          priority: 'high',
          impact: 'high',
          estimatedValue: 30000,
          actionType: 'outreach'
        }
      ],
      generatedAt: new Date().toISOString()
    };
  };
  
  const setFallbackData = () => {
    setPredictions({
      confidence: 65,
      prediction: 100000,
      factors: ['Using fallback data'],
      timeframe: 'next_quarter',
      generatedAt: new Date().toISOString()
    });
    
    setInsights({
      recommendations: getMockRecommendations(),
      lastUpdated: new Date().toISOString()
    });
  };
  
  // Simulation Controls
  const handleStartSimulation = async () => {
    try {
      const orgId = localStorage.getItem('currentOrgId') || 'default-org';
      const result = await startSimulation(orgId, {
        intensity: 'medium',
        duration: '1h',
        donorCount: 50
      });
      
      if (result.success) {
        console.log('Simulation started successfully');
        loadSimulationStats();
      }
    } catch (error) {
      setError(`Failed to start simulation: ${error.message}`);
    }
  };
  
  const handleStopSimulation = async () => {
    try {
      const result = await stopSimulation();
      if (result.success) {
        console.log('Simulation stopped successfully');
      }
    } catch (error) {
      setError(`Failed to stop simulation: ${error.message}`);
    }
  };
  
  // Chat with AI Donor Functions
  const startDonorConversation = async (donorId) => {
    try {
      setIsChatting(true);
      setSelectedDonor(donorId);
      setConversation([]);
      
      // Get donor persona
      const persona = await getDonorPersona(donorId);
      
      // Start roleplay session
      const session = await startRoleplay(donorId, {
        scenario: 'general_conversation',
        context: {
          persona: persona,
          purpose: 'relationship_building'
        }
      });
      
      if (session.success && session.data?.greeting) {
        setConversation([{
          id: 1,
          sender: 'ai',
          text: session.data.greeting,
          timestamp: new Date().toISOString(),
          persona: persona
        }]);
      } else {
        // Fallback greeting
        setConversation([{
          id: 1,
          sender: 'ai',
          text: `Hello! I'm donor ${donorId}. How can I help you today?`,
          timestamp: new Date().toISOString(),
          persona: persona
        }]);
      }
      
    } catch (error) {
      setError(`Failed to start conversation: ${error.message}`);
      setIsChatting(false);
    }
  };
  
  const sendMessageToDonor = async () => {
    if (!userMessage.trim() || !selectedDonor || !isChatting) return;
    
    const messageId = conversation.length + 1;
    const userMsg = {
      id: messageId,
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    };
    
    // Add user message to conversation
    setConversation(prev => [...prev, userMsg]);
    const currentMessage = userMessage;
    setUserMessage('');
    
    try {
      // Get AI response
      const response = await askDonor(selectedDonor, currentMessage);
      
      if (response.success) {
        const aiMsg = {
          id: messageId + 1,
          sender: 'ai',
          text: response.data.answer || response.data.response,
          timestamp: new Date().toISOString(),
          metadata: response.data.metadata
        };
        
        setConversation(prev => [...prev, aiMsg]);
      } else {
        throw new Error(response.error || 'No response from AI');
      }
    } catch (error) {
      setError(`Failed to get response: ${error.message}`);
      
      // Add error message
      const errorMsg = {
        id: messageId + 1,
        sender: 'system',
        text: `Sorry, I couldn't process your message. Please try again.`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setConversation(prev => [...prev, errorMsg]);
    }
  };
  
  const endConversation = () => {
    setIsChatting(false);
    setSelectedDonor(null);
    setConversation([]);
  };
  
  // Quick actions
  const handleQuickSimulate = async (type) => {
    try {
      const result = await quickSimulate(type);
      if (result.success) {
        console.log(`Quick ${type} simulation successful`);
        loadAIInsights(); // Refresh data
      }
    } catch (error) {
      setError(`Quick simulate failed: ${error.message}`);
    }
  };
  
  const generateTestDonor = async () => {
    try {
      const result = await generateFakeDonorData({
        count: 1,
        includePersonality: true
      });
      
      if (result.success && result.data?.donors?.[0]) {
        const donor = result.data.donors[0];
        setActiveDonor({
          id: donor.id,
          name: donor.name,
          profile: donor,
          generatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      setError(`Failed to generate donor: ${error.message}`);
    }
  };
  
  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);
  
  if (isLoading) {
    return <div className="ai-loading">🔄 AI System Loading...</div>;
  }
  
  if (!status.initialized) {
    return (
      <div className="ai-offline">
        <h3>⚠️ AI System Offline</h3>
        <p>Unable to connect to AI services. Please check your connection.</p>
        <button onClick={refreshData} className="retry-btn">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="ai-dashboard">
      {/* Header */}
      <div className="ai-header">
        <div className="header-left">
          <h2>🤖 AI Insights Dashboard</h2>
          <div className="ai-status">
            <span className={`status-indicator ${status.initialized ? 'online' : 'offline'}`}>
              {status.initialized ? '● Online' : '○ Offline'}
            </span>
            {status.lastUpdate && (
              <span className="last-update">
                Updated: {new Date(status.lastUpdate).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={loadAIInsights} className="refresh-btn">
            🔄 Refresh All
          </button>
          <button onClick={handleStartSimulation} className="simulation-btn">
            🎮 Start Simulation
          </button>
          {status.simulation?.isRunning && (
            <button onClick={handleStopSimulation} className="stop-btn">
              ⏹️ Stop Simulation
            </button>
          )}
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="ai-error">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
          <button onClick={() => setError(null)} className="dismiss-btn">
            ✕
          </button>
        </div>
      )}
      
      {/* Main Dashboard Grid */}
      <div className="ai-grid">
        {/* Health Score & Predictions */}
        <div className="ai-card health-card">
          <h3>📊 Organization Health</h3>
          <div className="health-score">
            <div className="score-circle">
              <span className="score-value">
                {predictions?.confidence || 0}%
              </span>
              <span className="score-label">Confidence Score</span>
            </div>
            <div className="health-details">
              <div className="prediction-item">
                <span className="prediction-label">Next Quarter Prediction:</span>
                <span className="prediction-value">
                  ${(predictions?.prediction || 0).toLocaleString()}
                </span>
              </div>
              <div className="factors-section">
                <h4>Key Factors:</h4>
                <div className="factors-grid">
                  {predictions?.factors?.map((factor, index) => (
                    <div key={index} className="factor-item">
                      <span className="factor-bullet">•</span>
                      <span>{factor}</span>
                    </div>
                  )) || (
                    <div className="no-factors">No factors available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="quick-actions">
            <button onClick={() => handleQuickSimulate('donation')} className="quick-btn">
              💸 Simulate Donation
            </button>
            <button onClick={() => handleQuickSimulate('communication')} className="quick-btn">
              ✉️ Simulate Message
            </button>
            <button onClick={generateTestDonor} className="quick-btn">
              👤 Generate Test Donor
            </button>
          </div>
        </div>
        
        {/* Simulation Status */}
        <div className="ai-card simulation-card">
          <h3>🎮 Live Simulation</h3>
          <div className="simulation-status">
            {status.simulation?.isRunning ? (
              <div className="simulation-active">
                <div className="simulation-header">
                  <span className="simulation-badge running">● LIVE</span>
                  <span className="simulation-title">Active Simulation</span>
                  {status.simulation.elapsedTime && (
                    <span className="simulation-time">
                      ⏱️ {status.simulation.elapsedTime}
                    </span>
                  )}
                </div>
                
                <div className="simulation-stats-grid">
                  <div className="stat-box">
                    <span className="stat-value">{status.simulation.activeDonors || 0}</span>
                    <span className="stat-label">Active Donors</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{status.simulation.totalActivities || 0}</span>
                    <span className="stat-label">Activities</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">
                      ${(status.simulation.totalDonations || 0).toLocaleString()}
                    </span>
                    <span className="stat-label">Total Donations</span>
                  </div>
                </div>
                
                <div className="simulation-controls">
                  <button onClick={pauseSimulation} className="control-btn pause">
                    ⏸️ Pause
                  </button>
                  <button onClick={handleStopSimulation} className="control-btn stop">
                    ⏹️ Stop
                  </button>
                </div>
              </div>
            ) : (
              <div className="simulation-inactive">
                <div className="simulation-placeholder">
                  <span className="placeholder-icon">🎮</span>
                  <p>No active simulation</p>
                </div>
                <div className="simulation-options">
                  <button onClick={handleStartSimulation} className="start-btn">
                    ▶️ Start New Simulation
                  </button>
                  <button onClick={resumeSimulation} className="resume-btn">
                    🔄 Resume Previous
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* AI Recommendations */}
        <div className="ai-card recommendations-card">
          <div className="recommendations-header">
            <h3>💡 AI Recommendations</h3>
            <button onClick={loadRecommendations} className="refresh-rec-btn">
              🔄
            </button>
          </div>
          {insights?.recommendations ? (
            <div className="recommendations-list">
              {insights.recommendations.recommendations?.map((rec, index) => (
                <div key={rec.id || index} className={`recommendation-item priority-${rec.priority}`}>
                  <div className="rec-header">
                    <span className={`priority-badge ${rec.priority}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="rec-impact">Impact: {rec.impact}</span>
                  </div>
                  <h4 className="rec-title">{rec.title}</h4>
                  <p className="rec-description">{rec.description}</p>
                  <div className="rec-footer">
                    <span className="rec-value">
                      Est. Value: ${rec.estimatedValue?.toLocaleString()}
                    </span>
                    <div className="rec-actions">
                      <button className="action-btn implement">
                        Implement
                      </button>
                      <button className="action-btn details">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="loading-recommendations">
              <p>Loading recommendations...</p>
            </div>
          )}
        </div>
        
        {/* AI Chat Interface */}
        <div className="ai-card chat-card">
          <div className="chat-header">
            <h3>💬 Chat with AI Donor</h3>
            {isChatting && selectedDonor && (
              <button onClick={endConversation} className="end-chat-btn">
                End Chat
              </button>
            )}
          </div>
          
          {!isChatting ? (
            <div className="chat-setup">
              <div className="setup-content">
                <p>Start a conversation with an AI donor to practice your fundraising skills.</p>
                
                <div className="donor-selection">
                  <h4>Select a Donor:</h4>
                  <div className="donor-options">
                    <button 
                      onClick={() => startDonorConversation('donor-001')}
                      className="donor-option"
                    >
                      <span className="donor-emoji">👨‍💼</span>
                      <span className="donor-name">Business Executive</span>
                      <span className="donor-type">Major Donor</span>
                    </button>
                    <button 
                      onClick={() => startDonorConversation('donor-002')}
                      className="donor-option"
                    >
                      <span className="donor-emoji">👩‍⚕️</span>
                      <span className="donor-name">Healthcare Worker</span>
                      <span className="donor-type">Monthly Giver</span>
                    </button>
                    <button 
                      onClick={() => startDonorConversation('donor-003')}
                      className="donor-option"
                    >
                      <span className="donor-emoji">👨‍🎓</span>
                      <span className="donor-name">University Alumni</span>
                      <span className="donor-type">LYBUNT Donor</span>
                    </button>
                  </div>
                </div>
                
                <div className="scenario-options">
                  <h4>Or choose a scenario:</h4>
                  <div className="scenario-buttons">
                    <button className="scenario-btn" onClick={() => {
                      // You can implement scenario-based conversation starters
                      console.log('Start thank you call scenario');
                    }}>
                      🙏 Thank You Call
                    </button>
                    <button className="scenario-btn" onClick={() => {
                      console.log('Start fundraising ask scenario');
                    }}>
                      💰 Fundraising Ask
                    </button>
                    <button className="scenario-btn" onClick={() => {
                      console.log('Start cultivation conversation');
                    }}>
                      🌱 Cultivation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="active-chat">
              {/* Donor Info */}
              <div className="donor-info">
                <span className="donor-status">● Talking with Donor {selectedDonor}</span>
                {conversation[0]?.persona && (
                  <span className="donor-persona">
                    {conversation[0].persona.traits?.join(', ')}
                  </span>
                )}
              </div>
              
              {/* Chat Messages */}
              <div className="chat-messages">
                {conversation.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}
                  >
                    <div className="message-content">
                      <div className="message-sender">
                        {msg.sender === 'ai' ? '🤖 AI Donor' : 
                         msg.sender === 'user' ? '👤 You' : 
                         '⚠️ System'}
                      </div>
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="message-input">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessageToDonor()}
                  placeholder="Type your message to the donor..."
                  disabled={!isChatting}
                />
                <button 
                  onClick={sendMessageToDonor}
                  disabled={!userMessage.trim() || !isChatting}
                  className="send-btn"
                >
                  Send
                </button>
              </div>
              
              {/* Conversation Tips */}
              <div className="chat-tips">
                <h4>💡 Conversation Tips:</h4>
                <div className="tips-grid">
                  <button 
                    className="tip-btn"
                    onClick={() => setUserMessage("What inspired you to start giving to our organization?")}
                  >
                    Ask about motivation
                  </button>
                  <button 
                    className="tip-btn"
                    onClick={() => setUserMessage("How do you prefer to receive updates about our work?")}
                  >
                    Communication preferences
                  </button>
                  <button 
                    className="tip-btn"
                    onClick={() => setUserMessage("What impact do you hope your donations will have?")}
                  >
                    Discuss impact
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* System Status */}
        <div className="ai-card status-card">
          <h3>⚙️ System Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">AI Initialized:</span>
              <span className={`status-value ${status.initialized ? 'good' : 'bad'}`}>
                {status.initialized ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Simulation:</span>
              <span className={`status-value ${status.simulation?.isRunning ? 'active' : 'inactive'}`}>
                {status.simulation?.isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Bonding Sessions:</span>
              <span className="status-value">
                {status.bonding?.activeSessions || 0} active
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Update:</span>
              <span className="status-value">
                {status.lastUpdate ? new Date(status.lastUpdate).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
          
          <div className="system-actions">
            <button onClick={refreshData} className="system-btn">
              🔄 Refresh Data
            </button>
            <button onClick={() => loadSimulatedActivities()} className="system-btn">
              📊 Load Activities
            </button>
            <button onClick={() => console.log('System diagnostics')} className="system-btn">
              🔧 Diagnostics
            </button>
          </div>
        </div>
        
        {/* Recent Activities */}
        <div className="ai-card activities-card">
          <h3>📈 Recent Activities</h3>
          <div className="activities-list">
            {insights?.recentActivities?.length > 0 ? (
              insights.recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className={`activity-icon ${activity.type?.toLowerCase()}`}>
                    {activity.type === 'DONATION' ? '💸' : 
                     activity.type === 'COMMUNICATION' ? '✉️' : '📝'}
                  </span>
                  <div className="activity-details">
                    <span className="activity-title">{activity.description}</span>
                    <span className="activity-time">
                      {new Date(activity.date).toLocaleTimeString()}
                    </span>
                  </div>
                  {activity.amount && (
                    <span className="activity-amount">
                      ${activity.amount.toLocaleString()}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="no-activities">
                <p>No recent activities</p>
                <button onClick={loadSimulatedActivities} className="load-activities-btn">
                  Load Activities
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Active Donor Analysis Panel */}
      {activeDonor && (
        <div className="donor-analysis-panel">
          <div className="panel-header">
            <h3>👤 Donor Analysis: {activeDonor.name || activeDonor.id}</h3>
            <button onClick={() => setActiveDonor(null)} className="close-panel-btn">
              ✕
            </button>
          </div>
          <div className="panel-content">
            <div className="donor-profile">
              <div className="profile-section">
                <h4>Profile Information</h4>
                <pre>{JSON.stringify(activeDonor.profile, null, 2)}</pre>
              </div>
              <div className="action-section">
                <button 
                  onClick={() => startDonorConversation(activeDonor.id)}
                  className="chat-with-donor-btn"
                >
                  💬 Chat with this Donor
                </button>
                <button 
                  onClick={() => simulateDonor(activeDonor.id, 'donation_scenario')}
                  className="simulate-donor-btn"
                >
                  🎮 Simulate Donation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}