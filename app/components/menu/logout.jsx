'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export default function UserMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <div className="navbar-user-profile" ref={menuRef}>
      <div className="navbar-user-info" onClick={() => setOpen(!open)}>
        <p className="navbar-user-name">John Smith</p>
        <p className="navbar-user-role">Development Director</p>
      </div>
      <div className="navbar-user-avatar" onClick={() => setOpen(!open)}>
        <UserCircleIcon className="icon-avatar" />
      </div>

      {open && (
        <div className="user-menu-dropdown">
          <button onClick={() => router.push('/settings')} className="user-menu-item">
            Settings
          </button>
          <button onClick={handleLogout} className="user-menu-item">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
