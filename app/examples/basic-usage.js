/**
 * Example of using the Donor AI System with your donorDataContext
 */
import { AIGateway } from '../ai/index.js';
import donorDataContext from '../../lib/donordatacontext.js';

async function runExample() {
  // 1. Initialize AI system
  const aiSystem = new AIGateway(donorDataContext, {
    simulationEnabled: true,
    bondingEnabled: true
  });
  
  // 2. Initialize with organization data
  await aiSystem.initialize('org_123');
  
  // 3. Check system status
  const status = aiSystem.getStatus();
  console.log('AI System Status:', status);
  
  // 4. Start simulation
  if (status.simulation.enabled) {
    await aiSystem.services.simulation.start({
      donorLimit: 20,
      speed: 'normal'
    });

    console.log('Simulation started');
  }
  
  // 5. Start bonding session with a donor
  if (status.bonding.enabled) {
    const session = await aiSystem.services.bonding.startSession('donor_456');
    console.log('Bonding session started:', session);
    
    // Simulate conversation
    const response = await aiSystem.bonding.processMessage(
      'donor_456',
      'Hi, how is my donation being used?'
    );
    console.log('AI Response:', response);
  }
  
  // 6. Export data
  const exportData = await aiSystem.exportData('org_123');
  console.log('Exported data overview:', {
    donorCount: exportData.donors.length,
    simulationCount: exportData.simulations.length
  });
}

// Handle errors
runExample().catch(console.error);
