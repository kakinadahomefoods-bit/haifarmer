import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../services/adminService'
import { Modal, ConfirmDialog, Toggle } from '../../components/ui'

export default function AdminAnnouncements() {
  const [anns, setAnns] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    text: '', cta_url: '', cta_text: '',
    background_color: '#16a34a', text_color: '#ffffff', font_size: '0.75rem',
    is_active: true, auto_rotate: true, scroll_speed: 30,
    starts_at: '', ends_at: ''
  })

  const load = () => { setLoading(true); fetchAnnouncements().then(setAnns).catch(e => toast.error(e.message)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null); setForm({ text: '', cta_url: '', cta_text: '', background_color: '#16a34a', text_color: '#ffffff', font_size: '0.75rem', is_active: true, auto_rotate: true, scroll_speed: 30, starts_at: '', ends_at: '' })
    setModalOpen(true)
  }

  const openEdit = (a) => {
    setEditing(a)
    setForm({
      text: a.text || '', cta_url: a.cta_url || '', cta_text: a.cta_text || '',
      background_color: a.background_color || '#16a34a', text_color: a.text_color || '#ffffff',
      font_size: a.font_size || '0.75rem', is_active: a.is_active ?? true,
      auto_rotate: a.auto_rotate ?? true, scroll_speed: a.scroll_speed || 30,
      starts_at: a.starts_at ? a.starts_at.slice(0, 16) : '', ends_at: a.ends_at ? a.ends_at.slice(0, 16) : ''
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.text) { toast.error('Text is required'); return }
    try {
      const payload = { ...form, starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null, ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null }
      if (editing) { await updateAnnouncement(editing.id, payload); toast.success('Announcement updated') }
      else { await createAnnouncement(payload); toast.success('Announcement created') }
      setModalOpen(false); load()
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async () => {
    try { await deleteAnnouncement(deleteTarget.id); toast.success('Deleted'); load() } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Announcement Bar</h1>
        <button onClick={openCreate} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">+ Add Announcement</button>
      </div>

      {/* Preview */}
      {anns.filter(a => a.is_active).length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Preview (active announcements will rotate)</p>
          <div className="flex flex-wrap gap-2">
            {anns.filter(a => a.is_active).map(a => (
              <div key={a.id} className="rounded-lg px-4 py-2 text-xs font-semibold shadow-sm" style={{ backgroundColor: a.background_color || '#16a34a', color: a.text_color || '#ffffff', fontSize: a.font_size || '0.75rem' }}>
                {a.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />)
        : anns.length === 0 ? <div className="rounded-xl border border-dashed p-12 text-center text-slate-400">No announcements</div>
        : anns.map(a => (
            <div key={a.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="rounded-lg px-4 py-2 text-xs font-semibold shadow-sm" style={{ backgroundColor: a.background_color || '#16a34a', color: a.text_color || '#ffffff' }}>
                {a.text}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${a.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <span className="text-xs text-slate-500">{a.auto_rotate ? 'Auto-rotate' : 'Static'}</span>
                  {a.cta_url && <span className="text-xs text-blue-600">Has CTA</span>}
                </div>
                <p className="text-xs text-slate-400">Speed: {a.scroll_speed}s · Font: {a.font_size}</p>
              </div>
              <button onClick={() => openEdit(a)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50">Edit</button>
              <button onClick={() => setDeleteTarget(a)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
            </div>
          ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Announcement' : 'Add Announcement'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Announcement Text *</label>
            <input value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">CTA URL</label>
              <input value={form.cta_url} onChange={e => setForm({ ...form, cta_url: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">CTA Text</label>
              <input value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">BG Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.background_color} onChange={e => setForm({ ...form, background_color: e.target.value })} className="h-9 w-9 rounded cursor-pointer" />
                <input value={form.background_color} onChange={e => setForm({ ...form, background_color: e.target.value })} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Text Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.text_color} onChange={e => setForm({ ...form, text_color: e.target.value })} className="h-9 w-9 rounded cursor-pointer" />
                <input value={form.text_color} onChange={e => setForm({ ...form, text_color: e.target.value })} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Font Size</label>
              <select value={form.font_size} onChange={e => setForm({ ...form, font_size: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="0.625rem">10px</option>
                <option value="0.75rem">12px</option>
                <option value="0.875rem">14px</option>
                <option value="1rem">16px</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Scroll Speed (seconds)</label><input type="number" value={form.scroll_speed} onChange={e => setForm({ ...form, scroll_speed: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div className="flex items-end gap-4 pb-2">
              <Toggle checked={form.auto_rotate} onChange={() => setForm({ ...form, auto_rotate: !form.auto_rotate })} label="Auto-rotate" />
              <Toggle checked={form.is_active} onChange={() => setForm({ ...form, is_active: !form.is_active })} label="Active" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label><input type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label><input type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={handleSave} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Announcement?" message={`Delete "${deleteTarget?.text}"?`} />
    </div>
  )
}
