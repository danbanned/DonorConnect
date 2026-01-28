// app/components/ai/SimulationControls.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react'; // Added useRef here
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
  onSettingsChange = null
}) {
  const { 
    status,
    getSimulationStats 
  } = useAI();
  
  const [simulationStats, setSimulationStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use a ref to track previous settings and prevent unnecessary updates
  const prevSettingsRef = useRef(simulationSettings);
  
  // Use settings from props only - don't create separate local state
  const [localSettings, setLocalSettings] = useState(() => {
    // Default settings - MUST match Dashboard defaults exactly
    const defaults = {
      speed: 'normal',
      donorCount: 20,
      activityTypes: ['donations', 'communications', 'profile_updates'],
      realism: 'high',
      autoGenerate: true,
      autoSave: false
    };

    // Only use simulationSettings if it's different from defaults
    // This prevents the initial render loop
    if (simulationSettings && 
        JSON.stringify(simulationSettings) !== JSON.stringify(defaults)) {
      return simulationSettings;
    }
    
    return defaults;
  });


  // and it's different from our current state
  useEffect(() => {
    // Skip if simulationSettings is null or unchanged
    if (!simulationSettings || 
        JSON.stringify(simulationSettings) === JSON.stringify(prevSettingsRef.current)) {
      return;
    }
    
    // Only update if there's a meaningful difference
    if (JSON.stringify(simulationSettings) !== JSON.stringify(localSettings)) {
      console.log('Settings updated from parent:', simulationSettings);
      setLocalSettings(simulationSettings);
      prevSettingsRef.current = simulationSettings;
    }
  }, [simulationSettings, localSettings]);

    const organizationId = localStorage.getItem('currentOrgId') || 'default-org';


  // Always notify parent when settings change
  // Always notify parent when settings change
  const updateSettings = (newSettings) => {
    console.log('Updating settings:', newSettings);
    setLocalSettings(newSettings);
    
    // Immediately notify parent
    if (onSettingsChange && 
        JSON.stringify(newSettings) !== JSON.stringify(prevSettingsRef.current)) {
      onSettingsChange(newSettings);
      prevSettingsRef.current = newSettings;
    }
  };

  // Load initial stats
  useEffect(() => {
    loadStats();
    
    // Set up interval to update stats every 5 seconds
    const interval = setInterval(() => {
      if (status?.simulation?.isRunning) {
        loadStats();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [status?.simulation?.isRunning]);

  const loadStats = async () => {
    try {
      const stats = await getSimulationStats();
      if (stats) {
        setSimulationStats(stats);
      }
    } catch (error) {
      console.error('Error loading simulation stats:', error);
    }
  };

  const handleStartSimulation = async () => {
    setIsLoading(true);
    try {
      if (onStartSimulation) {
        await onStartSimulation({
          donorLimit: localSettings.donorCount,
          speed: localSettings.speed,
          activityTypes: localSettings.activityTypes,
          realism: localSettings.realism,
          organizationId
        });
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
    setIsLoading(true);
    try {
      if (onGenerateTestData) {
        await onGenerateTestData({
          count: localSettings.donorCount,
          organizationId,
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

  return (
    <div className="simulation-controls">
      <div className="simulation-header">
        <div className="simulation-title">
          <BoltIcon className="simulation-icon" />
          <h3>AI Donor Simulation</h3>
        </div>
        <div className="simulation-status">
          <div className={`status-indicator ${status?.simulation?.isRunning ? 'running' : 'stopped'}`}>
            {status?.simulation?.isRunning ? 'Running' : 'Stopped'}
          </div>
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
              disabled={bulkCreating}
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
            disabled={isLoading || status?.simulation?.isRunning}
            className="btn-start"
          >
            <PlayIcon className="btn-icon" />
            {isLoading ? 'Starting...' : 'Start Simulation'}
          </button>
          
          <button 
            onClick={handlePauseSimulation}
            disabled={isLoading || !status?.simulation?.isRunning}
            className="btn-pause"
          >
            <PauseIcon className="btn-icon" />
            Pause
          </button>
          
          <button 
            onClick={handleStopSimulation}
            disabled={isLoading || !status?.simulation?.isRunning}
            className="btn-stop"
          >
            <StopIcon className="btn-icon" />
            Stop
          </button>
        </div>
        
        <button 
          onClick={handleGenerateTestData}
          disabled={isLoading}
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
              disabled={status?.simulation?.isRunning}
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
              disabled={status?.simulation?.isRunning}
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
              disabled={status?.simulation?.isRunning}
            >
              <option value="low">Low (Simple)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Realistic)</option>
            </select>
          </div>
          
          <div className="setting-item checkbox">
            <label>
              <input 
                type="checkbox"
                checked={localSettings.autoGenerate}
                onChange={(e) => updateSettings({...localSettings, autoGenerate: e.target.checked})}
                disabled={status?.simulation?.isRunning}
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
                disabled={status?.simulation?.isRunning}
              />
              Auto-save to database
            </label>
          </div>
        </div>
        
        <div className="activity-types">
          <label>Activity Types to Simulate:</label>
          <div className="activity-checkboxes">
            {['donations', 'communications', 'profile_updates'].map((type) => (
              <div key={type} className="activity-checkbox">
                <label>
                  <input 
                    type="checkbox"
                    checked={localSettings.activityTypes.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...localSettings.activityTypes, type]
                        : localSettings.activityTypes.filter(t => t !== type);
                      updateSettings({...localSettings, activityTypes: newTypes});
                    }}
                    disabled={status?.simulation?.isRunning}
                  />
                  {type.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}