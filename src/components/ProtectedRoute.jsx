import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export function AdminRoute({ children }) {
  const [adminSession, setAdminSession] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    setAdminSession(session)
    setChecking(false)
  }, [])

  if (checking) return <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Checking admin access...</div>
  if (!adminSession) return <Navigate to="/admin-login" replace />
  return children
}
