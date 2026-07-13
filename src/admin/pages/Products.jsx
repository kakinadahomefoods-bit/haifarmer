import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { fetchProducts, fetchCategories } from '../../services/productService'
import { bulkUpdateProducts, bulkDeleteProducts, duplicateProduct, createProduct, updateProduct } from '../services/adminService'
import { Modal, ConfirmDialog, Toggle, DataTable, Badge } from '../../components/ui'
import ImageUploader from '../../components/ui/ImageUploader'
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
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [productModal, setProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '', description: '', category: '', base_price: '', discount_percent: '',
    image_url: '', unit: '250g', unit_count: 1, stock_quantity: '',
    is_active: true, is_featured: false, is_best_seller: false,
    is_new_arrival: false, is_trending: false, tags: ''
  })

  const load = useRef()
  load.current = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([fetchProducts(search), fetchCategories()])
      setProducts(p); setCategories(c)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }
  useEffect(() => {
    const timer = setTimeout(() => load.current(), 300)
    return () => clearTimeout(timer)
  }, [search])

  const resetProductForm = (product = null) => {
    if (product) {
      setProductForm({
        name: product.name || '', description: product.description || '',
        category: product.category || '', base_price: product.base_price ?? '',
        discount_percent: product.discount_percent ?? '',
        image_url: product.image_url || '', unit: product.unit || '250g',
        unit_count: product.unit_count ?? 1, stock_quantity: product.stock_quantity ?? '',
        is_active: product.is_active ?? true, is_featured: product.is_featured ?? false,
        is_best_seller: product.is_best_seller ?? false,
        is_new_arrival: product.is_new_arrival ?? false,
        is_trending: product.is_trending ?? false,
        tags: product.tags?.join(', ') || ''
      })
    } else {
      setProductForm({
        name: '', description: '', category: '', base_price: '', discount_percent: '',
        image_url: '', unit: '250g', unit_count: 1, stock_quantity: '',
        is_active: true, is_featured: false, is_best_seller: false,
        is_new_arrival: false, is_trending: false, tags: ''
      })
    }
  }

  const openCreate = () => {
    setEditingProduct(null)
    resetProductForm()
    setProductModal(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    resetProductForm(product)
    setProductModal(true)
  }

  const handleSaveProduct = async () => {
    if (!productForm.name) { toast.error('Product name is required'); return }
    if (!productForm.base_price || Number(productForm.base_price) <= 0) { toast.error('Price must be greater than 0'); return }
    if (saving) return
    setSaving(true)
    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category: productForm.category.trim(),
        base_price: Number(productForm.base_price),
        discount_percent: Math.min(100, Math.max(0, Number(productForm.discount_percent) || 0)),
        image_url: productForm.image_url,
        unit: productForm.unit || '250g',
        unit_count: Math.max(1, Number(productForm.unit_count) || 1),
        stock_quantity: Math.max(0, Number(productForm.stock_quantity) || 0),
        is_active: productForm.is_active,
        is_featured: productForm.is_featured,
        is_best_seller: productForm.is_best_seller,
        is_new_arrival: productForm.is_new_arrival,
        is_trending: productForm.is_trending,
        tags: productForm.tags ? productForm.tags.split(',').map(s => s.trim()).filter(Boolean) : []
      }
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
        toast.success('Product updated')
      } else {
        await createProduct(payload)
        toast.success('Product created')
      }
      setProductModal(false)
      load.current()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (saving) return
    setSaving(true)
    try {
      await bulkDeleteProducts([deleteTarget.id])
      toast.success('Deleted')
      load.current()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false); setDeleteTarget(null) }
  }

  const handleSelectAll = () => {
    if (selected.length === products.length) setSelected([])
    else setSelected(products.map(p => p.id))
  }

  const handleBulkUpdate = async () => {
    if (!selected.length) { toast.error('No products selected'); return }
    if (saving) return
    setSaving(true)
    const updates = {}
    if (bulkForm.discount_percent !== '') updates.discount_percent = Number(bulkForm.discount_percent)
    if (bulkForm.is_active !== '') updates.is_active = bulkForm.is_active === 'true'
    if (!Object.keys(updates).length) { toast.error('No updates specified'); setSaving(false); return }
    try {
      await bulkUpdateProducts(selected, updates)
      toast.success(`Updated ${selected.length} products`)
      setBulkModal(false); setBulkForm({ discount_percent: '', is_active: '' }); load.current()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleBulkDelete = async () => {
    if (!selected.length) { toast.error('No products selected'); return }
    if (saving) return
    setSaving(true)
    try {
      await bulkDeleteProducts(selected)
      toast.success(`Deleted ${selected.length} products`)
      setSelected([]); load.current()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDuplicate = async (id) => {
    if (saving) return
    setSaving(true)
    try { await duplicateProduct(id); toast.success('Product duplicated'); load.current() }
    catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
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
              <button onClick={() => setBulkDeleteConfirm(true)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Delete Selected</button>
            </>
          )}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="rounded-lg border border-slate-200 px-4 py-2 text-sm w-64" />
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <button onClick={openCreate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Add Product</button>
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
          { key: 'actions', label: '', render: r => <div className="flex gap-1"><button onClick={() => handleDuplicate(r.id)} className="text-xs font-semibold text-blue-600">Duplicate</button><button onClick={() => openEdit(r)} className="text-xs font-semibold text-slate-600">Edit</button><button onClick={() => setDeleteTarget(r)} className="text-xs font-semibold text-red-600">Delete</button></div> }
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

      <Modal open={productModal} onClose={() => setProductModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label>
              <input type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea rows={3} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <input type="text" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Unit</label>
              <input type="text" value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Base Price (₹)</label>
              <input type="number" value={productForm.base_price} onChange={e => setProductForm({ ...productForm, base_price: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Discount %</label>
              <input type="number" value={productForm.discount_percent} onChange={e => setProductForm({ ...productForm, discount_percent: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Stock Quantity</label>
              <input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Unit Count</label>
              <input type="number" value={productForm.unit_count} onChange={e => setProductForm({ ...productForm, unit_count: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <ImageUploader value={productForm.image_url} onChange={url => setProductForm({ ...productForm, image_url: url })} label="Product Image" folder="products" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
              <input type="text" value={productForm.tags} onChange={e => setProductForm({ ...productForm, tags: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g. organic, fresh, seasonal" />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={productForm.is_active} onChange={e => setProductForm({ ...productForm, is_active: e.target.checked })} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={productForm.is_featured} onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked })} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={productForm.is_best_seller} onChange={e => setProductForm({ ...productForm, is_best_seller: e.target.checked })} />
              Best Seller
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={productForm.is_new_arrival} onChange={e => setProductForm({ ...productForm, is_new_arrival: e.target.checked })} />
              New Arrival
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={productForm.is_trending} onChange={e => setProductForm({ ...productForm, is_trending: e.target.checked })} />
              Trending
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setProductModal(false)} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={handleSaveProduct} disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'} Product</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Product?" message={`Delete "${deleteTarget?.name}"?`} />

      <ConfirmDialog open={bulkDeleteConfirm} onClose={() => setBulkDeleteConfirm(false)} onConfirm={async () => { setBulkDeleteConfirm(false); await handleBulkDelete() }}
        title="Delete Selected Products?" message={`Delete ${selected.length} selected products? This cannot be undone.`} confirmText={`Delete ${selected.length} Products`} />
    </div>
  )
}
