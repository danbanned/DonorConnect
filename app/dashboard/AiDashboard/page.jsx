// app/components/ai/AIDashboard.jsx
'use client';

import { useAI } from '../../providers/AIProvider';
import { useState, useEffect } from 'react';
import './AIDashboard.css';

export default function AIDashboard() {
  const { aiSystem, apiClient, isLoading, status } = useAI();
  const [insights, setInsights] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [activeDonor, setActiveDonor] = useState(null);
  
  useEffect(() => {
    if (aiSystem && status.initialized) {
      loadAIInsights();
    }
  }, [aiSystem, status.initialized]);
  
  const loadAIInsights = async () => {
    const orgId = localStorage.getItem('currentOrgId') || 'default-org';
    
    try {
      // Get predictions
      const preds = await aiSystem.predictDonations('next_quarter');
      setPredictions(preds);
      
      // Get recommendations
      const recs = await aiSystem.getRecommendations();
      
      setInsights({
        recommendations: recs,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    }
  };
  
  const analyzeDonor = async (donorId) => {
    if (!aiSystem) return;
    
    try {
      const analysis = await aiSystem.analyzeDonor(donorId);
      setActiveDonor({
        id: donorId,
        analysis,
        analyzedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to analyze donor:', error);
    }
  };
  
  if (isLoading) {
    return <div className="ai-loading">AI System Loading...</div>;
  }
  
  if (!status.initialized) {
    return <div className="ai-offline">AI System Offline</div>;
  }
  
  return (
    <div className="ai-dashboard">
      <div className="ai-header">
        <h2>AI Insights Dashboard</h2>
        <button onClick={loadAIInsights} className="refresh-btn">
          Refresh Insights
        </button>
      </div>
      
      <div className="ai-grid">
        {/* Health Score Card */}
        <div className="ai-card">
          <h3>Organization Health</h3>
          <div className="health-score">
            <div className="score-circle">
              <span className="score-value">
                {predictions?.confidence || 0}%
              </span>
              <span className="score-label">Confidence</span>
            </div>
            <div className="health-details">
              <p>Next Quarter Prediction: ${predictions?.prediction?.toLocaleString() || 0}</p>
              <p>Factors: {predictions?.factors?.join(', ') || 'Loading...'}</p>
            </div>
          </div>
        </div>
        
        {/* Active Sessions */}
        <div className="ai-card">
          <h3>Active AI Sessions</h3>
          <div className="sessions-list">
            {status.bonding?.activeSessions > 0 ? (
              <div className="active-session">
                <span className="session-count">{status.bonding.activeSessions}</span>
                <span className="session-label">Donor Bonding Sessions</span>
              </div>
            ) : (
              <p className="no-sessions">No active sessions</p>
            )}
          </div>
        </div>
        
        {/* Simulation Status */}
        <div className="ai-card">
          <h3>Simulation</h3>
          <div className="simulation-status">
            {status.simulation?.isRunning ? (
              <div className="simulation-running">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${status.simulation.progress}%` }}
                  />
                </div>
                <span className="progress-text">{status.simulation.progress}%</span>
              </div>
            ) : (
              <p className="simulation-idle">Ready to run simulations</p>
            )}
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="ai-card recommendations">
          <h3>AI Recommendations</h3>
          {insights?.recommendations ? (
            <div className="recommendations-list">
              {insights.recommendations.recommendations?.slice(0, 3).map((rec, index) => (
                <div key={index} className={`recommendation priority-${rec.priority}`}>
                  <span className="rec-priority">{rec.priority}</span>
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Loading recommendations...</p>
          )}
        </div>
      </div>
    </div>
  );
}