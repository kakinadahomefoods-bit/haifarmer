import { useState, useMemo } from 'react'
import { toast } from 'react-toastify'

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-slate-50">&lsaquo; Prev</button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let page
        if (totalPages <= 5) page = i + 1
        else if (currentPage <= 3) page = i + 1
        else if (currentPage >= totalPages - 2) page = totalPages - 4 + i
        else page = currentPage - 2 + i
        return (
          <button key={page} onClick={() => onPageChange(page)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${currentPage === page ? 'bg-brand-600 text-white' : 'border border-slate-200 hover:bg-slate-50'}`}>{page}</button>
        )
      })}
      <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-slate-50">Next &rsaquo;</button>
    </div>
  )
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
    </div>
  )
}

export function FilterDropdown({ label, value, options, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
      <option value="">{label}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', variant = 'danger' }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900">{title || 'Confirm'}</h3>
        <p className="mt-2 text-sm text-slate-600">{message || 'Are you sure?'}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ title = 'No data found', description = 'Get started by adding your first item.' }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
      <p className="text-lg font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  )
}

export function LoadingTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-10 flex-1 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function StatusBadge({ status }) {
  const colors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    packed: 'bg-purple-100 text-purple-700 border-purple-200',
    shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    out_for_delivery: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    returned: 'bg-orange-100 text-orange-700 border-orange-200',
    paid: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
    refunded: 'bg-orange-100 text-orange-700 border-orange-200',
    true: 'bg-green-100 text-green-700 border-green-200',
    false: 'bg-slate-100 text-slate-600 border-slate-200',
  }
  const colorClass = colors[status] || colors.inactive
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      {status ? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown'}
    </span>
  )
}

export function useTablePagination(data, pageSize = 10) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil((data?.length || 0) / pageSize)
  const paginatedData = useMemo(() => {
    if (!data) return []
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])
  return { page, setPage, totalPages, paginatedData }
}

export function AdminPageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition -mb-[3px] ${
            activeTab === tab.value
              ? 'border-b-2 border-brand-600 text-brand-700 bg-brand-50/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
