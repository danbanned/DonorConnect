// lib/client-auth.js
export async function checkAuth() {
  try {
    const response = await fetch('/api/auth/session')
    if (!response.ok) {
      throw new Error('Not authenticated')
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
    // Clear client-side storage if any
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    
    // Redirect to login
    window.location.href = '/login'
  } catch (error) {
    console.error('Logout error:', error)
    window.location.href = '/login'
  }
}

export function getAuthToken() {
  // Helper to get token from cookies (for client-side API calls)
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1]
  
  return token
}