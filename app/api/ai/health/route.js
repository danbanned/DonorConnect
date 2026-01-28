// app/api/ai/health/route.js - Health check endpoint
import { NextResponse } from 'next/server'

export async function GET(req) {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI API',
    version: '1.0.0'
  })
}