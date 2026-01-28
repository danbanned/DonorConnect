// app/api/simulation/route.js
import { NextResponse } from 'next/server';
import donorDataContext from '../../../lib/donordatacontext';
import prisma from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = request.headers.get('x-org-id') || searchParams.get('orgId') || 'default-org';
    
    // Check if simulation is running for this org
    const simulation = await prisma.simulationState.findUnique({
      where: { organizationId: orgId }
    });
    
    if (!simulation) {
      return NextResponse.json({
        isRunning: false,
        lastRun: null,
        totalDonorsSimulated: 0,
        totalActivities: 0
      });
    }
    
    return NextResponse.json({
      isRunning: simulation.isRunning,
      lastRun: simulation.lastRun,
      totalDonorsSimulated: simulation.totalDonors,
      totalActivities: simulation.totalActivities,
      progress: simulation.progress,
      elapsedTime: simulation.elapsedTime
    });
    
  } catch (error) {
    console.error('Simulation GET error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, donorId, orgId, settings } = body;
    
    switch (action) {
      case 'start':
        return await startSimulation(orgId, donorId, settings);
      case 'stop':
        return await stopSimulation(orgId);
      case 'pause':
        return await pauseSimulation(orgId);
      case 'resume':
        return await resumeSimulation(orgId);
      case 'status':
        return await getSimulationStatus(orgId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Simulation POST error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function startSimulation(orgId, donorId = null, settings = {}) {
  try {
    // Create or update simulation state
    await prisma.simulationState.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        isRunning: true,
        startedAt: new Date(),
        progress: 0,
        settings: settings,
        ...(donorId && { targetDonorId: donorId })
      },
      update: {
        isRunning: true,
        startedAt: new Date(),
        progress: 0,
        settings: settings,
        ...(donorId && { targetDonorId: donorId })
      }
    });
    
    // If specific donor is targeted, get donor data
    let donorData = null;
    if (donorId) {
      donorData = await donorDataContext.Donor.findUnique({
        where: { id: donorId }
      });
    }
    
    // Log simulation start
    await prisma.activityFeed.create({
      data: {
        organizationId: orgId,
        type: 'SIMULATION',
        action: 'START',
        description: donorId 
          ? `Started simulation for donor ${donorData?.firstName} ${donorData?.lastName}`
          : 'Started organization-wide simulation',
        userId: 'system',
        metadata: { settings }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: donorId ? 'Donor simulation started' : 'Simulation started',
      simulationId: `sim_${Date.now()}`,
      startedAt: new Date().toISOString(),
      donor: donorData ? {
        id: donorData.id,
        name: `${donorData.firstName} ${donorData.lastName}`
      } : null
    });
    
  } catch (error) {
    throw new Error(`Failed to start simulation: ${error.message}`);
  }
}

async function stopSimulation(orgId) {
  try {
    const simulation = await prisma.simulationState.findUnique({
      where: { organizationId: orgId }
    });
    
    if (!simulation || !simulation.isRunning) {
      return NextResponse.json({
        success: false,
        message: 'No active simulation found'
      });
    }
    
    // Update simulation state
    await prisma.simulationState.update({
      where: { organizationId: orgId },
      data: {
        isRunning: false,
        endedAt: new Date(),
        elapsedTime: Math.floor((new Date() - simulation.startedAt) / 1000)
      }
    });
    
    // Log simulation stop
    await prisma.activityFeed.create({
      data: {
        organizationId: orgId,
        type: 'SIMULATION',
        action: 'STOP',
        description: 'Simulation stopped',
        userId: 'system'
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Simulation stopped',
      stoppedAt: new Date().toISOString()
    });
    
  } catch (error) {
    throw new Error(`Failed to stop simulation: ${error.message}`);
  }
}

async function pauseSimulation(orgId) {
  try {
    const simulation = await prisma.simulationState.findUnique({
      where: { organizationId: orgId }
    });
    
    if (!simulation || !simulation.isRunning) {
      return NextResponse.json({
        success: false,
        message: 'No active simulation found'
      });
    }
    
    await prisma.simulationState.update({
      where: { organizationId: orgId },
      data: {
        isRunning: false,
        isPaused: true,
        pausedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Simulation paused',
      pausedAt: new Date().toISOString()
    });
    
  } catch (error) {
    throw new Error(`Failed to pause simulation: ${error.message}`);
  }
}

async function resumeSimulation(orgId) {
  try {
    const simulation = await prisma.simulationState.findUnique({
      where: { organizationId: orgId }
    });
    
    if (!simulation || !simulation.isPaused) {
      return NextResponse.json({
        success: false,
        message: 'No paused simulation found'
      });
    }
    
    await prisma.simulationState.update({
      where: { organizationId: orgId },
      data: {
        isRunning: true,
        isPaused: false,
        resumedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Simulation resumed',
      resumedAt: new Date().toISOString()
    });
    
  } catch (error) {
    throw new Error(`Failed to resume simulation: ${error.message}`);
  }
}

async function getSimulationStatus(orgId) {
  try {
    const simulation = await prisma.simulationState.findUnique({
      where: { organizationId: orgId }
    });
    
    if (!simulation) {
      return {
        isRunning: false,
        isPaused: false,
        progress: 0,
        elapsedTime: 0
      };
    }
    
    let elapsedTime = simulation.elapsedTime || 0;
    if (simulation.isRunning && simulation.startedAt) {
      elapsedTime = Math.floor((new Date() - simulation.startedAt) / 1000);
    }
    
    return {
      isRunning: simulation.isRunning,
      isPaused: simulation.isPaused,
      progress: simulation.progress || 0,
      elapsedTime,
      startedAt: simulation.startedAt,
      settings: simulation.settings
    };
    
  } catch (error) {
    throw new Error(`Failed to get simulation status: ${error.message}`);
  }
}