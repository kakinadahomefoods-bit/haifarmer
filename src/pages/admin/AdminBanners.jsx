import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminPageHeader, SearchBar, FilterDropdown, ConfirmDialog, EmptyState, LoadingTable, StatusBadge, Tabs, useTablePagination } from '../../components/admin/AdminComponents'
import { adminLogin, fetchBanners, createBanner, updateBanner, deleteBanner, reorderBanners } from '../../services/adminService'
import { placeholderImage } from '../../utils/helpers'
import { toast } from 'react-toastify'

export default function AdminBanners() {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    title: '', subtitle: '', button_text: '', button_url: '',
    desktop_image_url: '', mobile_image_url: '',
    is_active: true, start_date: '', end_date: '',
    sort_order: 0
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchBanners()
      setBanners(data)
    } catch (e) { toast.error('Failed to load banners') }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openForm = (banner = null) => {
    if (banner) {
      setForm({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        button_text: banner.button_text || '',
        button_url: banner.button_url || '',
        desktop_image_url: banner.desktop_image_url || '',
        mobile_image_url: banner.mobile_image_url || '',
        is_active: banner.is_active ?? true,
        start_date: banner.start_date ? new Date(banner.start_date).toISOString().slice(0, 16) : '',
        end_date: banner.end_date ? new Date(banner.end_date).toISOString().slice(0, 16) : '',
        sort_order: banner.sort_order || 0
      })
      setEditing(banner.id)
    } else {
      setForm({ title: '', subtitle: '', button_text: '', button_url: '', desktop_image_url: '', mobile_image_url: '', is_active: true, start_date: '', end_date: '', sort_order: banners.length })
      setEditing(null)
    }
    setShowForm(true)
    setPreview(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.desktop_image_url) { toast.error('Desktop image URL is required'); return }
    try {
      const payload = {
        ...form,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        sort_order: Number(form.sort_order)
      }
      if (editing) {
        await updateBanner(editing, payload)
        toast.success('Banner updated')
      } else {
        await createBanner(payload)
        toast.success('Banner created')
      }
      setShowForm(false)
      load()
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try { await deleteBanner(deleteConfirm); toast.success('Banner deleted'); setDeleteConfirm(null); load() }
    catch (e) { toast.error(e.message) }
  }

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index)
  }

  const handleDrop = async (e, toIndex) => {
    const fromIndex = Number(e.dataTransfer.getData('text/plain'))
    const reordered = [...banners]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    setBanners(reordered)
    try {
      await reorderBanners(reordered)
    } catch { toast.error('Failed to reorder') }
  }

  const { page, setPage, totalPages, paginatedData } = useTablePagination(banners, 10)

  const FormModal = () => (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 py-10" onClick={() => setShowForm(false)}>
      <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-slate-900 mb-4">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-semibold text-slate-700 mb-1">Title</label><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></div>
            <div className="col-span-2"><label className="block text-sm font-semibold text-slate-700 mb-1">Subtitle</label><input type="text" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Button Text</label><input type="text" value={form.button_text} onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Button URL</label><input type="text" value={form.button_url} onChange={e => setForm(f => ({ ...f, button_url: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Desktop Image URL</label><input type="text" value={form.desktop_image_url} onChange={e => setForm(f => ({ ...f, desktop_image_url: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="https://..." /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Mobile Image URL</label><input type="text" value={form.mobile_image_url} onChange={e => setForm(f => ({ ...f, mobile_image_url: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Optional" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label><input type="datetime-local" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label><input type="datetime-local" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Sort Order</label><input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" /></div>
            <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-brand-600" /><span className="text-sm font-semibold text-slate-700">Active</span></label></div>
          </div>

          {/* Preview */}
          {(form.desktop_image_url || form.mobile_image_url) && (
            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Preview</p>
              <div className="rounded-xl overflow-hidden bg-slate-100 max-h-48">
                <img src={form.desktop_image_url || form.mobile_image_url || placeholderImage} alt="Preview" className="h-full w-full object-cover" onError={e => { e.target.src = placeholderImage }} />
              </div>
              {form.title && <p className="mt-2 text-sm font-bold text-slate-900">{form.title}</p>}
              {form.subtitle && <p className="text-xs text-slate-500">{form.subtitle}</p>}
            </div>
          )}

          <div className="flex gap-3 justify-end border-t border-slate-200 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700">{editing ? 'Update' : 'Create'} Banner</button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div>
      <AdminPageHeader title="Banner Management" description="Add, edit, reorder and manage all website banners" action={
        <button onClick={() => openForm()} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">+ Add Banner</button>
      } />

      {loading ? <LoadingTable rows={5} cols={5} /> : banners.length === 0 ? <EmptyState title="No banners yet" description="Create your first banner to display on the homepage." /> : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 w-8"></th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Preview</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Subtitle</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Schedule</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((banner, idx) => (
                  <tr key={banner.id} draggable onDragStart={e => handleDragStart(e, banners.indexOf(banner))} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, banners.indexOf(banner))} className="hover:bg-slate-50 cursor-grab active:cursor-grabbing">
                    <td className="px-4 py-3 text-slate-400 text-center">⠿</td>
                    <td className="px-4 py-3">
                      <img src={banner.desktop_image_url || placeholderImage} alt="" className="h-12 w-20 rounded-lg object-cover" onError={e => { e.target.src = placeholderImage }} />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{banner.title || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-[200px] truncate">{banner.subtitle || '—'}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={banner.is_active ? 'active' : 'inactive'} /></td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      {banner.start_date ? new Date(banner.start_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openForm(banner)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50">Edit</button>
                        <button onClick={() => setDeleteConfirm(banner.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      {showForm && <FormModal />}
      <ConfirmDialog isOpen={!!deleteConfirm} title="Delete Banner" message="Are you sure you want to delete this banner? This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
    </div>
  )
}
