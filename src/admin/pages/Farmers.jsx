import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { farmerApi, approveFarmer } from '../services/adminService'
import { Modal, ConfirmDialog, DataTable, Toggle } from '../../components/ui'
import ImageUploader from '../../components/ui/ImageUploader'

export default function AdminFarmers() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', crop: '', image_url: '', address: '', description: '', is_approved: false, is_active: true })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => { setLoading(true); try { setItems(await farmerApi.fetch('created_at.desc')) } catch (e) { toast.error(e.message) }; setLoading(false) }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', phone: '', crop: '', image_url: '', address: '', description: '', is_approved: false, is_active: true }); setModal(true) }
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModal(true) }

  const save = async () => {
    if (!form.name) { toast.error('Name is required'); return }
    if (saving) return
    setSaving(true)
    try {
      if (editing) { await farmerApi.update(editing.id, form); toast.success('Updated') }
      else { await farmerApi.create(form); toast.success('Created') }
      setModal(false); load()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }
  const handleDelete = async () => {
    if (saving) return
    setSaving(true)
    try { await farmerApi.remove(deleteTarget.id); toast.success('Deleted'); load() }
    catch (e) { toast.error(e.message) }
    finally { setSaving(false); setDeleteTarget(null) }
  }
  const handleApprove = async (item) => {
    if (saving) return
    setSaving(true)
    try { await approveFarmer(item.id); toast.success('Farmer approved'); load() }
    catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Farmers ({items.length})</h1>
        <button onClick={openCreate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">+ Add Farmer</button>
      </div>
      <DataTable
        columns={[
          { key: 'image', label: '', render: r => r.image_url ? <img src={r.image_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-slate-100" /> },
          { key: 'name', label: 'Name', render: r => <span className="font-semibold">{r.name}</span> },
          { key: 'crop', label: 'Crop', render: r => <span className="text-sm text-slate-600">{r.crop || '—'}</span> },
          { key: 'phone', label: 'Phone', render: r => <span className="text-sm">{r.phone || '—'}</span> },
          { key: 'is_approved', label: 'Approved', render: r => <Toggle checked={r.is_approved} onChange={() => {}} disabled /> },
          { key: 'is_active', label: 'Active', render: r => <Toggle checked={r.is_active} onChange={() => {}} disabled /> },
          { key: 'actions', label: '', render: r => (
            <div className="flex gap-2">
              {!r.is_approved && <button onClick={() => handleApprove(r)} className="text-sm font-semibold text-green-600">Approve</button>}
              <button onClick={() => openEdit(r)} className="text-sm font-semibold text-blue-600">Edit</button>
              <button onClick={() => setDeleteTarget(r)} className="text-sm font-semibold text-red-600">Delete</button>
            </div>
          )}
        ]}
        data={items} loading={loading}
      />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Farmer' : 'Add Farmer'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold mb-1">Crop</label><input value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-semibold mb-1">Address</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <ImageUploader value={form.image_url} onChange={v => setForm({...form, image_url: v})} label="Image" />
          <div><label className="block text-sm font-semibold mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><Toggle checked={form.is_approved} onChange={() => setForm({...form, is_approved: !form.is_approved})} /><span className="text-sm">Approved</span></div>
            <div className="flex items-center gap-2"><Toggle checked={form.is_active} onChange={() => setForm({...form, is_active: !form.is_active})} /><span className="text-sm">Active</span></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModal(false)} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={save} disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Farmer?" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  )
}
