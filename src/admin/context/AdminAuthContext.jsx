import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { verifyAdminSession, adminLogout } from '../services/adminAuth'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifyAdminSession().then(a => {
      setAdmin(a)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const logout = useCallback(async () => {
    await adminLogout()
    setAdmin(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, loading, logout, setAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
