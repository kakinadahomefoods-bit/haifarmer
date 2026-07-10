import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext'
import AdminSidebar from './AdminSidebar'

function AdminLayoutInner() {
  const { admin, loading } = useAdminAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!admin) return <Navigate to="/admin-login" replace />

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>{admin?.full_name}</span>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">{admin?.role}</span>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner />
    </AdminAuthProvider>
  )
}
