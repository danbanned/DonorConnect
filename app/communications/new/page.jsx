export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import React from 'react'
import CommunicationsNewClient from '../../components/communications/CommunicationsNewClient'

const JAVA_API = process.env.NEXT_PUBLIC_JAVA_API || 'http://localhost:8081'

export default async function Page() {
  let donors = []
  try {
    const res = await fetch(`${JAVA_API}/api/donors`, { cache: 'no-store' })
    if (res.ok) donors = await res.json()
  } catch (e) {
    // ignore — donors will be empty
    console.error('Failed to fetch donors for communications page', e)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Schedule a Communication</h1>
      <p style={{ marginBottom: 12 }}>Pick a donor and schedule a meeting or call.</p>

      {/* @ts-ignore */}
      <CommunicationsNewClient donors={donors} />
    </main>
  )
}
