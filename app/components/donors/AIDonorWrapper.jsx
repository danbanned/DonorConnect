// app/components/donors/AIDonorWrapper.jsx
'use client';

import { useAI } from '../../providers/AIProvider';
import { useState, useEffect } from 'react';

export function useAIDonorFeatures(donorId) {
  const { aiSystem, isLoading, simulateDonor, generateExampleData, startRoleplay, getDonorPersona } = useAI();
  const [donorPersona, setDonorPersona] = useState(null);
  const [roleplaySession, setRoleplaySession] = useState(null);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    if (donorId && aiSystem) {
      loadDonorPersona();
    }
  }, [donorId, aiSystem]);

  const loadDonorPersona = async () => {
    try {
      const persona = await getDonorPersona(donorId);
      setDonorPersona(persona);
      generateSuggestedQuestions(persona);
    } catch (error) {
      console.error('Failed to load donor persona:', error);
    }
  };

  const generateSuggestedQuestions = (persona) => {
    if (!persona) return;
    
    const questions = [
      "What inspired you to support our cause?",
      "How would you like to be involved beyond donations?",
      "What's the best way for us to keep you updated?",
      "Are there specific projects you're passionate about?",
      "How do you prefer we acknowledge your support?",
    ];
    
    // Add personalized questions based on donor type
    if (persona.donorType === 'MAJOR') {
      questions.push("Would you be interested in a tour of our facilities?");
      questions.push("How can we make your giving experience more meaningful?");
    }
    
    if (persona.interests?.length > 0) {
      questions.push(`I see you're interested in ${persona.interests[0]}. Would you like to hear more about our work in that area?`);
    }
    
    setSuggestedQuestions(questions);
  };

  const askDonorQuestion = async (question) => {
    if (!aiSystem) return null;
    
    const response = await aiSystem.askDonor(donorId, question);
    
    const newMessage = {
      question,
      response,
      timestamp: new Date(),
    };
    
    setConversationHistory(prev => [...prev, newMessage]);
    return response;
  };

  const generateExampleDonations = async (count = 5) => {
    setIsGeneratingData(true);
    try {
      const orgId = localStorage.getItem('currentOrgId') || 'default-org';
      const data = await generateExampleData(orgId, {
        donorId,
        count,
        includePledges: true,
        includeCommunications: true,
        includeNotes: true,
      });
      return data;
    } finally {
      setIsGeneratingData(false);
    }
  };

  const simulateDonorScenario = async (scenario) => {
    return await simulateDonor(donorId, scenario);
  };

  const startDonorRoleplay = async (context = {}) => {
    const session = await startRoleplay(donorId, {
      ...context,
      purpose: 'relationship_building',
      difficulty: 'realistic',
    });
    setRoleplaySession(session);
    return session;
  };

  const endRoleplay = () => {
    setRoleplaySession(null);
    setConversationHistory([]);
  };

  const getDonorInsights = async () => {
    if (!aiSystem) return null;
    
    const insights = await aiSystem.getDonorInsights(donorId, {
      includePredictions: true,
      includeSuggestions: true,
      includeRisks: true,
    });
    
    return insights;
  };

  const suggestNextAsk = async () => {
    if (!aiSystem) return null;
    
    const suggestion = await aiSystem.suggestNextAsk(donorId, {
      considerHistory: true,
      considerCapacity: true,
      considerTiming: true,
    });
    
    return suggestion;
  };

  return {
    donorPersona,
    roleplaySession,
    isGeneratingData,
    suggestedQuestions,
    conversationHistory,
    aiSystem,
    isLoading,
    
    // Actions
    askDonorQuestion,
    generateExampleDonations,
    simulateDonorScenario,
    startDonorRoleplay,
    endRoleplay,
    getDonorInsights,
    suggestNextAsk,
  };
}