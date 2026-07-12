import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchCustomers } from '../services/adminService'
import { DataTable } from '../../components/ui'

export default function AdminCustomers() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState('')

  const load = async () => { setLoading(true); try { setItems(await fetchCustomers(search)) } catch (e) { toast.error(e.message) }; setLoading(false) }
  useEffect(() => { load() }, [search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Customers ({items.length})</h1>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." className="rounded-lg border border-slate-200 px-4 py-2 text-sm w-72" />
      </div>
      <DataTable
        columns={[
          { key: 'full_name', label: 'Name', render: r => <span className="font-semibold">{r.full_name || '—'}</span> },
          { key: 'phone', label: 'Phone', render: r => <span>{r.phone || '—'}</span> },
          { key: 'created_at', label: 'Joined', render: r => <span className="text-sm text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span> },
        ]}
        data={items} loading={loading}
      />
    </div>
  )
}
