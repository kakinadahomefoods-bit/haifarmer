import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchProducts, fetchCategories } from '../../services/productService'
import { bulkUpdateProducts, bulkDeleteProducts, duplicateProduct } from '../services/adminService'
import { Modal, ConfirmDialog, Toggle, DataTable, Badge } from '../../components/ui'
import { placeholderImage } from '../../utils/helpers'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [bulkModal, setBulkModal] = useState(false)
  const [bulkForm, setBulkForm] = useState({ discount_percent: '', is_active: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([fetchProducts(search), fetchCategories()])
      setProducts(p); setCategories(c)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [search])

  const handleSelectAll = () => {
    if (selected.length === products.length) setSelected([])
    else setSelected(products.map(p => p.id))
  }

  const handleBulkUpdate = async () => {
    if (!selected.length) { toast.error('No products selected'); return }
    const updates = {}
    if (bulkForm.discount_percent !== '') updates.discount_percent = Number(bulkForm.discount_percent)
    if (bulkForm.is_active !== '') updates.is_active = bulkForm.is_active === 'true'
    if (!Object.keys(updates).length) { toast.error('No updates specified'); return }
    try {
      await bulkUpdateProducts(selected, updates)
      toast.success(`Updated ${selected.length} products`)
      setBulkModal(false); setBulkForm({ discount_percent: '', is_active: '' }); load()
    } catch (e) { toast.error(e.message) }
  }

  const handleBulkDelete = async () => {
    if (!selected.length) { toast.error('No products selected'); return }
    try {
      await bulkDeleteProducts(selected)
      toast.success(`Deleted ${selected.length} products`)
      setSelected([]); load()
    } catch (e) { toast.error(e.message) }
  }

  const handleDuplicate = async (id) => {
    try { await duplicateProduct(id); toast.success('Product duplicated'); load() } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Products ({products.length})</h1>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <>
              <span className="text-sm text-slate-500 self-center">{selected.length} selected</span>
              <button onClick={() => setBulkModal(true)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">Bulk Edit</button>
              <button onClick={handleBulkDelete} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Delete Selected</button>
            </>
          )}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="rounded-lg border border-slate-200 px-4 py-2 text-sm w-64" />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'image', label: '', render: r => <img src={r.image_url || placeholderImage} alt="" className="h-10 w-10 rounded-lg object-cover" /> },
          { key: 'name', label: 'Name', render: r => <span className="font-semibold text-slate-900">{r.name}</span> },
          { key: 'category', label: 'Category', render: r => <Badge>{r.category || '—'}</Badge> },
          { key: 'base_price', label: 'Price', render: r => `₹${r.base_price}` },
          { key: 'discount_percent', label: 'Discount', render: r => r.discount_percent ? <Badge color="amber">{r.discount_percent}%</Badge> : '—' },
          { key: 'status', label: 'Status', render: r => {
            const badges = []
            if (r.is_featured) badges.push(<Badge key="f" color="purple">Featured</Badge>)
            if (r.is_best_seller) badges.push(<Badge key="b" color="amber">Best</Badge>)
            if (r.is_new_arrival) badges.push(<Badge key="n" color="blue">New</Badge>)
            if (r.is_trending) badges.push(<Badge key="t" color="red">Trend</Badge>)
            return <div className="flex gap-1">{badges}</div>
          }},
          { key: 'stock_quantity', label: 'Stock', render: r => <span className={r.stock_quantity < 10 ? 'text-red-600 font-bold' : ''}>{r.stock_quantity ?? '—'}</span> },
          { key: 'actions', label: '', render: r => <div className="flex gap-1"><button onClick={() => handleDuplicate(r.id)} className="text-xs font-semibold text-blue-600">Duplicate</button><button className="text-xs font-semibold text-slate-600">Edit</button><button onClick={() => setDeleteTarget(r)} className="text-xs font-semibold text-red-600">Delete</button></div> }
        ]}
        data={products}
        loading={loading}
        selected={selected}
        onSelectAll={handleSelectAll}
        onSelectRow={(id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
      />

      <Modal open={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Edit Products" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Updating {selected.length} products</p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Discount % (leave empty to skip)</label>
            <input type="number" value={bulkForm.discount_percent} onChange={e => setBulkForm({ ...bulkForm, discount_percent: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Active Status</label>
            <select value={bulkForm.is_active} onChange={e => setBulkForm({ ...bulkForm, is_active: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">— No change —</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setBulkModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={handleBulkUpdate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Update {selected.length} Products</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => bulkDeleteProducts([deleteTarget.id]).then(() => { toast.success('Deleted'); load() }).catch(e => toast.error(e.message))}
        title="Delete Product?" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  )
}
