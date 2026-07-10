import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../services/adminService'
import { Modal, ConfirmDialog, DataTable, Toggle, Badge } from '../../components/ui'

export default function AdminIndividualCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    coupon_code: '', description: '', discount_type: 'percentage', discount_value: 10,
    min_order_value: 0, max_discount: '', expiry_date: '', usage_limit: 1, is_active: true,
    is_first_order_only: false, free_shipping: false,
    applicable_products: '', applicable_categories: '', excluded_products: ''
  })

  const load = () => { setLoading(true); fetchCoupons(search).then(setCoupons).catch(e => toast.error(e.message)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [search])

  const openCreate = () => {
    setEditing(null); setForm({
      coupon_code: '', description: '', discount_type: 'percentage', discount_value: 10,
      min_order_value: 0, max_discount: '', expiry_date: '', usage_limit: 1, is_active: true,
      is_first_order_only: false, free_shipping: false,
      applicable_products: '', applicable_categories: '', excluded_products: ''
    }); setModalOpen(true)
  }

  const openEdit = (c) => {
    setEditing(c); setForm({
      coupon_code: c.coupon_code, description: c.description || '',
      discount_type: c.discount_type, discount_value: c.discount_value,
      min_order_value: c.min_order_value || 0, max_discount: c.max_discount || '',
      expiry_date: c.expiry_date ? c.expiry_date.slice(0, 10) : '',
      usage_limit: c.usage_limit || 1, is_active: c.is_active ?? true,
      is_first_order_only: c.is_first_order_only || false, free_shipping: c.free_shipping || false,
      applicable_products: (c.applicable_products || []).join(', '),
      applicable_categories: (c.applicable_categories || []).join(', '),
      excluded_products: (c.excluded_products || []).join(', ')
    }); setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.coupon_code) { toast.error('Coupon code required'); return }
    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value),
        min_order_value: Number(form.min_order_value),
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        usage_limit: Number(form.usage_limit),
        expiry_date: form.expiry_date || null,
        applicable_products: form.applicable_products ? form.applicable_products.split(',').map(s => s.trim()).filter(Boolean) : [],
        applicable_categories: form.applicable_categories ? form.applicable_categories.split(',').map(s => s.trim()).filter(Boolean) : [],
        excluded_products: form.excluded_products ? form.excluded_products.split(',').map(s => s.trim()).filter(Boolean) : [],
        coupon_code: form.coupon_code.toUpperCase()
      }
      if (editing) { await updateCoupon(editing.id, payload); toast.success('Coupon updated') }
      else { await createCoupon(payload); toast.success('Coupon created') }
      setModalOpen(false); load()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Individual Coupons</h1>
        <button onClick={openCreate} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">+ New Coupon</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupon codes..." className="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2.5 text-sm" />

      <DataTable
        columns={[
          { key: 'coupon_code', label: 'Code', render: r => <span className="font-bold text-brand-700">{r.coupon_code}</span> },
          { key: 'discount_type', label: 'Type', render: r => <Badge color={r.discount_type === 'percentage' ? 'blue' : 'green'}>{r.discount_type === 'percentage' ? '%' : '₹'}</Badge> },
          { key: 'discount_value', label: 'Value', render: r => r.discount_type === 'percentage' ? `${r.discount_value}%` : `₹${r.discount_value}` },
          { key: 'min_order_value', label: 'Min Order', render: r => `₹${r.min_order_value}` },
          { key: 'used_count', label: 'Used', render: r => `${r.used_count || 0}/${r.usage_limit || '∞'}` },
          { key: 'expiry_date', label: 'Expiry', render: r => r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : '—' },
          { key: 'is_active', label: 'Active', render: r => <span className={`h-2 w-2 rounded-full inline-block ${r.is_active ? 'bg-green-500' : 'bg-slate-300'}`} /> },
          { key: 'features', label: 'Features', render: r => <div className="flex gap-1">{r.is_first_order_only && <Badge color="purple">1st Order</Badge>}{r.free_shipping && <Badge color="green">Free Ship</Badge>}</div> },
          { key: 'actions', label: '', render: r => <div className="flex gap-1"><button onClick={() => openEdit(r)} className="text-xs font-semibold text-blue-600">Edit</button><button onClick={() => setDeleteTarget(r)} className="text-xs font-semibold text-red-600">Delete</button></div> }
        ]}
        data={coupons}
        loading={loading}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Coupon' : 'Create Coupon'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Coupon Code *</label>
              <input value={form.coupon_code} onChange={e => setForm({ ...form, coupon_code: e.target.value.toUpperCase() })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold uppercase" placeholder="HAi20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Discount Type</label>
              <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Discount Value</label>
              <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Min Purchase (₹)</label>
              <input type="number" value={form.min_order_value} onChange={e => setForm({ ...form, min_order_value: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Max Discount</label>
              <input type="number" value={form.max_discount} onChange={e => setForm({ ...form, max_discount: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Usage Limit</label>
              <input type="number" value={form.usage_limit} min={1} onChange={e => setForm({ ...form, usage_limit: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Applicable Products (comma separated IDs)</label>
              <input value={form.applicable_products} onChange={e => setForm({ ...form, applicable_products: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="prod-1, prod-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Applicable Categories</label>
              <input value={form.applicable_categories} onChange={e => setForm({ ...form, applicable_categories: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Vegetables, Spices" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Excluded Products</label>
            <input value={form.excluded_products} onChange={e => setForm({ ...form, excluded_products: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-wrap gap-6">
            <Toggle checked={form.is_active} onChange={() => setForm({ ...form, is_active: !form.is_active })} label="Active" />
            <Toggle checked={form.is_first_order_only} onChange={() => setForm({ ...form, is_first_order_only: !form.is_first_order_only })} label="First Order Only" />
            <Toggle checked={form.free_shipping} onChange={() => setForm({ ...form, free_shipping: !form.free_shipping })} label="Free Shipping" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={handleSave} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteCoupon(deleteTarget.id).then(() => { toast.success('Coupon deleted'); load() }).catch(e => toast.error(e.message))}
        title="Delete Coupon?" message={`Delete coupon "${deleteTarget?.coupon_code}"?`} />
    </div>
  )
}
