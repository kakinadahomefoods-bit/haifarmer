import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { adminLogout } from '../services/adminAuth'

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Products', path: '/admin/products', icon: '📦' },
  { label: 'Categories', path: '/admin/categories', icon: '🏷️' },
  { label: 'Combos', path: '/admin/combos', icon: '📦' },
  { label: 'Coupons', path: '/admin/coupons', icon: '🎫' },
  { label: 'Orders', path: '/admin/orders', icon: '📋' },
  { label: 'Customers', path: '/admin/customers', icon: '👥' },
  { label: 'Banners', path: '/admin/banners', icon: '🖼️' },
  { label: 'Announcements', path: '/admin/announcements', icon: '📢' },
  { label: 'Delivery', path: '/admin/delivery', icon: '🚚' },
  { label: 'Payment', path: '/admin/payment', icon: '💳' },
  { label: 'Farmers', path: '/admin/farmers', icon: '🌾' },
  { label: 'QR Codes', path: '/admin/qr', icon: '📱' },
  { label: 'Website', path: '/admin/website', icon: '⚙️' },
  { label: 'Audit Logs', path: '/admin/audit', icon: '📝' },
]

export default function AdminSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const admin = JSON.parse(localStorage.getItem('adminSession') || '{}')

  const handleLogout = async () => {
    await adminLogout(); navigate('/admin-login')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="fixed left-3 top-3 z-50 rounded-lg bg-slate-800 p-2 text-white md:hidden" aria-label="Menu">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-slate-900 transition-transform md:relative md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-14 items-center justify-between border-b border-slate-700 px-4">
          <span className="text-sm font-bold text-white truncate">{admin.full_name || 'Admin'}</span>
          <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">{admin.role || 'admin'}</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/admin'} className={linkClass} onClick={() => setMobileOpen(false)}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-700 p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <span>🚪</span> <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
