// File: app/dashboard/AIDashboard.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '../../providers/AIProvider';

export default function AIDashboard() {
  const {
    isLoading,
    status,
    startChatWithDonor,
    sendChatMessage,
    getChatSession,
    clearChat,
    generateDonors,
    generateDonation,
    deleteDonor,
    getDonors,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    getRecentActivities,
    getRecommendations,
    refreshData
  } = useAI();

  // State
  const [message, setMessage] = useState('');
  const [donors, setDonors] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatSession = getChatSession();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [donorsRes, activitiesRes, recsRes] = await Promise.all([
        getDonors(10),
        getRecentActivities(10),
        getRecommendations()
      ]);

      if (donorsRes.success) setDonors(donorsRes.data);
      if (activitiesRes.success) setActivities(activitiesRes.data);
      if (recsRes.success) setRecommendations(recsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatSession?.messages]);

  // Chat Functions
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim()) return;

    await sendChatMessage(message);
    setMessage('');
  };

  const handleStartDonorChat = async (donor) => {
    const result = await startChatWithDonor(donor.id);
    if (result.success) {
      setSelectedDonor(donor);
      setActiveTab('chat');
    }
  };

  // Donor Management
  const handleGenerateDonors = async () => {
    const result = await generateDonors(5);
    if (result.success) {
      await loadInitialData();
      await sendChatMessage(
        `I just generated ${result.data.length} new simulated donors. They're now available in your donor list.`,
        'system'
      );
    }
  };

  const handleGenerateDonation = async (donor) => {
    const result = await generateDonation(donor.id);
    if (result.success) {
      await loadInitialData();
      await sendChatMessage(
        `Generated a $${result.data.amount} donation from ${donor.firstName} ${donor.lastName}`,
        'system'
      );
    }
  };

  const handleDeleteDonor = async (donor) => {
    if (!confirm(`Delete ${donor.firstName} ${donor.lastName}?`)) return;
    
    const result = await deleteDonor(donor.id);
    if (result.success) {
      await loadInitialData();
      await sendChatMessage(
        `Deleted donor ${donor.firstName} ${donor.lastName}${donor.isSimulated ? ' (simulated)' : ''}`,
        'system'
      );
    }
  };

  // Simulation Control
  const handleStartSimulation = async () => {
    const result = await startSimulation({ donorCount: 50, interval: 5000 });
    if (result.success) {
      await sendChatMessage(
        `Started simulation with ${result.data.donorCount} donors. New activities will appear in real-time.`,
        'system'
      );
    }
  };

  const handleStopSimulation = async () => {
    const result = await stopSimulation();
    if (result.success) {
      await sendChatMessage('Stopped simulation.', 'system');
    }
  };

  const handleRefresh = async () => {
    await refreshData();
    await loadInitialData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Donor Assistant</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${status.simulation.isRunning ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-sm text-gray-600">
                {status.simulation.isRunning 
                  ? `Simulation running with ${status.simulation.donorCount} donors`
                  : 'Ready'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {status.donors.total} donors • {status.donors.active} active
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Donors */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800 mb-4">Donors</h2>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={handleGenerateDonors}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Generate 5 Donors
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={handleStartSimulation}
                  disabled={status.simulation.isRunning}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Start Sim
                </button>
                <button
                  onClick={handleStopSimulation}
                  disabled={!status.simulation.isRunning}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Stop Sim
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-2">
              {donors.map(donor => (
                <div
                  key={donor.id}
                  className={`p-3 rounded-lg border ${selectedDonor?.id === donor.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {donor.firstName} {donor.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {donor.status} • {donor.relationshipStage}
                      </div>
                    </div>
                    {donor.isSimulated && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        AI
                      </span>
                    )}
                  </div>
                  
                  {donor.donations && donor.donations.length > 0 && (
                    <div className="text-xs text-gray-500 mt-2">
                      Last: ${donor.donations[0].amount}
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleStartDonorChat(donor)}
                      className="flex-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => handleGenerateDonation(donor)}
                      className="flex-1 px-3 py-1 text-sm bg-green-100 hover:bg-green-200 rounded"
                    >
                      Donate
                    </button>
                    <button
                      onClick={() => handleDeleteDonor(donor)}
                      className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedDonor 
                    ? `Chatting with ${selectedDonor.firstName} ${selectedDonor.lastName}`
                    : 'AI Fundraising Assistant'}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedDonor 
                    ? `Simulated donor based on ${selectedDonor.isSimulated ? 'AI-generated' : 'real'} profile`
                    : 'Ask me anything about fundraising strategy'}
                </p>
              </div>
              
              {selectedDonor && (
                <button
                  onClick={() => {
                    setSelectedDonor(null);
                    clearChat();
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  End Chat
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {(!chatSession || chatSession.messages.length === 0) ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-600 mb-6">
                  Chat with AI or select a donor to simulate a conversation
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => sendChatMessage("How can I improve donor retention?")}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Improve donor retention
                  </button>
                  <button
                    onClick={() => sendChatMessage("Best practices for major gift asks?")}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Major gift strategies
                  </button>
                  <button
                    onClick={() => sendChatMessage("Plan a year-end campaign")}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Year-end campaign
                  </button>
                </div>
              </div>
            ) : (
              chatSession.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-blue-500' : 'bg-gray-100'
                      }`}>
                        {msg.role === 'user' ? '👤' : selectedDonor ? '👥' : '🤖'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">
                          {msg.role === 'user' ? 'You' : selectedDonor 
                            ? `${selectedDonor.firstName} ${selectedDonor.lastName}`
                            : 'AI Assistant'}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  selectedDonor 
                    ? `Message ${selectedDonor.firstName}...`
                    : "Ask about fundraising strategy..."
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Activities & Recommendations */}
        <div className="w-96 bg-white border-l overflow-y-auto">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('activities')}
                className={`flex-1 px-4 py-3 text-center ${activeTab === 'activities' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              >
                Activities
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex-1 px-4 py-3 text-center ${activeTab === 'recommendations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              >
                Recommendations
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'activities' ? (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Recent Activities</h3>
                <div className="space-y-3">
                  {activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent activities</p>
                  ) : (
                    activities.map(activity => (
                      <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 mt-2 rounded-full ${
                            activity.priority === 'HIGH' ? 'bg-red-500' :
                            activity.priority === 'NORMAL' ? 'bg-blue-500' : 'bg-gray-400'
                          }`}></div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{activity.title}</div>
                            <div className="text-xs text-gray-600">{activity.description}</div>
                            {activity.amount && (
                              <div className="text-xs font-medium text-green-600 mt-1">
                                ${activity.amount}
                              </div>
                            )}
                            {activity.donor && (
                              <div className="text-xs text-gray-500 mt-1">
                                {activity.donor.firstName} {activity.donor.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">AI Recommendations</h3>
                <div className="space-y-3">
                  {recommendations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recommendations yet</p>
                  ) : (
                    recommendations.map(rec => (
                      <div key={rec.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 mt-2 rounded-full ${
                            rec.priority === 'high' ? 'bg-red-500' :
                            rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{rec.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                            <div className="mt-3">
                              <button className="text-sm text-blue-600 hover:text-blue-800">
                                {rec.action} →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}