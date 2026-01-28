// app/providers/AIProvider.jsx - FIXED VERSION
'use client';


import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AIContext = createContext(null);

// API Client with unified endpoint - FIXED
class AIDataClient {
  constructor(baseUrl = '/api/ai') {
    this.baseUrl = baseUrl;
  }

  async fetchData(method, params = {}, options = {}) {
    const { usePost = false, headers = {} } = options;
    
    console.log('🔍 AIDataClient.fetchData called:', { 
      method, 
      params, 
      usePost, 
      baseUrl: this.baseUrl 
    });

    try {
      if (usePost) {
        // POST request
        const url = this.baseUrl; // Use base URL directly for POST
        const requestBody = {
          method,
          params
        };

        console.log('📤 AI API POST Request:', {
          url,
          body: requestBody
        });
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify(requestBody)
        });

        //console.log('📥 AI API Response status:', response.status, response.statusText);

        if (!response.ok) {
          const text = await response.text();
          console.error('❌ API error:', text);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
       // console.log('AI API Response:', { method, data: result });
        return result;
      } else {
        // GET request - FIXED: Build URL properly
        const queryParams = new URLSearchParams();
        queryParams.append('method', method);
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === 'object') {
              queryParams.append(key, JSON.stringify(value));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
        
        const url = `${this.baseUrl}?${queryParams.toString()}`;
        //console.log('📤 AI API GET Request:', url);
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          const text = await response.text();
          console.error('❌ API error:', text);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error(`API Error (${method}):`, error);
      throw error;
    }
  }

  // AI-specific methods - Updated with proper error handling
  async generateFakeDonorData(options = {}) {
    return this.fetchData('generateFakeDonorData', options, { usePost: true });
  }

  async simulateDonor(donorId, scenario = 'default') {
    return this.fetchData('simulateDonor', { donorId, scenario }, { usePost: true });
  }

  async generateDonorData(orgId, donorProfile = {}) {
    return this.fetchData('generateDonorData', { orgId, donorProfile }, { usePost: true });
  }

  async startDonorRoleplay(donorId, context = {}) {
    return this.fetchData('startRoleplay', { donorId, context }, { usePost: true });
  }

  async askDonor(donorId, question) {
    return this.fetchData('askDonor', { donorId, question }, { usePost: true });
  }

  async getAIData(orgId) {
    return this.fetchData('aiInitialize', { orgId }, { usePost: true });
  }

  async getSimulationData(orgId, limits = {}) {
    return this.fetchData('simulationData', { orgId, ...limits }, { usePost: true });
  }

  async getDonorSummary(donorId) {
    return this.fetchData('donorSummary', { donorId }, { usePost: false });
  }

  async getDonationStats(orgId, filters = {}) {
    return this.fetchData('donationStats', { orgId, filters }, { usePost: false });
  }

  async getBatchData(operations) {
    return this.fetchData('batch', { operations }, { usePost: true });
  }

  // New simulation methods
  async startSimulation(orgId, options = {}) {
    return this.fetchData('startSimulation', { orgId, ...options }, { usePost: true });
  }

  async stopSimulation() {
    return this.fetchData('stopSimulation', {}, { usePost: true });
  }

  async pauseSimulation() {
    return this.fetchData('pauseSimulation', {}, { usePost: true });
  }

  async getSimulationStats() {
    return this.fetchData('getSimulationStats', {}, { usePost: false });
  }

  async getSimulatedActivities(limit = 20) {
    return this.fetchData('getSimulatedActivities', { limit }, { usePost: false });
  }

  // New: Prediction and Recommendation methods
  async getPredictions(timeframe = 'next_quarter', orgId = null) {
    const actualOrgId = orgId || localStorage.getItem('currentOrgId') || 'default-org';
    return this.fetchData('predictions', { 
      timeframe,
      orgId: actualOrgId 
    }, { usePost: true });
  }

  async getRecommendations(orgId = null, limit = 5) {
    const actualOrgId = orgId || localStorage.getItem('currentOrgId') || 'default-org';
    return this.fetchData('recommendations', { 
      orgId: actualOrgId,
      limit 
    }, { usePost: true });
  }

  async healthCheck() {
    return this.fetchData('health', {}, { usePost: false });
  }
}

