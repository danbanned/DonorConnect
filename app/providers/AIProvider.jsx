'use client';
// File: app/providers/AIProvider.jsx

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ==================== API CLIENT ====================

// ✅ Fixed: Correct API path and added proper error handling
async function getSession() {
  try {
    const res = await fetch('/api/auth/session', {
      credentials: 'include',
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Session fetch failed:', res.status);
      return { user: null };
    }

    return await res.json();
  } catch (error) {
    console.error('Session fetch error:', error);
    return { user: null };
  }
}


class AIDataClient {
  constructor(baseUrl = '/api/ai') {
    this.baseUrl = baseUrl;
  }

  async fetchData(method, params = {}, options = {}) {
    const { usePost = false, headers = {} } = options;
    
    try {
      // First check if we have a valid session
      const session = await getSession();
      if (!session?.user) {
        // Clear any existing auth token
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
        return { success: false, error: 'Not authenticated', requiresAuth: true };
      }
      
      if (usePost) {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          credentials: 'include',
          body: JSON.stringify({ method, params })
        });

        if (response.status === 401) {
          // Clear auth token and redirect
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/login';
          return { success: false, error: 'Unauthorized', requiresAuth: true };
        }

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text}`);
        }
        
        return await response.json();
      } else {
        const queryParams = new URLSearchParams();
        queryParams.append('method', method);
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, JSON.stringify(value));
          }
        });
        
        const url = `${this.baseUrl}?${queryParams.toString()}`;
        const response = await fetch(url, { 
          headers,
          credentials: 'include'
        });

        if (response.status === 401) {
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/login';
          return { success: false, error: 'Unauthorized', requiresAuth: true };
        }
        
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text}`);
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error(`API Error (${method}):`, error);
      if (error.message.includes('Unauthorized') || error.message.includes('Not authenticated')) {
        return { success: false, error: error.message, requiresAuth: true };
      }
      return { success: false, error: error.message };
    }
  }

  // ... rest of your methods remain the same
  async sendMessage(message, context = {}) {
    return this.fetchData('sendMessage', { message, context }, { usePost: true });
  }

  async chatWithDonor(donorId, message) {
    return this.fetchData('chatWithDonor', { donorId, message }, { usePost: true });
  }

  async generateFakeDonors(count = 5, options = {}) {
    return this.fetchData('generateFakeDonors', { count, ...options }, { usePost: true });
  }

  async generateDonation(donorId, amount = null, campaign = 'General Fund') {
    return this.fetchData('generateDonation', { donorId, amount, campaign }, { usePost: true });
  }

  async deleteDonor(donorId) {
    return this.fetchData('deleteDonor', { donorId }, { usePost: true });
  }

  async startSimulationFlow(options = {}) {
    return this.fetchData('startSimulationFlow', options, { usePost: true });
  }

  async stopSimulation() {
    return this.fetchData('stopSimulation', {}, { usePost: true });
  }

  async getDonors(limit = 50, filters = {}) {
    return this.fetchData('getDonors', { limit, ...filters }, { usePost: true });
  }

  async getDonorDetails(donorId) {
    return this.fetchData('getDonorDetails', { donorId }, { usePost: true });
  }

  async getRecentActivities(limit = 20) {
    return this.fetchData('getRecentActivities', { limit }, { usePost: true });
  }

  async getRecommendations(limit = 5) {
    return this.fetchData('getRecommendations', { limit }, { usePost: true });
  }

  async checkHealth() {
    return this.fetchData('health', {}, { usePost: false });
  }
}

// ==================== CHAT ENGINE ====================
class ChatEngine {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.currentSession = null;
  }

  async initializeChat(sessionType = 'assistant', context = {}) {
    this.currentSession = {
      type: sessionType,
      context,
      messages: [],
      createdAt: new Date().toISOString()
    };
    return this.currentSession;
  }

  async sendMessage(message, sender = 'user') {
    if (!this.currentSession) {
      await this.initializeChat();
    }

    const userMessage = {
      role: sender,
      content: message,
      timestamp: new Date().toISOString()
    };

    this.currentSession.messages.push(userMessage);

    // Get AI response
    let aiResponse;
    if (this.currentSession.type === 'donor' && this.currentSession.context.donorId) {
      aiResponse = await this.apiClient.chatWithDonor(
        this.currentSession.context.donorId,
        message
      );
    } else {
      aiResponse = await this.apiClient.sendMessage(message, this.currentSession.context);
    }

    if (aiResponse.success) {
      const aiMessage = {
        role: 'ai',
        content: aiResponse.data.response,
        context: aiResponse.data,
        timestamp: new Date().toISOString()
      };

      this.currentSession.messages.push(aiMessage);
      return aiMessage;
    }

    return null;
  }

  getSession() {
    return this.currentSession;
  }

  clearSession() {
    this.currentSession = null;
  }
}

