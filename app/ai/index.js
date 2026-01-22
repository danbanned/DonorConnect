// app/ai/index.js - Create or update this file
export class AIGateway {
  constructor(apiClient, options = {}) {
    this.apiClient = apiClient;
    this.services = {
      simulation: new SimulationService(this),
      dataGenerator: new DataGeneratorService(this),
      roleplay: new RoleplayService(this),
    };
  }

  async initialize(orgId, data) {
    // Initialize AI services
    return { success: true };
  }

  getStatus() {
    return {
      simulation: { isRunning: false },
      bonding: { activeSessions: 0 },
      initialized: true,
    };
  }
}

class DataGeneratorService {
  constructor(gateway) {
    this.gateway = gateway;
  }

  async generateFakeDonorData(options = {}) {
    // Use OpenAI to generate realistic donor data
    const prompt = `Generate realistic fake donor data for a nonprofit organization. 
    Return a JSON object with EXACTLY these fields:
    {
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string in format (555) 555-5555",
      "address": "string",
      "city": "string",
      "state": "string (2 letter code)",
      "zipCode": "string",
      "interests": ["string", "string"],
      "preferredCommunication": "email/phone/mail/ANY",
      "notes": "string",
      "tags": ["string", "string"]
    }
    
    Requirements:
    - Use realistic American names
    - Use realistic addresses and cities
    - Email should match the name
    - Phone number should be valid format
    - Choose 2-4 interests from: Education, Arts, Healthcare, Environment, Youth Programs, Community Development, Scholarships, Technology
    - Choose 1-2 tags from: Major Donor, Recurring, Volunteer, Board Member, Alumni, Parent, Community Partner
    - Notes should be a short realistic background (1-2 sentences)
    - preferredCommunication should be one of: email, phone, mail, ANY
    
    Make the data diverse and realistic for a nonprofit donor database.`;
    
    try {
      // Use OpenAI API directly
      const response = await fetch('/api/openai/generate-donor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback to local generation if OpenAI fails
      return this.generateFallbackDonorData();
    }
  }

  generateFallbackDonorData() {
    // Fallback data generation without AI
    const firstNames = [
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 
      'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara',
      'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah',
      'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa'
    ];
    
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
      'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
      'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore',
      'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
    ];
    
    const citiesStates = [
      { city: 'New York', state: 'NY' },
      { city: 'Los Angeles', state: 'CA' },
      { city: 'Chicago', state: 'IL' },
      { city: 'Houston', state: 'TX' },
      { city: 'Phoenix', state: 'AZ' },
      { city: 'Philadelphia', state: 'PA' },
      { city: 'San Antonio', state: 'TX' },
      { city: 'San Diego', state: 'CA' },
      { city: 'Dallas', state: 'TX' },
      { city: 'San Jose', state: 'CA' }
    ];
    
    const streets = [
      'Main St', 'Oak Ave', 'Pine St', 'Maple Ave', 'Cedar Ln',
      'Elm St', 'Washington St', 'Lake St', 'Hill St', 'Park Ave'
    ];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const location = citiesStates[Math.floor(Math.random() * citiesStates.length)];
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    
    const interestsOptions = ['Education', 'Arts', 'Healthcare', 'Environment', 'Youth Programs', 'Community Development', 'Scholarships', 'Technology'];
    const tagsOptions = ['Major Donor', 'Recurring', 'Volunteer', 'Board Member', 'Alumni', 'Parent', 'Community Partner'];
    
    // Randomly select 2-4 interests
    const interests = [];
    const numInterests = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numInterests; i++) {
      const interest = interestsOptions[Math.floor(Math.random() * interestsOptions.length)];
      if (!interests.includes(interest)) {
        interests.push(interest);
      }
    }
    
    // Randomly select 1-2 tags
    const tags = [];
    const numTags = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numTags; i++) {
      const tag = tagsOptions[Math.floor(Math.random() * tagsOptions.length)];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    const communicationOptions = ['email', 'phone', 'mail', 'ANY'];
    
    return {
      success: true,
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `${streetNumber} ${street}`,
        city: location.city,
        state: location.state,
        zipCode: Math.floor(Math.random() * 90000) + 10000,
        interests,
        preferredCommunication: communicationOptions[Math.floor(Math.random() * communicationOptions.length)],
        notes: `${firstName} ${lastName} is a community-minded individual interested in supporting local initiatives.`,
        tags
      }
    };
  }
}

class SimulationService {
  constructor(gateway) {
    this.gateway = gateway;
  }

  async simulateDonor(donorId, scenario) {
    return { success: true, data: { response: "Simulation response" } };
  }

  start(orgId, data) {
    return { success: true };
  }

  stop() {
    return { success: true };
  }
}

class RoleplayService {
  constructor(gateway) {
    this.gateway = gateway;
  }

  startSession(donorId, context) {
    return { success: true, sessionId: 'test-session' };
  }
}