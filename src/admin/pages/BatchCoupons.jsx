import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { couponApi, createBatchCoupons, exportCouponsCSV, importCouponsCSV } from '../services/adminService'
import { Modal, ConfirmDialog, DataTable } from '../../components/ui'

export default function AdminBatchCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({
    batch_name: '', prefix: '', count: 100, discount_type: 'percentage',
    discount_value: 10, min_order_value: 0, max_discount: '', expiry_date: '', usage_limit: 1, scope: 'all',
    applicable_products: '', applicable_categories: ''
  })
  const fileRef = useRef()

  const load = () => { setLoading(true); couponApi.fetch('created_at.desc').then(setCoupons).catch(e => toast.error(e.message)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleGenerate = async () => {
    if (form.count < 1 || form.count > 10000) { toast.error('Count must be 1-10000'); return }
    try {
      const appProducts = form.applicable_products ? form.applicable_products.split(',').map(s => s.trim()) : null
      const appCategories = form.applicable_categories ? form.applicable_categories.split(',').map(s => s.trim()) : null
      await createBatchCoupons({
        ...form,
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        expiry_date: form.expiry_date || null,
        applicable_products: appProducts,
        applicable_categories: appCategories
      })
      toast.success(`Generated ${form.count} coupons`)
      setModalOpen(false); load()
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async () => {
    try { await couponApi.remove(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); load() } catch (e) { toast.error(e.message) }
  }

  const handleExport = async () => {
    try {
      const csv = await exportCouponsCSV()
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'coupons.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch (e) { toast.error(e.message) }
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const text = await file.text(); await importCouponsCSV(text); toast.success('Coupons imported'); load() }
    catch (err) { toast.error(err.message) }
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Coupons ({coupons.length})</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Export CSV</button>
          <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Import CSV</button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          <button onClick={() => setModalOpen(true)} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">+ Generate Batch</button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'coupon_code', label: 'Code', render: r => <span className="font-mono font-semibold text-xs">{r.coupon_code}</span> },
          { key: 'discount_type', label: 'Type', render: r => <span className="capitalize text-sm">{r.discount_type}</span> },
          { key: 'discount_value', label: 'Value', render: r => r.discount_type === 'percentage' ? <span className="font-semibold">{r.discount_value}%</span> : <span className="font-semibold">₹{r.discount_value}</span> },
          { key: 'min_order_value', label: 'Min', render: r => <span className="text-sm">₹{r.min_order_value}</span> },
          { key: 'usage_limit', label: 'Limit', render: r => <span className="text-sm">{r.used_count || 0}/{r.usage_limit}</span> },
          { key: 'expiry_date', label: 'Expiry', render: r => r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : '—' },
          { key: 'is_active', label: 'Active', render: r => <span className={`h-2 w-2 rounded-full inline-block ${r.is_active ? 'bg-green-500' : 'bg-slate-300'}`} /> },
          { key: 'actions', label: '', render: r => <button onClick={() => setDeleteTarget(r)} className="text-xs font-semibold text-red-600">Delete</button> }
        ]}
        data={coupons}
        loading={loading}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate Batch Coupons" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Prefix</label><input value={form.prefix} onChange={e => setForm({...form, prefix: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g. SALE" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Count *</label><input type="number" value={form.count} min={1} max={10000} onChange={e => setForm({...form, count: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Discount Type</label><select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed (₹)</option></select></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Discount Value</label><input type="number" value={form.discount_value} onChange={e => setForm({...form, discount_value: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Min Order</label><input type="number" value={form.min_order_value} onChange={e => setForm({...form, min_order_value: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Max Discount</label><input type="number" value={form.max_discount} onChange={e => setForm({...form, max_discount: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Usage Limit</label><input type="number" value={form.usage_limit} min={1} onChange={e => setForm({...form, usage_limit: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Scope</label><select value={form.scope} onChange={e => setForm({...form, scope: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="all">All Products</option><option value="products">Products Only</option><option value="combos">Combos Only</option></select></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label><input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Applicable Categories (comma-separated)</label><input value={form.applicable_categories} onChange={e => setForm({...form, applicable_categories: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Millets, Pulses, Spices" /></div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded border-slate-300" id="batch-active" />
            <label htmlFor="batch-active" className="text-sm text-slate-700">Active immediately</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={handleGenerate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">{form.count > 1 ? `Generate ${form.count} Coupons` : 'Generate 1 Coupon'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Coupon?" message={`Delete "${deleteTarget?.coupon_code}"?`} />
    </div>
  )
}
