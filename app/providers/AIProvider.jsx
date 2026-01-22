// app/providers/AIProvider.jsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AIContext = createContext(null);

// API Client with unified endpoint
class AIDataClient {
 // In the AIDataClient class, add:
async generateFakeDonorData(options = {}) {
  return this.fetchData('generateFakeDonorData', options, { usePost: true });
}
  constructor(baseUrl = '/api/ai') {
    this.baseUrl = baseUrl;
    
  }

  async fetchData(method, params = {}, options = {}) {
    const { usePost = false, headers = {} } = options;
    
    try {
      if (usePost) {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({ method, params })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } else {
        // Build query string for GET
        const queryParams = new URLSearchParams();
        queryParams.append('method', method);
        
        Object.entries(params).forEach(([key, value]) => {
          if (typeof value === 'object') {
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, value);
          }
        });
        
        const url = `${this.baseUrl}?${queryParams.toString()}`;
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error(`API Error (${method}):`, error);
      throw error;
    }
  }

  // Specific methods for common operations
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
    return this.fetchData('donorSummary', { donorId });
  }

  async getDonationStats(orgId, filters = {}) {
    return this.fetchData('donationStats', { orgId, filters });
  }

  async getBatchData(operations) {
    return this.fetchData('batch', { operations }, { usePost: true });
  }
}

export function AIProvider({ children }) {
  const [aiSystem, setAiSystem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState({
    simulation: { isRunning: false },
    bonding: { activeSessions: 0 },
    initialized: false,
    lastUpdate: null
  });
  const [apiClient] = useState(() => new AIDataClient());

  useEffect(() => {
    const initializeAI = async () => {
      try {
        setIsLoading(true);
        console.log('🤖 Starting AI initialization...');
    
        
        // Dynamically import AI system
        const { AIGateway } = await import('../ai/index.js');
        console.log('✅ AI Gateway imported');
        
        // Create API-aware AI system
        const system = new AIGateway(apiClient, {
          simulationEnabled: true,
          bondingEnabled: true,
          environment: process.env.NODE_ENV
        });
        console.log('✅ AI system created');
        
        // Get organization ID
        const organizationId = localStorage.getItem('currentOrgId') || 
                              sessionStorage.getItem('currentOrgId') || 
                              'default-org';
                              console.log('📋 Organization ID:', organizationId);
        
        // Initialize with batch data
        const initData = await apiClient.getAIData(organizationId);
        console.log('📦 API Response:', initData);
        
        if (initData.success) {
          await system.initialize(organizationId, initData.data);
          setAiSystem(system);
          setStatus(prev => ({
            ...prev,
            initialized: true,
            lastUpdate: new Date().toISOString(),
            dataSummary: initData.data.summary
          }));
          console.log('✅ AI System initialized with data:', initData.data);
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
      if (aiSystem) {
        aiSystem.stopSimulation();
      }
    };
  }, [apiClient]);

  // Update status periodically
  useEffect(() => {
    if (!aiSystem || !status.initialized) return;
    
    const interval = setInterval(async () => {
      try {
        // Refresh data periodically
        const orgId = localStorage.getItem('currentOrgId') || 'default-org';
        const activity = await apiClient.fetchData('organizationActivity', { 
          orgId, 
          limit: 5 
        });
        
        if (activity.success) {
          setStatus(prev => ({
            ...prev,
            lastUpdate: new Date().toISOString(),
            recentActivity: activity.data
          }));
        }
        
        // Also get AI system status
        const aiStatus = aiSystem.getStatus();
        setStatus(prev => ({ ...prev, ...aiStatus }));
        
      } catch (error) {
        console.warn('Background update failed:', error);
      }
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [aiSystem, status.initialized, apiClient]);

  const value = {
    aiSystem,
    isLoading,
    status,
    apiClient,

    generateFakeDonorData: async (options = {}) => {
        if (aiSystem?.services?.dataGenerator) {
            return await aiSystem.services.dataGenerator.generateFakeDonorData(options);
        }
        // Fallback to direct API call
        return apiClient.generateFakeDonorData(options);
        },

    // Add to the AIProvider value object:
    simulateDonor: async (donorId, scenario) => {
        if (aiSystem?.services?.simulation) {
            return await aiSystem.services.simulation.simulateDonor(donorId, scenario);
        }
        return null;
        },

        generateExampleData: async (orgId, options = {}) => {
        if (aiSystem?.services?.dataGenerator) {
            return await aiSystem.services.dataGenerator.generateDonorData(orgId, options);
        }
        return null;
        },

        startRoleplay: async (donorId, context) => {
        if (aiSystem?.services?.roleplay) {
            return await aiSystem.services.roleplay.startSession(donorId, context);
        }
        return null;
        },

        getDonorPersona: async (donorId) => {
        if (aiSystem) {
            return await aiSystem.getDonorPersona(donorId);
        }
        return null;
        },
    
    // Helper methods
    startSimulation: async (orgId) => {
      if (aiSystem) {
        // Get simulation data first
        const simData = await apiClient.getSimulationData(orgId, {
          donorLimit: 100,
          donationLimit: 200,
          activityLimit: 150
        });
        
        if (simData.success) {
          const result = await aiSystem.services.simulation.start(orgId, simData.data);
          setStatus(prev => ({ ...prev, ...aiSystem.getStatus() }));
          return result;
        }
      }
    },
    
    stopSimulation: async () => {
      if (aiSystem) {
        const result = await aiSystem.services.simulation.stop();
        setStatus(prev => ({ ...prev, ...aiSystem.getStatus() }));
        return result;
      }
    },
    
    startBondingSession: async (donorId) => {
      if (aiSystem) {
        // Get donor data first
        const donorData = await apiClient.getDonorSummary(donorId);
        if (donorData.success) {
          return await aiSystem.services.bonding.startSession(donorId, donorData.data);
        }
        throw new Error('Failed to fetch donor data');
      }
    },
    
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