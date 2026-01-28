// hooks/useDonorSimulation.js
import { useState, useEffect } from 'react';

export const useDonorSimulation = (aiSystem, organizationId, donorId = null) => {
  const [simulation, setSimulation] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (aiSystem && organizationId) {
      // Initialize simulation
      checkStatus();
    }
  }, [aiSystem, organizationId, donorId]);
  
  const checkStatus = async () => {
    try {
      const status = await aiSystem.getSimulationStatus?.({
        organizationId,
        donorId
      });
      
      if (status) {
        setSimulation(status);
        setIsRunning(status.isRunning);
        setProgress(status.progress || 0);
      }
    } catch (error) {
      console.error('Error checking simulation status:', error);
    }
  };
  
  const startSimulation = async (settings = {}) => {
    try {
      setError(null);
      
      const result = await aiSystem.startSimulation?.({
        organizationId,
        donorId,
        ...settings
      });
      
      if (result?.success) {
        setIsRunning(true);
        setProgress(0);
        setSimulation(result.data);
        
        // Start polling for updates
        const interval = setInterval(() => {
          updateProgress();
        }, 2000);
        
        return () => clearInterval(interval);
      }
    } catch (error) {
      setError(error.message);
      console.error('Failed to start simulation:', error);
    }
  };
  
  const stopSimulation = async () => {
    try {
      await aiSystem.stopSimulation?.({
        organizationId,
        donorId
      });
      
      setIsRunning(false);
      setProgress(100);
    } catch (error) {
      setError(error.message);
      console.error('Failed to stop simulation:', error);
    }
  };
  
  const pauseSimulation = async () => {
    try {
      await aiSystem.pauseSimulation?.({
        organizationId,
        donorId
      });
      
      setIsRunning(false);
    } catch (error) {
      setError(error.message);
      console.error('Failed to pause simulation:', error);
    }
  };
  
  const updateProgress = async () => {
    if (!isRunning) return;
    
    try {
      const status = await aiSystem.getSimulationStatus?.({
        organizationId,
        donorId
      });
      
      if (status) {
        setProgress(status.progress || 0);
        if (status.progress >= 100 || !status.isRunning) {
          setIsRunning(false);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };
  
  return { 
    simulation, 
    isRunning, 
    progress, 
    error, 
    startSimulation, 
    stopSimulation, 
    pauseSimulation,
    updateProgress 
  };
};