// ==================== SIMULATION ENGINE ====================
class SimulationEngine {
  constructor(apiClient, emitEvent) {
    this.apiClient = apiClient;
    this.emitEvent = emitEvent;
    this.isRunning = false;
    this.isPaused = false;
    this.interval = null;
    this.activeDonors = [];
    this.simulationId = null;
  }

  async start(options = {}) {
    if (this.isRunning) return { success: false, error: 'Simulation already running' };

    try {
      this.isRunning = true;
      this.isPaused = false;
      this.simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get existing donors or generate new ones
      const donorResponse = await this.apiClient.getDonors(options.donorCount || 50);
      if (donorResponse.success) {
        this.activeDonors = donorResponse.data;
      } else {
        // Generate fake donors
        const fakeResponse = await this.apiClient.generateFakeDonors(options.donorCount || 50);
        this.activeDonors = fakeResponse.success ? fakeResponse.data : [];
      }

      // Start simulation loop
      this.interval = setInterval(() => this.runCycle(), options.interval || 10000);

      this.emitEvent({
        type: 'simulation_started',
        data: {
          simulationId: this.simulationId,
          donorCount: this.activeDonors.length,
          options
        }
      });

      return {
        success: true,
        data: {
          simulationId: this.simulationId,
          donorCount: this.activeDonors.length,
          status: 'running'
        }
      };
    } catch (error) {
      this.isRunning = false;
      return { success: false, error: error.message };
    }
  }

