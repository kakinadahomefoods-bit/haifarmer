import { createContext, useContext, useState, useEffect } from 'react'
import { publicApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('user_token')
    const saved = localStorage.getItem('user_profile')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) } catch { localStorage.removeItem('user_token'); localStorage.removeItem('user_profile') }
    }
    setLoading(false)
  }, [])

  async function signup(email, password, fullName) {
    const data = await publicApi.post('/auth/signup', { email, password, full_name: fullName })
    localStorage.setItem('user_token', data.token)
    localStorage.setItem('user_profile', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  async function login(email, password) {
    const data = await publicApi.post('/auth/login', { email, password })
    localStorage.setItem('user_token', data.token)
    localStorage.setItem('user_profile', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  async function logout() {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_profile')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
