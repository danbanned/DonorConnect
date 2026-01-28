// lib/auth/getSession.js
import { cookies } from 'next/headers'
import { verifyToken } from '../auth'

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}
