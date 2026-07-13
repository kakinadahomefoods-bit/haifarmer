import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchBanners, createBanner, updateBanner, deleteBanner, reorderBanners } from '../services/adminService'
import { Modal, ConfirmDialog, Toggle } from '../../components/ui'
import ImageUploader from '../../components/ui/ImageUploader'
import { placeholderImage } from '../../utils/helpers'

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    title: '', subtitle: '', button_text: '', button_url: '',
    desktop_image_url: '', mobile_image_url: '',
    is_active: true, starts_at: '', ends_at: ''
  })

  const loadBanners = () => {
    setLoading(true)
    fetchBanners().then(setBanners).catch(e => toast.error(e.message)).finally(() => setLoading(false))
  }

  useEffect(() => { loadBanners() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', subtitle: '', button_text: '', button_url: '', desktop_image_url: '', mobile_image_url: '', is_active: true, starts_at: '', ends_at: '' })
    setModalOpen(true)
  }

  const openEdit = (banner) => {
    setEditing(banner)
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      button_text: banner.button_text || '',
      button_url: banner.button_url || '',
      desktop_image_url: banner.desktop_image_url || '',
      mobile_image_url: banner.mobile_image_url || '',
      is_active: banner.is_active ?? true,
      starts_at: banner.starts_at ? banner.starts_at.slice(0, 16) : '',
      ends_at: banner.ends_at ? banner.ends_at.slice(0, 16) : ''
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return }
    if (saving) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null
      }
      if (editing) {
        await updateBanner(editing.id, payload)
        toast.success('Banner updated')
      } else {
        await createBanner(payload)
        toast.success('Banner created')
      }
      setModalOpen(false)
      loadBanners()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (saving) return
    setSaving(true)
    try {
      await deleteBanner(deleteTarget.id)
      toast.success('Banner deleted')
      loadBanners()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false); setDeleteTarget(null) }
  }

  const handleReorder = async (id, direction) => {
    const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex(b => b.id === id)
    if (idx < 0) return
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const ids = sorted.map(b => b.id)
    ;[ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]]
    try {
      await reorderBanners(ids)
      loadBanners()
    } catch (e) { toast.error(e.message) }
  }

  const activeNow = (b) => {
    const now = new Date()
    if (b.starts_at && new Date(b.starts_at) > now) return false
    if (b.ends_at && new Date(b.ends_at) < now) return false
    return true
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Banner Management</h1>
        <button onClick={openCreate} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">
          + Add Banner
        </button>
      </div>

      {/* Banner list */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />)
        ) : banners.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400">No banners yet</div>
        ) : (
          banners.sort((a, b) => a.sort_order - b.sort_order).map((banner, idx) => (
            <div key={banner.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {/* Preview */}
              <div className="h-20 w-32 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                <img src={banner.desktop_image_url || placeholderImage} alt="" className="h-full w-full object-cover" />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 truncate">{banner.title}</h3>
                  <span className={`inline-block h-2 w-2 rounded-full ${banner.is_active && activeNow(banner) ? 'bg-green-500' : 'bg-slate-300'}`} />
                  {!banner.is_active && <span className="text-xs font-semibold text-slate-400">(disabled)</span>}
                  {banner.starts_at && new Date(banner.starts_at) > new Date() && <span className="text-xs font-semibold text-amber-600">(scheduled)</span>}
                </div>
                {banner.subtitle && <p className="text-sm text-slate-500 truncate">{banner.subtitle}</p>}
                <div className="mt-1 flex gap-3 text-xs text-slate-400">
                  {banner.starts_at && <span>From: {new Date(banner.starts_at).toLocaleDateString()}</span>}
                  {banner.ends_at && <span>To: {new Date(banner.ends_at).toLocaleDateString()}</span>}
                  <span>Order: {banner.sort_order}</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleReorder(banner.id, -1)} disabled={idx === 0} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30">↑</button>
                <button onClick={() => handleReorder(banner.id, 1)} disabled={idx === banners.length - 1} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30">↓</button>
                <button onClick={() => setPreview(banner)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Preview</button>
                <button onClick={() => openEdit(banner)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50">Edit</button>
                <button onClick={() => setDeleteTarget(banner)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Banner' : 'Add Banner'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Button Text</label>
              <input value={form.button_text} onChange={e => setForm({ ...form, button_text: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Button URL</label>
              <input value={form.button_url} onChange={e => setForm({ ...form, button_url: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
          </div>
          <ImageUploader value={form.desktop_image_url} onChange={v => setForm({...form, desktop_image_url: v})} label="Desktop Image" />
          <ImageUploader value={form.mobile_image_url} onChange={v => setForm({...form, mobile_image_url: v})} label="Mobile Image" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
              <input type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
              <input type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
          </div>
          <Toggle checked={form.is_active} onChange={() => setForm({ ...form, is_active: !form.is_active })} label="Active" />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Banner Preview" size="lg">
        {preview && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-slate-100">
              <img src={preview.desktop_image_url || placeholderImage} alt={preview.title} className="w-full object-cover max-h-64" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{preview.title}</h3>
            {preview.subtitle && <p className="text-slate-600">{preview.subtitle}</p>}
            <div className="flex gap-2">
              {preview.button_text && <span className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">{preview.button_text}</span>}
              {preview.mobile_image_url && <img src={preview.mobile_image_url} alt="" className="h-40 rounded-lg border" />}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Banner?" message={`Are you sure you want to delete "${deleteTarget?.title}"?`} confirmText={saving ? 'Deleting...' : 'Delete'} />
    </div>
  )
}
