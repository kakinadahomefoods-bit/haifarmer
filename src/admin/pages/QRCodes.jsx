import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { qrApi, regenerateQR } from '../services/adminService'
import { Modal, DataTable, Toggle } from '../../components/ui'

export default function AdminQRCodes() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: 'Farmer Page QR', target_url: '', is_active: true })
  const [qrUrl, setQrUrl] = useState('')

  const load = async () => { setLoading(true); try { setItems(await qrApi.fetch('created_at.desc')) } catch (e) { toast.error(e.message) }; setLoading(false) }
  useEffect(() => { load() }, [])

  const generateQRUrl = (id, target) => `${window.location.origin}/farmer?qr=${id}`

  const openCreate = () => {
    const target = `${window.location.origin}/farmer`
    setEditing(null); setForm({ name: 'Farmer Page QR', target_url: target, is_active: true }); setQrUrl(''); setModal(true)
  }
  const openEdit = (item) => {
    setEditing(item); setForm({ name: item.name, target_url: item.target_url, is_active: item.is_active })
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(item.target_url)}`)
    setModal(true)
  }

  const save = async () => {
    if (!form.name) { toast.error('Name is required'); return }
    try {
      if (editing) {
        await qrApi.update(editing.id, form)
        toast.success('Updated')
      } else {
        const created = await qrApi.create(form)
        setQrUrl(generateQRUrl(created.id, form.target_url))
        toast.success('QR Code created!')
      }
      load()
    } catch (e) { toast.error(e.message) }
  }

  const handleRegenerate = async (item) => {
    const newUrl = `${window.location.origin}/farmer?qr=${item.id}&t=${Date.now()}`
    try { await regenerateQR(item.id, newUrl); toast.success('QR regenerated'); load() } catch (e) { toast.error(e.message) }
  }

  const downloadQR = (url, name) => {
    const a = document.createElement('a'); a.href = url; a.download = `${name || 'qr'}.png`; a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">QR Codes</h1>
        <button onClick={openCreate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">+ Generate QR</button>
      </div>
      <DataTable
        columns={[
          { key: 'name', label: 'Name', render: r => <span className="font-semibold">{r.name}</span> },
          { key: 'target_url', label: 'Target', render: r => <span className="text-xs text-slate-500 truncate max-w-[200px] inline-block">{r.target_url}</span> },
          { key: 'scan_count', label: 'Scans', render: r => <span className="font-semibold">{r.scan_count || 0}</span> },
          { key: 'is_active', label: 'Active', render: r => <Toggle checked={r.is_active} onChange={() => {}} disabled /> },
          { key: 'actions', label: '', render: r => (
            <div className="flex gap-2">
              <button onClick={() => openEdit(r)} className="text-sm font-semibold text-blue-600">View QR</button>
              <button onClick={() => handleRegenerate(r)} className="text-sm font-semibold text-amber-600">Regenerate</button>
            </div>
          )}
        ]}
        data={items} loading={loading}
      />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'QR Code Details' : 'Generate QR Code'} size="sm">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Target URL</label><input value={form.target_url} onChange={e => setForm({...form, target_url: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div className="flex items-center gap-2"><Toggle checked={form.is_active} onChange={() => setForm({...form, is_active: !form.is_active})} /><span className="text-sm">Active</span></div>
          {qrUrl && (
            <div className="text-center pt-4 border-t">
              <img src={qrUrl} alt="QR Code" className="mx-auto w-48 h-48" />
              <button onClick={() => downloadQR(qrUrl, form.name)} className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Download QR</button>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Close</button>
            {!editing && <button onClick={save} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Generate</button>}
          </div>
        </div>
      </Modal>
    </div>
  )
}
