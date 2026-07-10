import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊', end: true },
  { label: 'Banners', path: '/admin/banners', icon: '🖼️' },
  { label: 'Announcements', path: '/admin/announcements', icon: '📢' },
  { label: 'Products', path: '/admin/products', icon: '📦' },
  { label: 'Orders', path: '/admin/orders', icon: '📋' },
  { label: 'Batch Coupons', path: '/admin/coupons/batch', icon: '🏷️' },
  { label: 'Individual Coupons', path: '/admin/coupons/individual', icon: '🎫' },
  { label: 'Shipping', path: '/admin/shipping', icon: '🚚' },
  { label: 'Audit Logs', path: '/admin/audit', icon: '📝' },
]

export default function AdminSidebar({ collapsed, onToggle }) {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin-login')
  }

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
        {!collapsed && <span className="font-display text-lg font-bold text-white">HAiFarmer</span>}
        <button onClick={onToggle} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Admin info & logout */}
      <div className="border-t border-slate-700 p-4">
        {!collapsed && admin && (
          <p className="mb-2 text-xs text-slate-400 truncate">{admin.full_name} ({admin.role})</p>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white transition"
        >
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
