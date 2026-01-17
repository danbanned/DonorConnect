// hooks/useCurrentAccount.js
import { useState, useEffect } from 'react'

export function useCurrentAccount() {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAccount = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/login', {
        method: 'GET',
        credentials: 'include' // Important for sending cookies
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Handle both response formats
        const userData = data.user || data
        setAccount({
          id: userData.id,
          email: userData.email || userData.loginName,
          name: userData.name,
          role: userData.role,
          organization: userData.organization
        })
      } else {
        setAccount(null)
      }
    } catch (err) {
      console.error('Failed to fetch account:', err)
      setError(err.message)
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccount()
    
    // Optional: Set up polling to keep user data fresh
    const intervalId = setInterval(() => {
      fetchAccount()
    }, 5 * 60 * 1000) // Refresh every 5 minutes
    
    return () => clearInterval(intervalId)
  }, [])

  // Public methods for manual refresh or logout
  const refresh = () => {
    return fetchAccount()
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } finally {
      setAccount(null)
    }
  }

  return {
    account,
    loading,
    error,
    refresh,
    logout,
    isAuthenticated: !!account
  }
}