export function AIProvider({ children }) {
  const [aiSystem, setAiSystem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState({
    simulation: { 
      isRunning: false,
      isPaused: false,
      activeDonors: 0,
      totalActivities: 0,
      totalDonations: 0
    },
    bonding: { activeSessions: 0 },
    initialized: false,
    lastUpdate: null,
    error: null
  });
  
  const [apiClient] = useState(() => new AIDataClient());
  const simulationEventListeners = useRef([]);
  const simulationInterval = useRef(null);

  // Set up simulation event system
  const setupSimulationEventListeners = useCallback(() => {
    if (!window._simulationCallbacks) {
      window._simulationCallbacks = [];
    }

    // Listen for window events from simulation
    const handleSimulationEvent = (event) => {
      if (window._simulationCallbacks) {
        window._simulationCallbacks.forEach(callback => {
          try {
            callback(event.detail);
          } catch (error) {
            console.error('Error in simulation callback:', error);
          }
        });
      }

      // Update status based on event
      if (event.detail) {
        switch (event.detail.type) {
          case 'donation':
            setStatus(prev => ({
              ...prev,
              simulation: {
                ...prev.simulation,
                totalDonations: (prev.simulation.totalDonations || 0) + (event.detail.data?.amount || 0),
                totalActivities: (prev.simulation.totalActivities || 0) + 1
              }
            }));
            break;
          case 'communication':
          case 'profile_update':
            setStatus(prev => ({
              ...prev,
              simulation: {
                ...prev.simulation,
                totalActivities: (prev.simulation.totalActivities || 0) + 1
              }
            }));
            break;
          case 'simulation_started':
            setStatus(prev => ({
              ...prev,
              simulation: {
                ...prev.simulation,
                isRunning: true,
                isPaused: false,
                ...event.detail.data
              }
            }));
            break;
          case 'simulation_paused':
            setStatus(prev => ({
              ...prev,
              simulation: {
                ...prev.simulation,
                isRunning: false,
                isPaused: true
              }
            }));
            break;
          case 'simulation_stopped':
            setStatus(prev => ({
              ...prev,
              simulation: {
                isRunning: false,
                isPaused: false,
                activeDonors: 0,
                totalActivities: 0,
                totalDonations: 0
              }
            }));
            break;
        }
      }
    };

    // Listen for different event types
    const eventTypes = [
      'donorDonation',
      'donorCommunication',
      'donorProfileUpdate',
      'donorEngagement',
      'simulationStarted',
      'simulationPaused',
      'simulationStopped'
    ];

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleSimulationEvent);
      simulationEventListeners.current.push({
        type: eventType,
        handler: handleSimulationEvent
      });
    });

    return () => {
      // Clean up event listeners
      simulationEventListeners.current.forEach(({ type, handler }) => {
        window.removeEventListener(type, handler);
      });
      simulationEventListeners.current = [];
    };
  }, []);

  // Initialize AI system
  useEffect(() => {
    const initializeAI = async () => {
      try {
        setIsLoading(true);
        //console.log('🤖 Starting AI initialization...');
        
        // Dynamically import AI system
        const { default: AIGateway } = await import('../ai/index.js');
        //console.log('✅ AI Gateway imported');
        

        // Create API-aware AI system
        const system = new AIGateway(apiClient, {
          simulationEnabled: true,
          bondingEnabled: true,
          environment: process.env.NODE_ENV
        });
       // console.log('✅ AI system created');
        
        // Get organization ID
        const organizationId = localStorage.getItem('currentOrgId') || 
                              sessionStorage.getItem('currentOrgId') || 
                              'default-org';
        //console.log('📋 Organization ID:', organizationId);
        
        // Initialize with batch data
        const initData = await apiClient.getAIData(organizationId);
       // console.log('📦 API Response:', initData);
        
        if (initData.success) {
          await system.initialize(organizationId, initData.data);
          setAiSystem(system);
          
          // Set up event listeners
          setupSimulationEventListeners();
          
          setStatus(prev => ({
            ...prev,
            initialized: true,
            lastUpdate: new Date().toISOString(),
            dataSummary: initData.data.summary
          }));
          console.log('✅ AI System initialized with data');
        } else {
          throw new Error(`AI initialization failed: ${initData.error}`);
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize AI system:', error);
        setStatus(prev => ({ 
          ...prev, 
          error: error.message, 
          initialized: false 
        }));
      } finally {
        setIsLoading(false);
      }
    };

    initializeAI();
    
    return () => {
      // Clean up on unmount
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
      
      if (aiSystem) {
        aiSystem.stopSimulation();
      }
      
      // Remove event listeners
      if (simulationEventListeners.current.length > 0) {
        simulationEventListeners.current.forEach(({ type, handler }) => {
          window.removeEventListener(type, handler);
        });
      }
    };
  }, [apiClient, setupSimulationEventListeners]);

  // Update status periodically
  useEffect(() => {
    if (!aiSystem || !status.initialized) return;
    
    const updateStatus = async () => {
      try {
        // Refresh data periodically
        const orgId = localStorage.getItem('currentOrgId') || 'default-org';
        
        //console.log('🔄 Updating organization activity for orgId:', orgId);
        
        try {
          // Make sure to pass usePost: true
          const activity = await apiClient.fetchData('organizationActivity', { 
            orgId, 
            limit: 5 
          }, { 
            usePost: true, // Make sure this is true
            headers: {
              'x-org-id': orgId // Add organization ID to headers
            }
          });
          
          //console.log('📊 Activity API response:', activity);
          
          if (activity && activity.success) {
            setStatus(prev => ({
              ...prev,
              lastUpdate: new Date().toISOString(),
              recentActivity: activity.data || activity.data?.activities || [],
              activityLoaded: true
            }));
          } else {
            console.warn('Activity API returned unsuccessful:', activity);
            setStatus(prev => ({
              ...prev,
              lastUpdate: new Date().toISOString(),
              recentActivity: [],
              activityError: activity?.error || 'Unknown error'
            }));
          }
        } catch (apiError) {
          console.warn('Activity API call failed:', apiError.message);
          setStatus(prev => ({
            ...prev,
            lastUpdate: new Date().toISOString(),
            recentActivity: getFallbackActivities(),
            activityError: apiError.message
          }));
        }
        
        // Get AI system status if available
        if (aiSystem && typeof aiSystem.getStatus === 'function') {
          try {
            const aiStatus = await aiSystem.getStatus();
            console.log('🤖 AI System status:', aiStatus);
            setStatus(prev => ({ ...prev, ...aiStatus }));
          } catch (aiError) {
            console.warn('Failed to get AI system status:', aiError);
          }
        }
        
      } catch (error) {
        console.warn('Background update failed:', error);
      }
    };

    // Helper function for fallback data
    function getFallbackActivities() {
      return [
        {
          id: 'fallback-1',
          type: 'DONATION',
          donor: 'Sample Donor',
          description: 'Donated $500',
          date: new Date().toISOString(),
          icon: 'CurrencyDollarIcon'
        },
        {
          id: 'fallback-2', 
          type: 'COMMUNICATION',
          donor: 'Another Donor',
          description: 'Sent an email',
          date: new Date(Date.now() - 86400000).toISOString(),
          icon: 'EnvelopeIcon'
        }
      ];
    }

    simulationInterval.current = setInterval(updateStatus, 10000); // Update every 10 seconds
    
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [aiSystem, status.initialized, apiClient]);

  // Simulation event system
  const onSimulationEvent = useCallback((callback) => {
    if (!window._simulationCallbacks) {
      window._simulationCallbacks = [];
    }
    
    if (!window._simulationCallbacks.includes(callback)) {
      window._simulationCallbacks.push(callback);
    }
    
    // Return cleanup function
    return () => {
      if (window._simulationCallbacks) {
        window._simulationCallbacks = window._simulationCallbacks.filter(cb => cb !== callback);
      }
    };
  }, []);

  const offSimulationEvent = useCallback((callback) => {
    if (window._simulationCallbacks) {
      window._simulationCallbacks = window._simulationCallbacks.filter(cb => cb !== callback);
    }
  }, []);

  const emitSimulationEvent = useCallback((eventData) => {
    if (window._simulationCallbacks) {
      window._simulationCallbacks.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          console.error('Error in simulation callback:', error);
        }
      });
    }
    
    // Also dispatch as window event for other components
    const eventType = `donor${eventData.type.charAt(0).toUpperCase() + eventData.type.slice(1)}`;
    window.dispatchEvent(new CustomEvent(eventType, { detail: eventData }));
  }, []);

  // Main API value
  const value = {
    // Core state
    aiSystem,
    isLoading,
    status,
    apiClient,

    // Simulation Controls
    startSimulation: async (orgId, options = {}) => {
      try {
        console.log('[SIM START ENTRY]', Date.now(), { orgId, options });
        
        let result;
        if (aiSystem?.services?.simulation) {
          // Use AI system's simulation service
          //console.log('[BEFORE await simulation.start]', Date.now());
          result = await aiSystem.services.simulation.start(orgId, options);
         // console.log('[AFTER await simulation.start]', Date.now(), result);

        } else {
          // Fallback to direct API
          result = await apiClient.startSimulation(orgId, options);
        }
        
        if (result.success) {
          // Emit simulation started event
          emitSimulationEvent({
            type: 'simulation_started',
            data: result.data,
            timestamp: new Date().toISOString()
          });
          
          setStatus(prev => ({
            ...prev,
            simulation: {
              ...prev.simulation,
              isRunning: true,
              isPaused: false,
              ...result.data
            }
          }));
          
          console.log('✅ Simulation started successfully');
        }
        
        return result;
      } catch (error) {
        console.error('Failed to start simulation:', error);
        setStatus(prev => ({
          ...prev,
          error: error.message
        }));
        throw error;
      }
    },
    
    stopSimulation: async () => {
      try {
        console.log('🛑 Stopping simulation...');
        
        let result;
        if (aiSystem?.services?.simulation) {
          result = await aiSystem.services.simulation.stop();
        } else {
          result = await apiClient.stopSimulation();
        }
        
        if (result.success) {
          // Emit simulation stopped event
          emitSimulationEvent({
            type: 'simulation_stopped',
            data: result.data,
            timestamp: new Date().toISOString()
          });
          
          setStatus(prev => ({
            ...prev,
            simulation: {
              isRunning: false,
              isPaused: false,
              activeDonors: 0,
              totalActivities: 0,
              totalDonations: 0
            }
          }));
          
          console.log('✅ Simulation stopped successfully');
        }
        
        return result;
      } catch (error) {
        console.error('Failed to stop simulation:', error);
        setStatus(prev => ({
          ...prev,
          error: error.message
        }));
        throw error;
      }
    },
    
    pauseSimulation: async () => {
      try {
        console.log('⏸️ Pausing simulation...');
        
        let result;
        if (aiSystem?.services?.simulation) {
          result = await aiSystem.services.simulation.pause();
        } else {
          result = await apiClient.pauseSimulation();
        }
        
        if (result.success) {
          // Emit simulation paused event
          emitSimulationEvent({
            type: 'simulation_paused',
            data: result.data,
            timestamp: new Date().toISOString()
          });
          
          setStatus(prev => ({
            ...prev,
            simulation: {
              ...prev.simulation,
              isRunning: false,
              isPaused: true
            }
          }));
          
          console.log('✅ Simulation paused successfully');
        }
        
        return result;
      } catch (error) {
        console.error('Failed to pause simulation:', error);
        setStatus(prev => ({
          ...prev,
          error: error.message
        }));
        throw error;
      }
    },
    
    resumeSimulation: async () => {
      try {
        console.log('▶️ Resuming simulation...');
        
        const orgId = localStorage.getItem('currentOrgId') || 'default-org';
        const result = await apiClient.startSimulation(orgId, { resume: true });
        
        if (result.success) {
          emitSimulationEvent({
            type: 'simulation_started',
            data: result.data,
            timestamp: new Date().toISOString()
          });
          
          setStatus(prev => ({
            ...prev,
            simulation: {
              ...prev.simulation,
              isRunning: true,
              isPaused: false,
              ...result.data
            }
          }));
          
          console.log('✅ Simulation resumed successfully');
        }
        
        return result;
      } catch (error) {
        console.error('Failed to resume simulation:', error);
        throw error;
      }
    },
    
    getSimulationStats: async () => {
      try {
        let stats;
        if (aiSystem?.services?.simulation) {
          stats = await aiSystem.services.simulation.getStats();
        } else {
          const result = await apiClient.getSimulationStats();
          stats = result.success ? result.data : null;
        }
        
        if (stats) {
          setStatus(prev => ({
            ...prev,
            simulation: {
              ...prev.simulation,
              ...stats
            }
          }));
        }
        
        return stats;
      } catch (error) {
        console.error('Failed to get simulation stats:', error);
        return null;
      }
    },
    
    // Data Generation
    generateFakeDonorData: async (options = {}) => {
      if (aiSystem?.services?.dataGenerator) {
        return await aiSystem.services.dataGenerator.generateFakeDonorData(options);
      }
      return apiClient.generateFakeDonorData(options);
    },
    
    generateSimulationData: async (options = {}) => {
      try {
        const data = await apiClient.generateDonorData(
          localStorage.getItem('currentOrgId') || 'default-org',
          options
        );
        
        if (data.success) {
          emitSimulationEvent({
            type: 'data_generated',
            data: data.data,
            timestamp: new Date().toISOString()
          });
        }
        
        return data;
      } catch (error) {
        console.error('Failed to generate simulation data:', error);
        throw error;
      }
    },
    
    // Donor Simulation
    simulateDonor: async (donorId, scenario) => {
      if (aiSystem?.services?.simulation) {
        return await aiSystem.services.simulation.simulateDonor(donorId, scenario);
      }
      return apiClient.simulateDonor(donorId, scenario);
    },
    
    // Bonding Features
    startRoleplay: async (donorId, context) => {
      if (aiSystem?.services?.roleplay) {
        return await aiSystem.services.roleplay.startSession(donorId, context);
      }
      return apiClient.startDonorRoleplay(donorId, context);
    },
    
    askDonor: async (donorId, question) => {
      if (aiSystem?.services?.bonding) {
        return await aiSystem.services.bonding.processMessage(donorId, question);
      }
      return apiClient.askDonor(donorId, question);
    },
    
    getDonorPersona: async (donorId) => {
      if (aiSystem?.services?.bonding) {
        return await aiSystem.services.bonding.getDonorPersona(donorId);
      }
      
      // Fallback implementation
      return {
        id: donorId,
        name: 'Donor',
        traits: ['generous', 'engaged'],
        communicationStyle: 'neutral',
        description: 'AI-generated donor persona'
      };
    },
    
    startBondingSession: async (donorId) => {
      try {
        // Get donor data first
        const donorData = await apiClient.getDonorSummary(donorId);
        if (donorData.success) {
          return await aiSystem?.services?.bonding?.startSession(donorId, donorData.data) || 
                 { success: false, error: 'Bonding service not available' };
        }
        throw new Error('Failed to fetch donor data');
      } catch (error) {
        console.error('Failed to start bonding session:', error);
        throw error;
      }
    },
    
    // New: Prediction and Recommendation methods
    getPredictions: async (timeframe = 'next_quarter') => {
      try {
        const orgId = localStorage.getItem('currentOrgId') || 'default-org';
        const result = await apiClient.getPredictions(timeframe, orgId);
        
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error || 'Failed to get predictions');
        }
      } catch (error) {
        console.error('Failed to get predictions:', error);
        throw error;
      }
    },
    
    getRecommendations: async (limit = 5) => {
      try {
        const orgId = localStorage.getItem('currentOrgId') || 'default-org';
        const result = await apiClient.getRecommendations(orgId, limit);
        
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error || 'Failed to get recommendations');
        }
      } catch (error) {
        console.error('Failed to get recommendations:', error);
        throw error;
      }
    },
    
    // Event System
    onSimulationEvent,
    offSimulationEvent,
    emitSimulationEvent,
    
    // Data Management
    refreshData: async () => {
      const orgId = localStorage.getItem('currentOrgId') || 'default-org';
      try {
        const data = await apiClient.getAIData(orgId);
        if (data.success) {
          setStatus(prev => ({
            ...prev,
            lastUpdate: new Date().toISOString(),
            dataSummary: data.data.summary
          }));
          return data;
        }
      } catch (error) {
        console.error('Refresh failed:', error);
        throw error;
      }
    },
    
    // Batch operations
    getBatchInsights: async (operations) => {
      return apiClient.getBatchData(operations);
    },
    
    // Get simulated activities
    getSimulatedActivities: async (limit = 20) => {
      try {
        const result = await apiClient.getSimulatedActivities(limit);
        return result.success ? result.data : [];
      } catch (error) {
        console.error('Failed to get simulated activities:', error);
        return [];
      }
    },
    
    // Quick simulation actions
    quickSimulate: async (type = 'donation') => {
      try {
        const orgId = localStorage.getItem('currentOrgId') || 'default-org';
        const result = await apiClient.fetchData('quickSimulate', { orgId, type }, { usePost: true });
        
        if (result.success && result.data) {
          // Emit the simulated activity
          emitSimulationEvent({
            type: result.data.type,
            data: result.data,
            timestamp: new Date().toISOString()
          });
        }
        
        return result;
      } catch (error) {
        console.error('Quick simulate failed:', error);
        return { success: false, error: error.message };
      }
    }
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
}

// Export the API client for direct use if needed
export { AIDataClient };