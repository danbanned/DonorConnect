export default {
  ai: {
    simulationEnabled: true,
    bondingEnabled: true,
    realismLevel: 0.9,
    simulationInterval: 60000, // Slower for production
    debug: false,
    logActivities: false
  },
  data: {
    useMockData: false,
    maxDonors: 1000,
    cacheEnabled: true
  }
};
