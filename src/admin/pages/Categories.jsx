import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { categoryApi } from '../services/adminService'
import { Modal, ConfirmDialog, DataTable, Toggle } from '../../components/ui'
import ImageUploader from '../../components/ui/ImageUploader'

export default function AdminCategories() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', image_url: '', sort_order: 0, is_active: true })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => { setLoading(true); try { setItems(await categoryApi.fetch('sort_order.asc')) } catch (e) { toast.error(e.message) }; setLoading(false) }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', image_url: '', sort_order: 0, is_active: true }); setModal(true) }
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModal(true) }

  const save = async () => {
    if (!form.name) { toast.error('Name is required'); return }
    try {
      if (editing) { await categoryApi.update(editing.id, form); toast.success('Updated') }
      else { await categoryApi.create(form); toast.success('Created') }
      setModal(false); load()
    } catch (e) { toast.error(e.message) }
  }
  const handleDelete = async () => {
    try { await categoryApi.remove(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); load() } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Categories ({items.length})</h1>
        <button onClick={openCreate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">+ Add Category</button>
      </div>
      <DataTable
        columns={[
          { key: 'name', label: 'Name', render: r => <span className="font-semibold">{r.name}</span> },
          { key: 'description', label: 'Description', render: r => <span className="text-slate-500 text-sm">{r.description || '—'}</span> },
          { key: 'sort_order', label: 'Order', render: r => <span className="text-sm">{r.sort_order}</span> },
          { key: 'is_active', label: 'Active', render: r => <Toggle checked={r.is_active} onChange={() => {}} disabled /> },
          { key: 'actions', label: '', render: r => (
            <div className="flex gap-2">
              <button onClick={() => openEdit(r)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
              <button onClick={() => setDeleteTarget(r)} className="text-sm font-semibold text-red-600 hover:text-red-800">Delete</button>
            </div>
          )}
        ]}
        data={items} loading={loading}
      />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'Add Category'} size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <ImageUploader value={form.image_url} onChange={v => setForm({...form, image_url: v})} label="Image" />
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Sort Order</label><input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div className="flex items-center gap-2"><Toggle checked={form.is_active} onChange={() => setForm({...form, is_active: !form.is_active})} /><span className="text-sm text-slate-700">Active</span></div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={save} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Category?" message={`Delete "${deleteTarget?.name}"? This will not delete products in this category.`} />
    </div>
  )
}
