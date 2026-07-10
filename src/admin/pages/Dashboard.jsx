import { useState, useEffect } from 'react'
import { fetchDashboardData } from '../services/adminService'
import { StatCard } from '../../components/ui'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData().then(setData).catch(console.error).finally(() => setLoading(false))
    const interval = setInterval(() => fetchDashboardData().then(setData).catch(console.error), 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Sales" value={data?.totalSales ?? 0} icon="💰" color="brand" />
        <StatCard label="Revenue" value={`₹${(data?.totalRevenue ?? 0).toLocaleString('en-IN')}`} icon="💵" color="blue" />
        <StatCard label="Orders" value={data?.totalOrders ?? 0} icon="📋" color="purple" />
        <StatCard label="Customers" value={data?.totalCustomers ?? 0} icon="👥" color="amber" />
        <StatCard label="Products" value={data?.totalProducts ?? 0} icon="📦" />
        <StatCard label="Coupons" value={data?.totalCoupons ?? 0} icon="🎫" color="blue" />
        <StatCard label="Today's Orders" value={data?.todayOrders ?? 0} icon="🆕" color="amber" />
        <StatCard label="Today's Revenue" value={`₹${(data?.todayRevenue ?? 0).toLocaleString('en-IN')}`} icon="🔥" color="red" />
      </div>

      {/* Monthly Sales & Low Stock */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Monthly Sales</h2>
          {data?.monthlySales && Object.keys(data.monthlySales).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(data.monthlySales).slice(-12).map(([month, amount]) => (
                <div key={month} className="flex items-center gap-3 text-sm">
                  <span className="w-16 font-semibold text-slate-700">{month}</span>
                  <div className="flex-1 h-6 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${Math.min(100, (amount / Math.max(...Object.values(data.monthlySales))) * 100)}%` }} />
                  </div>
                  <span className="w-24 text-right font-semibold text-slate-700">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No sales data yet</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Low Stock Products</h2>
          {data?.lowStockProducts?.length > 0 ? (
            <div className="space-y-3">
              {data.lowStockProducts.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 truncate">{p.name}</span>
                  <span className={`font-bold ${p.stock_quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {p.stock_quantity || 0} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">All products well stocked</p>
          )}
        </div>
      </div>

      {/* Top Selling */}
      {data?.topSelling?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Top Selling Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.topSelling.slice(0, 6).map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                <span className="text-lg font-bold text-brand-600">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.sales} sales · ₹{p.revenue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
