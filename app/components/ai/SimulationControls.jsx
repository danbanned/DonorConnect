// app/components/ai/SimulationControls.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '../../providers/AIProvider';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  BoltIcon,
  CogIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowUpTrayIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import './SimulationControls.css';

export default function SimulationControls({ 
  simulatedDonors = [],
  simulatedActivities = [],
  onStartSimulation,
  onStopSimulation,
  onPauseSimulation,
  onGenerateTestData,
  onBulkCreate,
  bulkCreating = false,
  bulkProgress = null,
  simulationSettings = null,
  onSettingsChange = null,
  organizationId // Add this prop
}) {
  const { 
    status,
    getSimulationStatus, 
  } = useAI();


  const [simulationStats, setSimulationStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(null);

  // Get organization ID from props or localStorage
  useEffect(() => {
    if (organizationId) {
      setOrgId(organizationId);
    } else {
      const storedOrgId = localStorage.getItem('currentOrgId');
      if (storedOrgId && storedOrgId !== 'default-org') {
        setOrgId(storedOrgId);
      }
    }
  }, [organizationId]);

  // Use a ref to track previous settings and prevent unnecessary updates
  const prevSettingsRef = useRef(simulationSettings);
  
  // Default settings - MUST match what backend expects
  const defaultSettings = {
    speed: 5, // Changed to numeric to match backend
    donorCount: 20,
    activityTypes: [
      { type: 'DONATION', enabled: true },
      { type: 'COMMUNICATION', enabled: true },
      { type: 'MEETING', enabled: true },
      { type: 'TASK', enabled: false }
    ],
    realism: 0.7, // Changed to numeric to match backend
    autoGenerate: true,
    autoSave: false
  };

  // Local settings state
  const [localSettings, setLocalSettings] = useState(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('simulationSettings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved settings:', e);
        }
      }
    }
    return defaultSettings;
  });

  // Convert frontend speed/realism to backend format
  const getBackendSettings = () => {
    let speedValue = 5; // default normal
    
    if (localSettings.speed === 'slow') speedValue = 1;
    else if (localSettings.speed === 'normal') speedValue = 5;
    else if (localSettings.speed === 'fast') speedValue = 10;
    else if (typeof localSettings.speed === 'number') speedValue = localSettings.speed;
    
    let realismValue = 0.7; // default high
    
    if (localSettings.realism === 'low') realismValue = 0.3;
    else if (localSettings.realism === 'medium') realismValue = 0.5;
    else if (localSettings.realism === 'high') realismValue = 0.8;
    else if (typeof localSettings.realism === 'number') realismValue = localSettings.realism;
    
    // Convert activity types array to backend format
    let activityTypesArray = [];
    
    if (Array.isArray(localSettings.activityTypes)) {
      // Check if it's already in backend format (objects with type/enabled)
      if (localSettings.activityTypes.length > 0 && typeof localSettings.activityTypes[0] === 'object') {
        activityTypesArray = localSettings.activityTypes;
      } else {
        // Convert from simple array to backend format
        const typeMap = {
          'donations': 'DONATION',
          'communications': 'COMMUNICATION',
          'profile_updates': 'PROFILE_UPDATE',
          'meetings': 'MEETING',
          'tasks': 'TASK'
        };
        
        activityTypesArray = [
          { type: 'DONATION', enabled: localSettings.activityTypes.includes('donations') },
          { type: 'COMMUNICATION', enabled: localSettings.activityTypes.includes('communications') },
          { type: 'MEETING', enabled: localSettings.activityTypes.includes('meetings') },
          { type: 'TASK', enabled: localSettings.activityTypes.includes('tasks') }
        ];
      }
    }
    
    return {
      donorLimit: localSettings.donorCount,
      speed: speedValue,
      activityTypes: activityTypesArray,
      realism: realismValue,
      organizationId: orgId
    };
  };

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('simulationSettings', JSON.stringify(localSettings));
    }
  }, [localSettings]);

  // Update from parent props if provided
  useEffect(() => {
    if (!simulationSettings || 
        JSON.stringify(simulationSettings) === JSON.stringify(prevSettingsRef.current)) {
      return;
    }
    
    if (JSON.stringify(simulationSettings) !== JSON.stringify(localSettings)) {
      console.log('Settings updated from parent:', simulationSettings);
      setLocalSettings(simulationSettings);
      prevSettingsRef.current = simulationSettings;
    }
  }, [simulationSettings, localSettings]);

  // Load initial stats
  useEffect(() => {
    loadStats();
    
    const interval = setInterval(() => {
      if (status?.simulation?.isRunning) {
        loadStats();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [status?.simulation?.isRunning]);

const loadStats = async () => {
  try {
    // getSimulationStatus is now available from useAI()
    const response = await getSimulationStatus();
    
    if (response.success) {
      // Extract stats from the response
      const simulations = response.data?.simulations || [];
      const activeSim = simulations[0] || {};
      
      setSimulationStats({
        activeDonors: activeSim.donorCount || simulatedDonors.length || 0,
        totalDonations: activeSim.stats?.donationsGenerated || 0,
        totalActivities: activeSim.stats?.activitiesGenerated || getSimulatedActivitiesCount(),
        speed: activeSim.config?.speed || localSettings.speed,
        status: activeSim.status,
        startedAt: activeSim.startedAt
      });
    }
  } catch (error) {
    console.error('Error loading simulation stats:', error);
  }
};

  const updateSettings = (newSettings) => {
    console.log('Updating settings:', newSettings);
    setLocalSettings(newSettings);
    
    if (onSettingsChange && 
        JSON.stringify(newSettings) !== JSON.stringify(prevSettingsRef.current)) {
      onSettingsChange(newSettings);
      prevSettingsRef.current = newSettings;
    }
  };

  const handleStartSimulation = async () => {
    if (!orgId) {
      console.error('No organization ID available');
      return;
    }
    
    setIsLoading(true);
    try {
      const backendSettings = getBackendSettings();
      console.log('Starting simulation with settings:', backendSettings);
      
      if (onStartSimulation) {
        await onStartSimulation(backendSettings);
      }
    } catch (error) {
      console.error('Failed to start simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSimulation = async () => {
    setIsLoading(true);
    try {
      if (onStopSimulation) {
        await onStopSimulation();
      }
    } catch (error) {
      console.error('Failed to stop simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseSimulation = async () => {
    setIsLoading(true);
    try {
      if (onPauseSimulation) {
        await onPauseSimulation();
      }
    } catch (error) {
      console.error('Failed to pause simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTestData = async () => {
    if (!orgId) {
      console.error('No organization ID available');
      return;
    }
    
    setIsLoading(true);
    try {
      if (onGenerateTestData) {
        await onGenerateTestData({
          count: localSettings.donorCount,
          organizationId: orgId,
          autoSave: localSettings.autoSave
        });
      }
    } catch (error) {
      console.error('Failed to generate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    if (onBulkCreate && simulatedDonors.length > 0) {
      await onBulkCreate(simulatedDonors);
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  const getSimulatedActivitiesCount = () => {
    return simulatedActivities.filter(activity => activity.isSimulated).length;
  };

  const isSimulationRunning = status?.simulation?.isRunning || false;

  return (
    <div className="simulation-controls">
      <div className="simulation-header">
        <div className="simulation-title">
          <BoltIcon className="simulation-icon" />
          <h3>AI Donor Simulation</h3>
        </div>
        <div className="simulation-status">
          <div className={`status-indicator ${isSimulationRunning ? 'running' : 'stopped'}`}>
            {isSimulationRunning ? 'Running' : 'Stopped'}
          </div>
          {!orgId && (
            <div className="status-warning">
              No organization selected
            </div>
          )}
          {simulatedDonors.length > 0 && (
            <div className="generated-donors-badge">
              <UserGroupIcon className="badge-icon" />
              {simulatedDonors.length} generated
            </div>
          )}
        </div>
      </div>
      
      {/* Bulk Donor Manager Section */}
      {simulatedDonors.length > 0 && (
        <div className="bulk-donor-manager">
          <div className="bulk-manager-header">
            <div className="bulk-manager-title">
              <SparklesIcon className="bulk-icon" />
              <span>Simulated Donors Ready</span>
            </div>
            <span className="bulk-count">{simulatedDonors.length} donors</span>
          </div>
          
          <div className="bulk-manager-actions">
            <button 
              onClick={handleBulkCreate}
              disabled={bulkCreating || !orgId}
              className={`btn-bulk ${bulkCreating ? 'creating' : ''}`}
            >
              {bulkCreating ? (
                <>
                  <div className="spinner-small"></div>
                  Creating...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="btn-icon" />
                  Save to Database
                </>
              )}
            </button>
            
            <div className="bulk-preview-info">
              <span className="preview-text">
                Preview: {simulatedDonors.slice(0, 3).map(d => d.firstName).join(', ')}
                {simulatedDonors.length > 3 && ` +${simulatedDonors.length - 3} more`}
              </span>
            </div>
          </div>
          
          {bulkCreating && bulkProgress && (
            <div className="bulk-progress">
              <div className="progress-header">
                <span className="progress-status">
                  {bulkProgress.status === 'preparing' && 'Preparing...'}
                  {bulkProgress.status === 'creating' && 'Creating donors...'}
                  {bulkProgress.status === 'completed' && 'Completed!'}
                  {bulkProgress.status === 'error' && 'Error occurred'}
                </span>
                {bulkProgress.processed !== undefined && (
                  <span className="progress-count">
                    {bulkProgress.processed}/{bulkProgress.total}
                  </span>
                )}
              </div>
              {bulkProgress.status === 'creating' && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${(bulkProgress.processed / bulkProgress.total) * 100}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="simulation-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <UserGroupIcon className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">
                {simulationStats?.activeDonors || simulatedDonors.length || 0}
              </span>
              <span className="stat-label">
                {simulationStats ? 'Active Donors' : 'Generated Donors'}
              </span>
            </div>
          </div>
          
          <div className="stat-item">
            <CurrencyDollarIcon className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">
                ${formatNumber(simulationStats?.totalDonations || 0)}
              </span>
              <span className="stat-label">
                {simulationStats ? 'Total Donations' : 'Ready to Import'}
              </span>
            </div>
          </div>
          
          <div className="stat-item">
            <ChartBarIcon className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">
                {formatNumber(simulationStats?.totalActivities || getSimulatedActivitiesCount())}
              </span>
              <span className="stat-label">Activities</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="simulation-actions">
        <div className="action-buttons">
          <button 
            onClick={handleStartSimulation}
            disabled={isLoading || isSimulationRunning || !orgId}
            className="btn-start"
          >
            <PlayIcon className="btn-icon" />
            {isLoading ? 'Starting...' : 'Start Simulation'}
          </button>
          
          <button 
            onClick={handlePauseSimulation}
            disabled={isLoading || !isSimulationRunning}
            className="btn-pause"
          >
            <PauseIcon className="btn-icon" />
            Pause
          </button>
          
          <button 
            onClick={handleStopSimulation}
            disabled={isLoading || !isSimulationRunning}
            className="btn-stop"
          >
            <StopIcon className="btn-icon" />
            Stop
          </button>
        </div>
        
        <button 
          onClick={handleGenerateTestData}
          disabled={isLoading || !orgId}
          className="btn-generate"
        >
          <ArrowPathIcon className="btn-icon" />
          Generate Test Donors
        </button>
      </div>
      
      <div className="simulation-settings">
        <div className="settings-header">
          <CogIcon className="settings-icon" />
          <h4>Simulation Settings</h4>
        </div>
        
        <div className="settings-grid">
          <div className="setting-item">
            <label>Speed</label>
            <select 
              value={localSettings.speed}
              onChange={(e) => updateSettings({...localSettings, speed: e.target.value})}
              disabled={isSimulationRunning}
            >
              <option value="slow">Slow (1x)</option>
              <option value="normal">Normal (5x)</option>
              <option value="fast">Fast (10x)</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>Donor Count</label>
            <select 
              value={localSettings.donorCount}
              onChange={(e) => updateSettings({...localSettings, donorCount: parseInt(e.target.value)})}
              disabled={isSimulationRunning}
            >
              <option value="5">5 Donors</option>
              <option value="10">10 Donors</option>
              <option value="20">20 Donors</option>
              <option value="50">50 Donors</option>
              <option value="100">100 Donors</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>Realism Level</label>
            <select 
              value={localSettings.realism}
              onChange={(e) => updateSettings({...localSettings, realism: e.target.value})}
              disabled={isSimulationRunning}
            >
              <option value="low">Low (30%)</option>
              <option value="medium">Medium (50%)</option>
              <option value="high">High (80%)</option>
            </select>
          </div>
          
          <div className="setting-item checkbox">
            <label>
              <input 
                type="checkbox"
                checked={localSettings.autoGenerate}
                onChange={(e) => updateSettings({...localSettings, autoGenerate: e.target.checked})}
                disabled={isSimulationRunning}
              />
              Auto-generate data
            </label>
          </div>
          
          <div className="setting-item checkbox">
            <label>
              <input 
                type="checkbox"
                checked={localSettings.autoSave}
                onChange={(e) => updateSettings({...localSettings, autoSave: e.target.checked})}
                disabled={isSimulationRunning}
              />
              Auto-save to database
            </label>
          </div>
        </div>
        
        <div className="activity-types">
          <label>Activity Types to Simulate:</label>
          <div className="activity-checkboxes">
            {[
              { id: 'donations', label: 'Donations', type: 'DONATION' },
              { id: 'communications', label: 'Communications', type: 'COMMUNICATION' },
              { id: 'meetings', label: 'Meetings', type: 'MEETING' },
              { id: 'tasks', label: 'Tasks', type: 'TASK' }
            ].map((activity) => (
              <div key={activity.id} className="activity-checkbox">
                <label>
                  <input 
                    type="checkbox"
                    checked={localSettings.activityTypes.includes(activity.id)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...localSettings.activityTypes, activity.id]
                        : localSettings.activityTypes.filter(t => t !== activity.id);
                      updateSettings({...localSettings, activityTypes: newTypes});
                    }}
                    disabled={isSimulationRunning}
                  />
                  {activity.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}