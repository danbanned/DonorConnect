import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (res.ok) {
        // Clear client-side state if you store JWT/user info
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')

        // Redirect to login page
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <button onClick={handleLogout} className="btn-logout">
      Logout
    </button>
  )
}
