// app/api/roleplay/route.js
import { NextResponse } from 'next/server';
import donorDataContext from '../../../lib/donordatacontext';

// Store active sessions in memory (in production, use Redis or database)
const activeSessions = new Map();

export async function POST(request) {
  try {
    const body = await request.json();
    const { method, params } = body;
    
    switch (method) {
      case 'startRoleplay':
        return await startRoleplay(params);
      case 'askDonor':
        return await askDonor(params);
      case 'endSession':
        return await endSession(params);
      case 'getSessions':
        return await getSessions(params);
      default:
        return NextResponse.json(
          { error: 'Unknown method' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Roleplay API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function startRoleplay(params) {
  const { donorId, context = {} } = params;
  
  if (!donorId) {
    return NextResponse.json(
      { error: 'Donor ID is required' },
      { status: 400 }
    );
  }
  
  // Get donor data
  const donor = await donorDataContext.Donor.findUnique({
    where: { id: donorId },
    include: {
      donations: {
        take: 5,
        orderBy: { date: 'desc' }
      },
      communications: {
        where: { direction: 'INCOMING' },
        take: 5,
        orderBy: { sentAt: 'desc' }
      },
      interests: {
        include: {
          interest: true
        }
      }
    }
  });
  
  if (!donor) {
    return NextResponse.json(
      { error: 'Donor not found' },
      { status: 404 }
    );
  }
  
  // Analyze donor persona
  const persona = analyzeDonorPersona(donor);
  
  // Create session
  const sessionId = `roleplay_${Date.now()}_${donorId}`;
  const session = {
    sessionId,
    donor: {
      id: donor.id,
      name: `${donor.firstName} ${donor.lastName}`,
      email: donor.email
    },
    persona,
    context,
    startedAt: new Date().toISOString(),
    messages: [],
    insights: {
      sentiment: 'NEUTRAL',
      topicsDiscussed: [],
      concernsRaised: false
    }
  };
  
  // Generate greeting based on persona and context
  const greeting = generateGreeting(persona, context);
  session.messages.push({
    id: 'greeting',
    content: greeting,
    sender: 'donor',
    timestamp: new Date().toISOString()
  });
  
  // Store session
  activeSessions.set(sessionId, session);
  
  // Clean up old sessions (keep only last 50)
  if (activeSessions.size > 50) {
    const oldestKey = Array.from(activeSessions.keys())[0];
    activeSessions.delete(oldestKey);
  }
  
  return NextResponse.json({
    success: true,
    data: session
  });
}

async function askDonor(params) {
  const { donorId, question, sessionId } = params;
  
  if (!question) {
    return NextResponse.json(
      { error: 'Question is required' },
      { status: 400 }
    );
  }
  
  // Get or create session
  let session;
  if (sessionId && activeSessions.has(sessionId)) {
    session = activeSessions.get(sessionId);
  } else if (donorId) {
    // Find session by donorId
    for (const [key, sess] of activeSessions.entries()) {
      if (sess.donor.id === donorId) {
        session = sess;
        break;
      }
    }
  }
  
  if (!session) {
    // Create a new session if none exists
    const newSession = await startRoleplay({ donorId });
    if (newSession.error) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }
    session = newSession.data;
  }
  
  // Analyze question for sentiment and keywords
  const analysis = analyzeQuestion(question);
  
  // Generate response based on donor persona and question
  const response = generateResponse(session.persona, question, analysis);
  
  // Update session
  session.messages.push({
    id: `msg_${Date.now()}`,
    content: question,
    sender: 'user',
    timestamp: new Date().toISOString()
  });
  
  session.messages.push({
    id: `resp_${Date.now()}`,
    content: response.text,
    sender: 'donor',
    timestamp: new Date().toISOString(),
    sentiment: response.sentiment
  });
  
  // Update insights
  session.insights.sentiment = response.sentiment;
  if (!session.insights.topicsDiscussed.includes(analysis.topic)) {
    session.insights.topicsDiscussed.push(analysis.topic);
  }
  if (response.sentiment === 'NEGATIVE') {
    session.insights.concernsRaised = true;
  }
  
  activeSessions.set(session.sessionId, session);
  
  return NextResponse.json({
    success: true,
    data: {
      response: response.text,
      question,
      respondedAt: new Date().toISOString(),
      sentiment: response.sentiment,
      followUpQuestions: response.followUpQuestions,
      sessionId: session.sessionId
    }
  });
}

async function endSession(params) {
  const { sessionId } = params;
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }
  
  if (!activeSessions.has(sessionId)) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }
  
  const session = activeSessions.get(sessionId);
  activeSessions.delete(sessionId);
  
  // Log session end (optional - could save to database)
  
  return NextResponse.json({
    success: true,
    message: 'Session ended',
    sessionSummary: {
      duration: Math.floor((new Date() - new Date(session.startedAt)) / 1000),
      messages: session.messages.length,
      sentiment: session.insights.sentiment,
      topicsDiscussed: session.insights.topicsDiscussed
    }
  });
}

async function getSessions(params) {
  const { donorId } = params;
  
  let sessions = Array.from(activeSessions.values());
  
  if (donorId) {
    sessions = sessions.filter(session => session.donor.id === donorId);
  }
  
  return NextResponse.json({
    success: true,
    data: {
      sessions,
      count: sessions.length
    }
  });
}

// Helper functions
function analyzeDonorPersona(donor) {
  const totalDonations = donor.donations.reduce((sum, d) => sum + d.amount, 0);
  const donationCount = donor.donations.length;
  
  let personaType = 'SUPPORTER';
  let traits = ['generous'];
  
  if (totalDonations > 10000) {
    personaType = 'MAJOR_DONOR';
    traits.push('philanthropic', 'influential');
  } else if (donationCount > 5) {
    personaType = 'LOYAL_SUPPORTER';
    traits.push('consistent', 'committed');
  }
  
  if (donor.interests.length > 0) {
    traits.push('interested', 'engaged');
  }
  
  const interests = donor.interests.map(i => i.interest.name);
  
  return {
    type: personaType,
    traits,
    communicationStyle: donationCount > 2 ? 'engaged' : 'reserved',
    givingPattern: donationCount > 1 ? 'regular' : 'occasional',
    interests,
    description: `${personaType.replace('_', ' ')} interested in ${interests.join(', ')}`
  };
}

function generateGreeting(persona, context) {
  const greetings = {
    SUPPORTER: "Hi there! Thanks for reaching out. I'm glad to connect.",
    MAJOR_DONOR: "Hello! It's great to hear from you. I've been following your organization's progress closely.",
    LOYAL_SUPPORTER: "Hi! Wonderful to connect. I always appreciate your updates."
  };
  
  const baseGreeting = greetings[persona.type] || "Hello! Thanks for getting in touch.";
  
  if (context.topic) {
    return `${baseGreeting} I'd love to discuss ${context.topic}.`;
  }
  
  if (persona.interests.length > 0) {
    return `${baseGreeting} I'm particularly interested in your work with ${persona.interests[0]}.`;
  }
  
  return baseGreeting;
}

function analyzeQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  
  let sentiment = 'NEUTRAL';
  let topic = 'general';
  
  // Check sentiment
  const positiveWords = ['great', 'amazing', 'wonderful', 'excited', 'happy', 'love'];
  const negativeWords = ['concerned', 'worried', 'disappointed', 'problem', 'issue'];
  
  if (positiveWords.some(word => lowerQuestion.includes(word))) {
    sentiment = 'POSITIVE';
  } else if (negativeWords.some(word => lowerQuestion.includes(word))) {
    sentiment = 'NEGATIVE';
  }
  
  // Identify topic
  if (lowerQuestion.includes('donation') || lowerQuestion.includes('give')) {
    topic = 'donations';
  } else if (lowerQuestion.includes('program') || lowerQuestion.includes('initiative')) {
    topic = 'programs';
  } else if (lowerQuestion.includes('impact') || lowerQuestion.includes('result')) {
    topic = 'impact';
  } else if (lowerQuestion.includes('future') || lowerQuestion.includes('plan')) {
    topic = 'future';
  }
  
  return { sentiment, topic };
}

function generateResponse(persona, question, analysis) {
  const responses = {
    SUPPORTER: {
      donations: "I believe in supporting causes that make a difference, which is why I donate.",
      programs: "The programs you run are really meaningful to me.",
      impact: "Seeing the real-world impact is what matters most to me.",
      future: "I'm excited about where the organization is headed.",
      general: "That's a great question! I appreciate you asking."
    },
    MAJOR_DONOR: {
      donations: "I see philanthropy as an investment in positive change.",
      programs: "I carefully consider which programs align with my values.",
      impact: "Measuring impact is crucial for effective philanthropy.",
      future: "I'm interested in long-term strategic partnerships.",
      general: "Thanks for asking. From my perspective..."
    },
    LOYAL_SUPPORTER: {
      donations: "I enjoy being a consistent supporter of your work.",
      programs: "I've been following your programs for years.",
      impact: "The cumulative impact over time is impressive.",
      future: "I plan to continue my support in the future.",
      general: "That's interesting. Based on my experience..."
    }
  };
  
  let text = responses[persona.type]?.[analysis.topic] || 
             responses[persona.type]?.general || 
             "Thanks for your question. I appreciate the conversation.";
  
  // Add personalized touch
  if (persona.interests.length > 0 && analysis.topic === 'programs') {
    text += ` I'm particularly drawn to your work in ${persona.interests[0]}.`;
  }
  
  // Adjust based on sentiment
  if (analysis.sentiment === 'NEGATIVE') {
    text = "I have some concerns about that. " + text;
  } else if (analysis.sentiment === 'POSITIVE') {
    text = "I'm really pleased to hear that! " + text;
  }
  
  // Generate follow-up questions
  const followUpQuestions = [
    "Could you tell me more about that?",
    "How can I help support that further?",
    "What are the next steps?"
  ];
  
  return {
    text,
    sentiment: analysis.sentiment,
    followUpQuestions
  };
}