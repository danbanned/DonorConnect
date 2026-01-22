// app/components/ai/AINotifications.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '../../providers/AIProvider';
import {
  XMarkIcon,
  BellIcon,
  BellAlertIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import './AINotifications.css';

export default function AINotifications() {
  const { aiSystem, status, apiClient } = useAI();
  const [notifications, setNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const notificationSoundRef = useRef(null);
  const lastDonationRef = useRef(null);

  // Initialize notification sound
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a simple notification sound (can be replaced with actual audio file)
      notificationSoundRef.current = new Audio();
      notificationSoundRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='; // Silent audio as fallback
      notificationSoundRef.current.volume = 0.3;
    }

    // Listen for AI events
    const handleAIActivity = (event) => {
      if (isPaused) return;
      
      const activity = event.detail;
      addNotification({
        type: 'ai_activity',
        title: 'AI Activity Detected',
        message: activity.message || 'New AI insight generated',
        importance: activity.importance || 'normal',
        data: activity.data || {}
      });
    };

    // Listen for simulation events
    const handleSimulationEvent = (event) => {
      const simulation = event.detail;
      addNotification({
        type: 'simulation',
        title: 'AI Simulation Update',
        message: simulation.message,
        importance: simulation.progress === 100 ? 'important' : 'normal',
        data: simulation
      });
    };

    // Listen for bonding events
    const handleBondingEvent = (event) => {
      const bonding = event.detail;
      addNotification({
        type: 'bonding',
        title: 'Donor Bonding Update',
        message: bonding.message,
        importance: 'normal',
        data: bonding
      });
    };

    // Set up event listeners
    window.addEventListener('aiActivity', handleAIActivity);
    window.addEventListener('aiSimulationUpdate', handleSimulationEvent);
    window.addEventListener('aiBondingUpdate', handleBondingEvent);

    // Simulate initial notifications for demo
    setTimeout(() => {
      addNotification({
        type: 'welcome',
        title: 'AI System Ready',
        message: 'DonorConnect AI is now analyzing your data',
        importance: 'important',
        data: { timestamp: new Date() }
      });
    }, 1000);

    // Check for donation updates periodically
    const donationCheckInterval = setInterval(async () => {
      if (!apiClient || isPaused) return;
      
      try {
        const orgId = localStorage.getItem('currentOrgId') || 'default-org';
        const result = await apiClient.fetchData('recentDonations', { 
          orgId, 
          limit: 1 
        });
        
        if (result.success && result.data && result.data.length > 0) {
          const latestDonation = result.data[0];
          if (lastDonationRef.current !== latestDonation.id) {
            lastDonationRef.current = latestDonation.id;
            
            addNotification({
              type: 'donation',
              title: 'New Donation Received',
              message: `${latestDonation.donor?.firstName} ${latestDonation.donor?.lastName} donated $${latestDonation.amount}`,
              importance: 'important',
              data: latestDonation
            });
          }
        }
      } catch (error) {
        console.error('Error checking donations:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('aiActivity', handleAIActivity);
      window.removeEventListener('aiSimulationUpdate', handleSimulationEvent);
      window.removeEventListener('aiBondingUpdate', handleBondingEvent);
      clearInterval(donationCheckInterval);
    };
  }, [apiClient, isPaused]);

  // Monitor AI status for changes
  useEffect(() => {
    if (!status || isPaused) return;

    // Check for simulation status changes
    if (status.simulation?.isRunning && !notifications.some(n => n.data?.type === 'simulation_started')) {
      addNotification({
        type: 'simulation',
        title: 'Simulation Started',
        message: 'AI simulation is now running',
        importance: 'normal',
        data: { type: 'simulation_started', progress: 0 }
      });
    }

    // Check for bonding sessions
    if (status.bonding?.activeSessions > 0) {
      const activeSessionCount = notifications.filter(n => 
        n.type === 'bonding' && n.data?.status === 'active'
      ).length;
      
      if (status.bonding.activeSessions > activeSessionCount) {
        addNotification({
          type: 'bonding',
          title: 'Bonding Session Active',
          message: `${status.bonding.activeSessions} donor bonding sessions in progress`,
          importance: 'normal',
          data: { status: 'active', count: status.bonding.activeSessions }
        });
      }
    }

    // Check for AI initialization
    if (status.initialized && !notifications.some(n => n.type === 'ai_initialized')) {
      addNotification({
        type: 'system',
        title: 'AI Initialized',
        message: 'AI system successfully connected and ready',
        importance: 'important',
        data: { timestamp: new Date().toISOString() }
      });
    }
  }, [status, notifications, isPaused]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: new Date(),
      importance: notification.importance || 'normal',
      data: notification.data || {},
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev.slice(0, 19)]; // Keep max 20 notifications
      return updated;
    });

    // Play sound if enabled
    if (soundEnabled && notificationSoundRef.current && notification.importance === 'important') {
      try {
        notificationSoundRef.current.currentTime = 0;
        notificationSoundRef.current.play().catch(e => console.log('Audio play failed:', e));
      } catch (error) {
        console.error('Sound error:', error);
      }
    }

    // Auto-remove based on importance
    const duration = notification.importance === 'important' ? 10000 : 5000;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, duration);

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('notificationAdded', {
      detail: newNotification
    }));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'donation':
        return <CurrencyDollarIcon className="w-5 h-5 text-green-500" />;
      case 'simulation':
        return <SparklesIcon className="w-5 h-5 text-blue-500" />;
      case 'bonding':
        return <UserGroupIcon className="w-5 h-5 text-purple-500" />;
      case 'ai_activity':
        return <ChartBarIcon className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <BellAlertIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = isExpanded ? notifications : notifications.slice(0, 3);

  if (notifications.length === 0) {
    return (
      <div className="ai-notifications">
        <div className="ai-notifications-empty">
          <BellIcon className="w-5 h-5 text-gray-400" />
          <span>No AI notifications yet</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`ai-notifications ${isExpanded ? 'expanded' : 'collapsed'}`}
      data-count={unreadCount > 0 ? unreadCount : ''}
    >
      <div className="ai-notifications-header">
        <div className="ai-notifications-title">
          <SparklesIcon className="w-4 h-4" />
          <span>AI Notifications</span>
          {unreadCount > 0 && (
            <span className="ai-notifications-badge">{unreadCount}</span>
          )}
        </div>
        <div className="ai-notifications-controls">
          <button
            onClick={toggleSound}
            className={`ai-control-btn ${soundEnabled ? 'sound-on' : 'sound-off'}`}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? (
              <SpeakerWaveIcon className="w-4 h-4" />
            ) : (
              <SpeakerXMarkIcon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={togglePause}
            className={`ai-control-btn ${isPaused ? 'paused' : 'active'}`}
            title={isPaused ? 'Resume notifications' : 'Pause notifications'}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="ai-control-btn clear"
              title="Clear all notifications"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="ai-notifications-list">
        {displayedNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`ai-notification ${notification.type} ${notification.importance} ${notification.read ? 'read' : 'unread'}`}
            onClick={() => markAsRead(notification.id)}
            onMouseEnter={() => !notification.read && markAsRead(notification.id)}
          >
            <div className="notification-content">
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-details">
                <div className="notification-header">
                  <h4 className="notification-title">{notification.title}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="notification-close"
                    title="Dismiss"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-footer">
                  <span className="notification-time">
                    <ClockIcon className="w-3 h-3" />
                    {formatTime(notification.timestamp)}
                  </span>
                  {notification.importance === 'important' && (
                    <span className="notification-importance">Important</span>
                  )}
                </div>
              </div>
            </div>
            {!notification.read && (
              <div className="notification-unread-indicator" />
            )}
          </div>
        ))}
      </div>

      {notifications.length > 3 && (
        <div className="ai-notifications-footer">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ai-notifications-toggle"
          >
            {isExpanded ? 'Show Less' : `Show ${notifications.length - 3} More`}
          </button>
        </div>
      )}

      {isPaused && (
        <div className="ai-notifications-paused">
          <span>Notifications paused</span>
          <button onClick={togglePause} className="resume-btn">
            Resume
          </button>
        </div>
      )}
    </div>
  );
}