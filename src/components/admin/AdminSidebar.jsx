import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Orders', path: '/admin/orders', icon: '📦' },
  { label: 'Products', path: '/admin/products', icon: '🛍️' },
  { label: 'Banners', path: '/admin/banners', icon: '🖼️' },
  { label: 'Announcements', path: '/admin/announcements', icon: '📢' },
  { label: 'Coupons', path: '/admin/coupons', icon: '🏷️' },
  { label: 'Shipping', path: '/admin/shipping', icon: '🚚' },
  { label: 'Categories', path: '/admin/categories', icon: '📁' },
  { label: 'Bundles', path: '/admin/bundles', icon: '📦' },
  { label: 'Farmers', path: '/admin/farmers', icon: '👨‍🌾' },
  { label: 'Site Assets', path: '/admin/site-assets', icon: '🎨' },
  { label: 'About', path: '/admin/about', icon: '📄' },
  { label: 'Banner Links', path: '/admin/banner-links', icon: '🔗' },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: '📋' },
]

export default function AdminSidebar() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const adminName = localStorage.getItem('adminName') || 'Admin'

  const handleLogout = () => {
    localStorage.removeItem('adminSession')
    localStorage.removeItem('adminName')
    navigate('/admin-login')
  }

  return (
    <>
      {/* Mobile overlay */}
      <div className={`fixed inset-0 z-40 bg-black/30 md:hidden ${collapsed ? 'hidden' : 'block'}`} onClick={() => setCollapsed(true)} />

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 flex h-full flex-col bg-white border-r border-slate-200 transition-all duration-300 ${collapsed ? '-translate-x-full' : 'translate-x-0'} md:relative md:translate-x-0 md:w-56`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <span className="font-display text-lg font-bold text-brand-700">HAiFarmer</span>
          <button onClick={() => setCollapsed(true)} className="rounded-lg p-1 hover:bg-slate-100 md:hidden">&times;</button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 truncate">{adminName}</span>
          </div>
          <button onClick={handleLogout} className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition">
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button onClick={() => setCollapsed(false)} className="fixed bottom-4 left-4 z-30 rounded-full bg-brand-600 p-3 text-white shadow-lg md:hidden">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
    </>
  )
}