  async runCycle() {
    if (!this.isRunning || this.isPaused || this.activeDonors.length === 0) return;

    const activityTypes = ['donation', 'communication', 'engagement', 'status_change'];
    const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const randomDonor = this.activeDonors[Math.floor(Math.random() * this.activeDonors.length)];

    try {
      let activity;
      switch (randomActivity) {
        case 'donation':
          const donation = await this.apiClient.generateDonation(
            randomDonor.id,
            Math.floor(Math.random() * 5000) + 100
          );
          if (donation.success) {
            activity = {
              type: 'donation',
              data: donation.data,
              donor: randomDonor
            };
          }
          break;

        case 'communication':
          activity = {
            type: 'communication',
            data: {
              donorId: randomDonor.id,
              donorName: `${randomDonor.firstName} ${randomDonor.lastName}`,
              method: ['email', 'phone_call'][Math.floor(Math.random() * 2)],
              direction: 'outbound',
              subject: 'Update from our organization',
              date: new Date().toISOString()
            },
            donor: randomDonor
          };
          break;

        case 'engagement':
          activity = {
            type: 'engagement',
            data: {
              donorId: randomDonor.id,
              donorName: `${randomDonor.firstName} ${randomDonor.lastName}`,
              activity: 'attended_event',
              date: new Date().toISOString()
            },
            donor: randomDonor
          };
          break;

        default:
          activity = {
            type: 'status_change',
            data: {
              donorId: randomDonor.id,
              donorName: `${randomDonor.firstName} ${randomDonor.lastName}`,
              newStatus: ['ACTIVE', 'LYBUNT', 'SYBUNT'][Math.floor(Math.random() * 3)],
              date: new Date().toISOString()
            },
            donor: randomDonor
          };
      }

      if (activity) {
        this.emitEvent({
          type: activity.type,
          data: activity.data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Simulation cycle error:', error);
    }
  }

  pause() {
    this.isPaused = true;
    clearInterval(this.interval);
    return { success: true };
  }

  resume() {
    if (!this.isRunning || !this.isPaused) {
      return { success: false, error: 'Not paused' };
    }
    this.isPaused = false;
    this.interval = setInterval(() => this.runCycle(), 10000);
    return { success: true };
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    clearInterval(this.interval);
    this.activeDonors = [];
    this.simulationId = null;
    return { success: true };
  }
}

// ==================== AI PROVIDER CONTEXT ====================
const AIContext = createContext(null);

export function AIProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const [status, setStatus] = useState({
    simulation: { isRunning: false, isPaused: false, donorCount: 0 },
    chat: { activeSession: null, messages: [] },
    donors: { total: 0, active: 0, simulated: 0 },
    lastUpdate: null,
    initialized: false
  });

  const [apiClient] = useState(() => new AIDataClient());
  const chatEngine = useRef(null);
  const simulationEngine = useRef(null);
  const router = useRouter();

  // ✅ Fixed: Check authentication on mount - more robust
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();

        if (session?.user) {
          setUser(session.user);
          setAuthError(null);
          console.log('Session valid for user:', session.user.email);
        } else {
          setUser(null);
          // If no user but we're not on login page, redirect
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setUser(null);
        setAuthError('Failed to verify authentication');
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkSession();
  }, [router]);

  // ✅ Fixed: Initialize engines only when user is authenticated
  useEffect(() => {
    if (!user || !isAuthChecked) return;

    console.log('Initializing AI engines for user:', user.email);
    
    chatEngine.current = new ChatEngine(apiClient);
    simulationEngine.current = new SimulationEngine(apiClient, emitEvent);
    
    // Initialize system data
    initializeSystem();

    return () => {
      if (simulationEngine.current) {
        simulationEngine.current.stop();
      }
    };
  }, [user, isAuthChecked]);

  const initializeSystem = async () => {
    try {
      setIsLoading(true);
      
      // Check if we're still authenticated
      const session = await getSession();
      if (!session?.user) {
        setAuthError('Session expired');
        setUser(null);
        return;
      }
      
      // Load initial data
      const [donorsResponse, activitiesResponse] = await Promise.all([
        apiClient.getDonors(10),
        apiClient.getRecentActivities(10)
      ]);
      
      if (donorsResponse.success) {
        setStatus(prev => ({
          ...prev,
          donors: {
            total: donorsResponse.data.length,
            active: donorsResponse.data.filter(d => d.status === 'ACTIVE').length,
            simulated: donorsResponse.data.filter(d => d.isSimulated).length
          }
        }));
      }

      setStatus(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        initialized: true
      }));
    } catch (error) {
      console.error('AI System initialization failed:', error);
      if (error.requiresAuth || error.message?.includes('Unauthorized')) {
        setAuthError('Authentication required. Please login.');
        setUser(null);
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const emitEvent = useCallback((eventData) => {
    // Update status based on event
    if (eventData.type === 'donation') {
      setStatus(prev => ({
        ...prev,
        donors: {
          ...prev.donors,
          active: prev.donors.active + 1
        }
      }));
    }
    
    // You can add more event handlers here
  }, []);

  // ============ CHAT METHODS ============
  const startChatWithDonor = async (donorId) => {
    try {
      const donorResponse = await apiClient.getDonorDetails(donorId);
      if (!donorResponse.success) {
        throw new Error('Donor not found');
      }

      await chatEngine.current.initializeChat('donor', {
        donorId,
        donor: donorResponse.data
      });

      const welcomeMessage = await chatEngine.current.sendMessage(
        `Hi, I'm ${donorResponse.data.firstName} ${donorResponse.data.lastName}. How can I help you today?`,
        'ai'
      );

      setStatus(prev => ({
        ...prev,
        chat: {
          activeSession: chatEngine.current.getSession(),
          messages: chatEngine.current.getSession()?.messages || []
        }
      }));

      return {
        success: true,
        data: chatEngine.current.getSession()
      };
    } catch (error) {
      console.error('Failed to start donor chat:', error);
      return { success: false, error: error.message };
    }
  };

  const sendChatMessage = async (message, sessionType = 'assistant') => {
    try {
      if (!chatEngine.current.getSession()) {
        await chatEngine.current.initializeChat(sessionType);
      }

      const response = await chatEngine.current.sendMessage(message);
      
      setStatus(prev => ({
        ...prev,
        chat: {
          ...prev.chat,
          messages: chatEngine.current.getSession()?.messages || []
        }
      }));

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: error.message };
    }
  };

  // ============ DONOR MANAGEMENT ============
  const generateDonors = async (count = 5, options = {}) => {
    try {
      const response = await apiClient.generateFakeDonors(count, options);
      if (response.success) {
        setStatus(prev => ({
          ...prev,
          donors: {
            total: prev.donors.total + response.data.length,
            active: prev.donors.active + response.data.length,
            simulated: prev.donors.simulated + response.data.length
          }
        }));
      }
      return response;
    } catch (error) {
      console.error('Failed to generate donors:', error);
      throw error;
    }
  };

  const generateDonation = async (donorId, amount = null, campaign = 'General Fund') => {
    try {
      const response = await apiClient.generateDonation(donorId, amount, campaign);
      if (response.success) {
        emitEvent({
          type: 'donation',
          data: response.data,
          timestamp: new Date().toISOString()
        });
      }
      return response;
    } catch (error) {
      console.error('Failed to generate donation:', error);
      throw error;
    }
  };

  const deleteDonor = async (donorId) => {
    try {
      const response = await apiClient.deleteDonor(donorId);
      if (response.success) {
        setStatus(prev => ({
          ...prev,
          donors: {
            total: prev.donors.total - 1,
            active: prev.donors.active - 1,
            simulated: prev.donors.simulated - (response.data.wasSimulated ? 1 : 0)
          }
        }));
      }
      return response;
    } catch (error) {
      console.error('Failed to delete donor:', error);
      throw error;
    }
  };

  // ============ SIMULATION CONTROL ============
  const startSimulation = async (options = {}) => {
    try {
      const response = await simulationEngine.current.start(options);
      if (response.success) {
        setStatus(prev => ({
          ...prev,
          simulation: {
            ...prev.simulation,
            isRunning: true,
            isPaused: false,
            donorCount: response.data.donorCount
          }
        }));
      }
      return response;
    } catch (error) {
      console.error('Failed to start simulation:', error);
      throw error;
    }
  };

  const pauseSimulation = async () => {
    const response = simulationEngine.current.pause();
    setStatus(prev => ({
      ...prev,
      simulation: {
        ...prev.simulation,
        isPaused: true,
        isRunning: false
      }
    }));
    return response;
  };

  const resumeSimulation = async () => {
    const response = simulationEngine.current.resume();
    setStatus(prev => ({
      ...prev,
      simulation: {
        ...prev.simulation,
        isPaused: false,
        isRunning: true
      }
    }));
    return response;
  };

  const stopSimulation = async () => {
    const response = simulationEngine.current.stop();
    setStatus(prev => ({
      ...prev,
      simulation: {
        isRunning: false,
        isPaused: false,
        donorCount: 0
      }
    }));
    return response;
  };

  // ============ DATA QUERIES ============
  const getDonors = async (limit = 50, filters = {}) => {
    return apiClient.getDonors(limit, filters);
  };

  const getRecentActivities = async (limit = 20) => {
    return apiClient.getRecentActivities(limit);
  };

  const getRecommendations = async (limit = 5) => {
    return apiClient.getRecommendations(limit);
  };

  const refreshData = async () => {
    await initializeSystem();
    return { success: true };
  };

  const logout = async () => {
    // Clear cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    router.push('/login');
  };

  const value = {
    // State
    isLoading,
    status,
    authError,
    user,
    isAuthChecked,
    
    // Chat
    startChatWithDonor,
    sendChatMessage,
    getChatSession: () => chatEngine.current?.getSession(),
    clearChat: () => {
      chatEngine.current?.clearSession();
      setStatus(prev => ({
        ...prev,
        chat: { activeSession: null, messages: [] }
      }));
    },

    // Donor Management
    generateDonors,
    generateDonation,
    deleteDonor,
    getDonors,
    
    // Simulation
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    
    // Data
    getRecentActivities,
    getRecommendations,
    refreshData,
    
    // Auth
    logout,
    
    // Direct API client
    apiClient
  };

  return (
    <AIContext.Provider value={value}>
      {!isAuthChecked ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Checking authentication...</div>
        </div>
      ) : children}
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