import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { bundleApi, saveBundleItems, fetchProducts } from '../services/adminService'
import { api } from '../../services/api'
import { Modal, ConfirmDialog, DataTable, Toggle } from '../../components/ui'
import ImageUploader from '../../components/ui/ImageUploader'

export default function AdminCombos() {
  const [items, setItems] = useState([]); const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ bundle_name: '', bundle_description: '', bundle_price: 0, bundle_discount_percent: 0, bundle_image_url: '', is_combo: true, is_active: true })
  const [bundleItems, setBundleItems] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => { setLoading(true); try { setItems(await bundleApi.fetch('created_at.desc')); setProducts(await fetchProducts()) } catch (e) { toast.error(e.message) }; setLoading(false) }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null); setForm({ bundle_name: '', bundle_description: '', bundle_price: 0, bundle_discount_percent: 0, bundle_image_url: '', is_combo: true, is_active: true })
    setBundleItems([]); setModal(true)
  }
  const openEdit = async (item) => {
    setEditing(item); setForm({ bundle_name: item.bundle_name, bundle_description: item.bundle_description||'', bundle_price: item.bundle_price, bundle_discount_percent: item.bundle_discount_percent||0, bundle_image_url: item.bundle_image_url||'', is_combo: item.is_combo??true, is_active: item.is_active??true })
    try {
      const data = await api.get(`/bundles/${item.id}/items`)
      setBundleItems(data || [])
    } catch { setBundleItems([]) }
    setModal(true)
  }

  const addBundleItem = () => {
    setBundleItems([...bundleItems, { product_id: '', variant_id: '', quantity: 1, product: null, variant: null }])
  }
  const updateBundleItem = (idx, field, val) => {
    const updated = [...bundleItems]; updated[idx] = { ...updated[idx], [field]: val }
    if (field === 'product_id') {
      const prod = products.find(p => p.id === val)
      updated[idx].product = prod; updated[idx].variant_id = ''
      updated[idx].variant = null
    }
    if (field === 'variant_id') {
      const prod = products.find(p => p.id === updated[idx].product_id)
      const v = prod?.product_variants?.find(vr => vr.id === val)
      updated[idx].variant = v
    }
    setBundleItems(updated)
  }
  const removeBundleItem = (idx) => setBundleItems(bundleItems.filter((_, i) => i !== idx))

  const save = async () => {
    if (!form.bundle_name) { toast.error('Bundle name is required'); return }
    try {
      let saved
      if (editing) { saved = await bundleApi.update(editing.id, form); toast.success('Updated') }
      else { saved = await bundleApi.create(form); toast.success('Created') }
      await saveBundleItems(saved.id, bundleItems.map(i => ({ product_id: i.product_id, variant_id: i.variant_id||null, quantity: i.quantity||1 })))
      setModal(false); load()
    } catch (e) { toast.error(e.message) }
  }
  const handleDelete = async () => {
    try { await bundleApi.remove(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); load() } catch (e) { toast.error(e.message) }
  }

  const selectedProduct = (pid) => products.find(p => p.id === pid)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Combos ({items.length})</h1>
        <button onClick={openCreate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">+ Add Combo</button>
      </div>
      <DataTable
        columns={[
          { key: 'image', label: '', render: r => r.bundle_image_url ? <img src={r.bundle_image_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-slate-100" /> },
          { key: 'bundle_name', label: 'Name', render: r => <span className="font-semibold">{r.bundle_name}</span> },
          { key: 'bundle_price', label: 'Price', render: r => `₹${r.bundle_price}` },
          { key: 'bundle_discount_percent', label: 'Discount', render: r => r.bundle_discount_percent ? <span className="text-amber-600 font-semibold">{r.bundle_discount_percent}%</span> : '—' },
          { key: 'is_combo', label: 'Combo', render: r => <Toggle checked={r.is_combo} onChange={() => {}} disabled /> },
          { key: 'is_active', label: 'Active', render: r => <Toggle checked={r.is_active} onChange={() => {}} disabled /> },
          { key: 'actions', label: '', render: r => (
            <div className="flex gap-2">
              <button onClick={() => openEdit(r)} className="text-sm font-semibold text-blue-600">Edit</button>
              <button onClick={() => setDeleteTarget(r)} className="text-sm font-semibold text-red-600">Delete</button>
            </div>
          )}
        ]}
        data={items} loading={loading}
      />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Combo' : 'Add Combo'} size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label><input value={form.bundle_name} onChange={e => setForm({...form, bundle_name: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Price (₹)</label><input type="number" value={form.bundle_price} onChange={e => setForm({...form, bundle_price: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Description</label><textarea value={form.bundle_description} onChange={e => setForm({...form, bundle_description: e.target.value})} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Discount %</label><input type="number" value={form.bundle_discount_percent} onChange={e => setForm({...form, bundle_discount_percent: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <ImageUploader value={form.bundle_image_url} onChange={v => setForm({...form, bundle_image_url: v})} label="Image" />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><Toggle checked={form.is_combo} onChange={() => setForm({...form, is_combo: !form.is_combo})} /><span className="text-sm">Show in Combos section</span></div>
            <div className="flex items-center gap-2"><Toggle checked={form.is_active} onChange={() => setForm({...form, is_active: !form.is_active})} /><span className="text-sm">Active</span></div>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900">Bundle Items ({bundleItems.length})</h3>
              <button onClick={addBundleItem} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">+ Add Item</button>
            </div>
            {bundleItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 mb-2 p-2 bg-slate-50 rounded-lg">
                <select value={item.product_id} onChange={e => updateBundleItem(i, 'product_id', e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                  <option value="">Select product</option>
                  {products.filter(p => p.is_active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {item.product_id && (
                  <select value={item.variant_id} onChange={e => updateBundleItem(i, 'variant_id', e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm w-32">
                    <option value="">Any variant</option>
                    {selectedProduct(item.product_id)?.product_variants?.map(v => <option key={v.id} value={v.id}>{v.weight_label} - ₹{v.price}</option>)}
                  </select>
                )}
                <input type="number" min={1} value={item.quantity} onChange={e => updateBundleItem(i, 'quantity', Number(e.target.value))} className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-center" />
                <button onClick={() => removeBundleItem(i)} className="text-red-500 hover:text-red-700 text-lg leading-none">&times;</button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={save} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Save Combo</button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Combo?" message={`Delete "${deleteTarget?.bundle_name}"?`} />
    </div>
  )
}
