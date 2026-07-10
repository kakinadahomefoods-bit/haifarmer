import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { fetchCouponBatches, createBatchCoupons, deleteCouponBatch, exportCouponsCSV, importCouponsCSV } from '../services/adminService'
import { Modal, ConfirmDialog, DataTable } from '../../components/ui'

export default function AdminBatchCoupons() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({
    batch_name: '', prefix: '', count: 100, discount_type: 'percentage',
    discount_value: 10, min_order_value: 0, max_discount: '', expiry_date: '', usage_limit: 1, is_active: true
  })
  const fileRef = useRef()

  const load = () => { setLoading(true); fetchCouponBatches().then(setBatches).catch(e => toast.error(e.message)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleGenerate = async () => {
    if (!form.batch_name) { toast.error('Batch name required'); return }
    if (form.count < 1 || form.count > 10000) { toast.error('Count must be 1-10000'); return }
    try {
      await createBatchCoupons({ ...form, max_discount: form.max_discount ? Number(form.max_discount) : null, expiry_date: form.expiry_date || null })
      toast.success(`Generated ${form.count} coupons`)
      setModalOpen(false); load()
    } catch (e) { toast.error(e.message) }
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
    try {
      const text = await file.text()
      await importCouponsCSV(text)
      toast.success('Coupons imported')
      load()
    } catch (err) { toast.error(err.message) }
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Batch Coupons</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Export CSV</button>
          <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Import CSV</button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          <button onClick={() => setModalOpen(true)} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">+ Generate Batch</button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'batch_name', label: 'Batch Name' },
          { key: 'prefix', label: 'Prefix', render: r => r.prefix || '—' },
          { key: 'count', label: 'Count' },
          { key: 'discount_type', label: 'Type', render: r => <span className="capitalize">{r.discount_type}</span> },
          { key: 'discount_value', label: 'Value', render: r => r.discount_type === 'percentage' ? `${r.discount_value}%` : `₹${r.discount_value}` },
          { key: 'expiry_date', label: 'Expiry', render: r => r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : '—' },
          { key: 'is_active', label: 'Active', render: r => <span className={`h-2 w-2 rounded-full inline-block ${r.is_active ? 'bg-green-500' : 'bg-slate-300'}`} /> },
          { key: 'actions', label: '', render: r => <button onClick={() => setDeleteTarget(r)} className="text-xs font-semibold text-red-600 hover:text-red-700">Delete</button> }
        ]}
        data={batches}
        loading={loading}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate Batch Coupons" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Batch Name *</label>
              <input value={form.batch_name} onChange={e => setForm({ ...form, batch_name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Prefix</label>
              <input value={form.prefix} onChange={e => setForm({ ...form, prefix: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g. HAi" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Coupons *</label>
              <input type="number" value={form.count} min={1} max={10000} onChange={e => setForm({ ...form, count: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Discount Type</label>
              <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Discount Value</label>
              <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Min Order (₹)</label>
              <input type="number" value={form.min_order_value} onChange={e => setForm({ ...form, min_order_value: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Max Discount</label>
              <input type="number" value={form.max_discount} onChange={e => setForm({ ...form, max_discount: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Usage Limit</label>
              <input type="number" value={form.usage_limit} min={1} onChange={e => setForm({ ...form, usage_limit: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded border-slate-300" id="batch-active" />
            <label htmlFor="batch-active" className="text-sm text-slate-700">Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={handleGenerate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Generate {form.count} Coupons</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteCouponBatch(deleteTarget.id).then(() => { toast.success('Batch deleted'); load() }).catch(e => toast.error(e.message))}
        title="Delete Batch?" message={`Delete "${deleteTarget?.batch_name}" and all its coupons?`} />
    </div>
  )
}
