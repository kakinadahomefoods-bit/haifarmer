import { useState, useEffect } from 'react'
import supabase from '../../services/supabase'
import { DataTable } from '../../components/ui'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('audit_logs')
      .select('*, admin:admin_users(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => { setLogs(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
      <DataTable
        columns={[
          { key: 'created_at', label: 'Time', render: r => new Date(r.created_at).toLocaleString() },
          { key: 'admin', label: 'Admin', render: r => r.admin?.full_name || r.admin?.email || '—' },
          { key: 'action', label: 'Action', render: r => <span className="capitalize font-semibold">{r.action}</span> },
          { key: 'entity_type', label: 'Entity', render: r => <span className="capitalize">{r.entity_type}</span> },
          { key: 'entity_id', label: 'Entity ID', render: r => r.entity_id ? <span className="font-mono text-xs">{r.entity_id.slice(0, 8)}</span> : '—' },
        ]}
        data={logs}
        loading={loading}
      />
    </div>
  )
}
