// In your AIGateway.js or wherever your AIGateway class is defined
class AIGateway {
  constructor(dataContext, config = {}) {
    this.dataContext = dataContext;
    this.config = config;
    this.simulationService = null;
    this.bondingService = null;
    
    // Initialize services
    this.services = {
      simulation: {
        start: async (params) => await this.startSimulation(params),
        stop: async () => await this.stopSimulation(),
        pause: async () => await this.pauseSimulation(),
        getStats: async () => await this.getSimulationStats(),
        getStatus: () => this.getSimulationStatus(),
        isRunning: () => this.simulationStatus === 'RUNNING'
      },
      bonding: {
        // Add bonding methods here if needed
        startRoleplay: async (params) => await this.startRoleplay(params),
        askDonor: async (params) => await this.askDonor(params)
      }
    };
    
    this.simulationStatus = 'STOPPED';
    this.simulationData = null;
  }

  async initialize(organizationId, data) {
    this.organizationId = organizationId;
    this.initialized = true;
    
    // Initialize simulation service with data
    this.simulationService = {
      start: async (params) => await this.startSimulation(params),
      stop: async () => await this.stopSimulation(),
      pause: async () => await this.pauseSimulation(),
      getStats: async () => await this.getSimulationStats(),
      // Add other simulation methods...
    };
    
    // Ensure services.simulation points to the simulationService
    this.services.simulation = this.simulationService;
    
    return { success: true, message: 'AIGateway initialized' };
  }

  // Simulation methods
  async startSimulation(params = {}) {

    if (!this.initialized) {
    throw new Error('AIGateway must be initialized before starting simulation');
  }
  
    try {
      console.log('Starting simulation with params:', params);
      
      // Call your API endpoint
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': this.organizationId || 'default-org'
        },
        body: JSON.stringify({
          method: 'startSimulation',
          params: {
            donorLimit: params.donorLimit || 20,
            speed: params.speed || 'normal',
            activityTypes: params.activityTypes || ['donations', 'communications'],
            ...params
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.simulationStatus = 'RUNNING';
        this.simulationData = data.data;
        return {
          success: true,
          status: 'RUNNING',
          message: 'Simulation started successfully',
          data: data.data
        };
      } else {
        throw new Error(data.error || 'Failed to start simulation');
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async stopSimulation() {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': this.organizationId || 'default-org'
        },
        body: JSON.stringify({
          method: 'stopSimulation',
          params: {}
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.simulationStatus = 'STOPPED';
        return {
          success: true,
          status: 'STOPPED',
          message: 'Simulation stopped successfully'
        };
      } else {
        throw new Error(data.error || 'Failed to stop simulation');
      }
    } catch (error) {
      console.error('Error stopping simulation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async pauseSimulation() {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': this.organizationId || 'default-org'
        },
        body: JSON.stringify({
          method: 'pauseSimulation',
          params: {}
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.simulationStatus = 'PAUSED';
        return {
          success: true,
          status: 'PAUSED',
          message: 'Simulation paused successfully'
        };
      } else {
        throw new Error(data.error || 'Failed to pause simulation');
      }
    } catch (error) {
      console.error('Error pausing simulation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getSimulationStats() {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': this.organizationId || 'default-org'
        },
        body: JSON.stringify({
          method: 'getSimulationStats',
          params: {}
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          stats: data.data,
          status: this.simulationStatus
        };
      } else {
        throw new Error(data.error || 'Failed to get simulation stats');
      }
    } catch (error) {
      console.error('Error getting simulation stats:', error);
      // Return default stats if API fails
      return {
        success: true,
        stats: {
          activeDonors: 0,
          totalDonations: 0,
          totalActivities: 0,
          speed: 'normal',
          status: this.simulationStatus,
          startedAt: null
        }
      };
    }
  }

  getSimulationStatus() {
    return {
      status: this.simulationStatus,
      initialized: this.initialized || false,
      organizationId: this.organizationId,
      lastUpdate: new Date().toISOString()
    };
  }

  // Add a generic getStatus method for compatibility
  async getStatus() {
    return {
      initialized: this.initialized || false,
      simulation: {
        enabled: !!this.config.simulationEnabled,
        status: this.simulationStatus,
        running: this.simulationStatus === 'RUNNING'
      },
      organizationId: this.organizationId,
      lastUpdate: new Date().toISOString()
    };
  }
}

export default AIGateway;