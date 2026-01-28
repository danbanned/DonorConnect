// app/components/ai/AINotifications.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAI } from '../../providers/AIProvider';

export default function useAINotifications() {
  const { aiSystem, status, apiClient } = useAI();
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const notificationSoundRef = useRef(null);
  const lastDonationRef = useRef(null);
  const notifiedRef = useRef({
    simulationStarted: false,
    aiInitialized: false,
    bondingCount: 0
  });
  const didWelcomeRef = useRef(false);

  // Helper function to add notifications
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

    // Auto-remove based on importance
    const duration = notification.importance === 'important' ? 10000 : 5000;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, duration);

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('notificationAdded', {
      detail: newNotification
    }));

    return newNotification;
  };

  // Helper function to push notification (similar to your example)
  const pushNotification = (notification) => {
    const newNotification = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
      unread: true,
      timestamp: new Date(),
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    return newNotification;
  };

  // Monitor AI status for changes
  useEffect(() => {
    if (!status || isPaused) return;

    // Simulation started
    if (status.simulation?.isRunning && !notifiedRef.current.simulationStarted) {
      notifiedRef.current.simulationStarted = true;
      pushNotification({
        type: 'simulation',
        title: 'Simulation Started',
        message: 'AI simulation is now running',
        importance: 'normal',
        data: { type: 'simulation_started', progress: 0 }
      });
    }

    // Bonding sessions
    if (status.bonding?.activeSessions > notifiedRef.current.bondingCount) {
      notifiedRef.current.bondingCount = status.bonding.activeSessions;
      pushNotification({
        type: 'bonding',
        title: 'Bonding Session Active',
        message: `${status.bonding.activeSessions} donor bonding sessions in progress`,
        importance: 'normal',
        data: { status: 'active', count: status.bonding.activeSessions }
      });
    }

    // AI initialized
    if (status.initialized && !notifiedRef.current.aiInitialized) {
      notifiedRef.current.aiInitialized = true;
      pushNotification({
        type: 'system',
        title: 'AI Initialized',
        message: 'AI system successfully connected and ready',
        importance: 'important',
        data: { timestamp: new Date().toISOString() }
      });
    }

    // Welcome message
    if (status.initialized && !didWelcomeRef.current) {
      didWelcomeRef.current = true;
      pushNotification({
        type: 'ai',
        title: 'AI Assistant Ready',
        message: 'AI system initialized and monitoring activity.',
        importance: 'normal'
      });
    }
  }, [status, isPaused]);

  // Listen for donation events from AI system
  useEffect(() => {
    if (!aiSystem || isPaused) return;

    // Example: Listen for donation events
    // This assumes aiSystem has an event emitter
    const handleDonation = (donation) => {
      if (donation.id === lastDonationRef.current) return;
      lastDonationRef.current = donation.id;

      pushNotification({
        type: 'donation',
        title: 'New Donation',
        message: `${donation.donorName || 'A donor'} donated $${donation.amount}`,
        importance: donation.amount > 1000 ? 'important' : 'normal',
        data: { ...donation }
      });
    };

    // Example: Listen for simulation events
    const handleSimulationEvent = (event) => {
      if (event.type === 'donor_activity') {
        pushNotification({
          type: 'ai_activity',
          title: 'Donor Activity',
          message: event.message || 'Donor activity detected',
          importance: 'normal',
          data: { ...event }
        });
      }
    };

    // Subscribe to events if aiSystem has event emitter methods
    if (aiSystem.on) {
      aiSystem.on('donation', handleDonation);
      aiSystem.on('simulation_event', handleSimulationEvent);
    }

    return () => {
      if (aiSystem.off) {
        aiSystem.off('donation', handleDonation);
        aiSystem.off('simulation_event', handleSimulationEvent);
      }
    };
  }, [aiSystem, isPaused]);

  // API-based polling for activities (fallback)
  useEffect(() => {
    if (!apiClient || isPaused) return;

    const pollInterval = setInterval(async () => {
      try {
        const activity = await apiClient.fetchData('organizationActivity', {
          orgId: 'default-org',
          limit: 1
        }, { usePost: true });

        if (activity?.success && activity.data?.activities?.length > 0) {
          const latestActivity = activity.data.activities[0];
          
          // Check if this is a new activity
          const existingNotification = notifications.find(n => 
            n.data?.activityId === latestActivity.id
          );
          
          if (!existingNotification) {
            pushNotification({
              type: 'ai_activity',
              title: 'New Activity',
              message: `${latestActivity.description}`,
              importance: 'normal',
              data: { 
                activityId: latestActivity.id,
                ...latestActivity 
              }
            });
          }
        }
      } catch (error) {
        console.error('Error polling for activities:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [apiClient, isPaused, notifications.length]);

  // Notification management functions
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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

  // Helper function to get unread count
  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  // Helper function to get formatted notifications
  const getFormattedNotifications = () => {
    return notifications.map(notification => ({
      ...notification,
      formattedTime: formatTime(notification.timestamp)
    }));
  };

  // Helper function to format time
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

  // Helper function to get notification icon class
  const getNotificationIconClass = (type) => {
    switch (type) {
      case 'donation':
        return 'text-green-500';
      case 'simulation':
        return 'text-blue-500';
      case 'bonding':
        return 'text-purple-500';
      case 'ai_activity':
        return 'text-yellow-500';
      case 'system':
      case 'ai':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  // Return data object instead of JSX
  return {
    // Notification data
    notifications: getFormattedNotifications(),
    rawNotifications: notifications,
    unreadCount: getUnreadCount(),
    
    // Settings
    soundEnabled,
    isPaused,
    
    // Notification management functions
    addNotification: pushNotification,
    removeNotification,
    markAsRead,
    markAllRead,
    clearAll,
    
    // Settings management functions
    toggleSound,
    togglePause,
    setSoundEnabled,
    setIsPaused,
    
    // Helper functions for UI components
    getNotificationIconClass,
    formatTime,
    
    // Data for rendering
    notificationStats: {
      total: notifications.length,
      unread: getUnreadCount(),
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {}),
      importantCount: notifications.filter(n => n.importance === 'important').length
    }
  };
}

// Optional: Export a hook for easy use
export function useAINotificationsData() {
  return useAINotifications();
}

// Optional: Export a context provider version
export const AINotificationsProvider = ({ children }) => {
  const notifications = useAINotifications();
  
  // You can wrap this in a context if needed
  return children;
};