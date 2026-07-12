import { useState, useEffect } from 'react'
import { fetchAuditLogs } from '../services/adminService'
import { DataTable } from '../../components/ui'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuditLogs().then(data => { setLogs(data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
      <DataTable
        columns={[
          { key: 'createdAt', label: 'Time', render: r => new Date(r.createdAt || r.created_at).toLocaleString() },
          { key: 'action', label: 'Action', render: r => <span className="capitalize font-semibold">{r.action}</span> },
          { key: 'entity', label: 'Entity', render: r => <span className="capitalize">{r.entity || r.entity_type}</span> },
          { key: 'entity_id', label: 'Entity ID', render: r => r.entity_id ? <span className="font-mono text-xs">{r.entity_id.toString().slice(0, 8)}</span> : '—' },
        ]}
        data={logs}
        loading={loading}
      />
    </div>
  )
}
