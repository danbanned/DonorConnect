// lib/donors.js
// Client-safe helpers that call API routes
// ❌ NO Prisma in this file

/**
 * Get all donors ordered by last name
 */
export async function getDonors() {
  const res = await fetch('/api/donors', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store', // ensures fresh data
  })

  if (!res.ok) {
    throw new Error('Failed to load donors')
  }

  return res.json()
}

/**
 * Get a single donor by ID
 */
export async function getDonorById(id) {
  if (!id) throw new Error('Donor ID is required')

  const res = await fetch(`/api/donors/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  if (res.status === 404) return null

  if (!res.ok) {
    throw new Error('Failed to load donor')
  }

  return res.json()
}

/**
 * Get LYBUNT donors
 * (Last Year But Unfortunately Not This Year)
 */
export async function getLYBUNTDonors() {
  const res = await fetch('/api/donors/lybunt', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to load LYBUNT donors')
  }

  return res.json()
}

/**
 * Create a new donor
 */
export async function createDonor(donorData) {
  const res = await fetch('/api/donors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donorData),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.message || 'Failed to create donor')
  }

  return res.json()
}
