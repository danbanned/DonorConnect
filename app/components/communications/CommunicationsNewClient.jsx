"use client"

import React, { useState } from 'react'
import ScheduleMeetingForm from './ScheduleMeetingForm'

export default function CommunicationsNewClient({ donors = [] }) {
  const [selected, setSelected] = useState(donors.length > 0 ? donors[0].id : '')

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Select Donor</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          <option value="">— none —</option>
          {donors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}{d.email ? ` — ${d.email}` : ''}</option>
          ))}
        </select>
      </div>

      <ScheduleMeetingForm donorId={selected || null} />
    </div>
  )
}
