export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full ${sizes[size]} rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">&times;</button>
        </div>
        <div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm', message = 'Are you sure?', confirmText = 'Delete', destructive = true }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => { onConfirm(); onClose() }} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export function DataTable({ columns, data, loading, onRowClick, selected, onSelectAll, onSelectRow }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {onSelectAll && (
              <th className="px-4 py-3">
                <input type="checkbox" checked={selected?.length === data?.length} onChange={onSelectAll} className="rounded border-slate-300" />
              </th>
            )}
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-slate-100" /></td>
                ))}
              </tr>
            ))
          ) : data?.length === 0 ? (
            <tr><td colSpan={columns.length + (onSelectAll ? 1 : 0)} className="px-4 py-12 text-center text-slate-400">No data found</td></tr>
          ) : (
            data?.map((row, idx) => (
              <tr key={row.id || idx} className={`hover:bg-slate-50 transition cursor-pointer ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(row)}>
                {onSelectRow && (
                  <td className="px-4 py-3"><input type="checkbox" checked={selected?.includes(row.id)} onChange={() => onSelectRow(row.id)} className="rounded border-slate-300" /></td>
                )}
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-slate-600">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.ceil(total / limit)
  return (
    <div className="flex items-center justify-between pt-4 text-sm text-slate-600">
      <span>Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}</span>
      <div className="flex gap-2">
        <button disabled={page === 0} onClick={() => onChange(page - 1)} className="rounded-lg border px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-50">Prev</button>
        <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} className="rounded-lg border px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-50">Next</button>
      </div>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-slate-200 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
            active === tab.value ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function StatCard({ label, value, icon, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.brand}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value ?? '—'}</p>
        </div>
        {icon && <span className="text-2xl opacity-60">{icon}</span>}
      </div>
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-slate-300'}`}>
        <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  )
}

export function Badge({ children, color = 'slate' }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  }
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[color] || colors.slate}`}>{children}</span>
}
