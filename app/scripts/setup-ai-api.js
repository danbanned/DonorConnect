// File: scripts/setup-ai-api.js
// This script helps set up your environment and test the API

const fs = require('fs');
const path = require('path');

// Create environment variables template
const envTemplate = `# AI Provider API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here  # Optional: for real AI responses
API_BASE_URL=http://localhost:3000/api/ai
SIMULATION_DATA_PATH=./data/simulations.json
MAX_DONORS_PER_SIMULATION=1000
SIMULATION_INTERVAL_MS=10000

# Optional: Database configuration (for persistent storage)
# DATABASE_URL=postgresql://user:password@localhost:5432/ai_donors
# REDIS_URL=redis://localhost:6379

# Security
API_SECRET_KEY=your-secure-api-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Features
ENABLE_REAL_AI_RESPONSES=true
ENABLE_PERSISTENT_STORAGE=false
ENABLE_WEBSOCKETS=false
`;

// Create necessary directories
const directories = [
  './data',
  './logs',
  './scripts'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Write .env.local file
fs.writeFileSync('.env.local', envTemplate);
console.log('Created .env.local template');

// Create a test script
const testScript = `// File: test-ai-api.js
// Test the AI API endpoints

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api/ai';

async function testAPI() {
  console.log('🧪 Testing AI Provider API...\\n');

  // 1. Health check
  console.log('1. Testing health endpoint:');
  const health = await fetch(\`\${API_BASE}?method=health\`);
  console.log('   Status:', health.status);
  console.log('   Response:', await health.json());

  // 2. Initialize AI
  console.log('\\n2. Initializing AI system:');
  const init = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'aiInitialize',
      params: { orgId: 'test-org-123' }
    })
  });
  console.log('   Response:', await init.json());

  // 3. Generate fake donors
  console.log('\\n3. Generating fake donor data:');
  const donors = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'generateFakeDonors',
      params: { count: 5 }
    })
  });
  console.log('   Response:', await donors.json());

  // 4. Start a simulation
  console.log('\\n4. Starting simulation:');
  const simulation = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'startSimulation',
      params: {
        orgId: 'test-org-123',
        options: {
          donorCount: 10,
          realTime: false
        }
      }
    })
  });
  console.log('   Response:', await simulation.json());

  // 5. Get recommendations
  console.log('\\n5. Getting recommendations:');
  const recs = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'recommendations',
      params: { orgId: 'test-org-123', limit: 3 }
    })
  });
  console.log('   Response:', await recs.json());

  console.log('\\n✅ All tests completed!');
}

testAPI().catch(console.error);
`;

fs.writeFileSync('./scripts/test-ai-api.js', testScript);
console.log('Created test script at ./scripts/test-ai-api.js');

console.log('\n✅ Setup complete!');
console.log('\nNext steps:');
console.log('1. Update .env.local with your OpenAI API key (optional)');
console.log('2. Run the API server: npm run dev or next dev');
console.log('3. Test the API: node ./scripts/test-ai-api.js');
console.log('\nYour AI Provider is ready at: http://localhost:3000/api/ai');