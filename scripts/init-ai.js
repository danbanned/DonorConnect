#!/usr/bin/env node

import { AIGateway } from '../ai/index.js';
import donorDataContext from '../lib/donorDataContext.js';
import config from '../config/index.js';

async function initializeAISystem() {
  console.log('🚀 Initializing Donor AI System...');
  
  try {
    // Initialize AI Gateway with your donorDataContext
    const aiSystem = new AIGateway(donorDataContext, {
      simulationEnabled: config.ai.simulationEnabled,
      bondingEnabled: config.ai.bondingEnabled,
      useRealData: !config.data.useMockData
    });
    
    // Export for global use
    global.donorAI = aiSystem;
    
    console.log('✅ AI System initialized successfully');
    console.log('Configuration:', {
      environment: process.env.NODE_ENV,
      simulationEnabled: config.ai.simulationEnabled,
      bondingEnabled: config.ai.bondingEnabled
    });
    
    return aiSystem;
  } catch (error) {
    console.error('❌ Failed to initialize AI system:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeAISystem();
}

export { initializeAISystem };
