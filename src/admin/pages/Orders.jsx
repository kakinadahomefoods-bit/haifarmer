import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchOrders, updateOrder, fetchOrderHistory } from '../services/adminService'
import { Modal, DataTable, Pagination, Badge, Tabs } from '../../components/ui'
import { formatPrice } from '../../utils/helpers'

const STATUSES = ['placed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']
const STATUS_COLORS = {
  placed: 'blue', processing: 'amber', packed: 'purple', shipped: 'blue',
  out_for_delivery: 'amber', delivered: 'green', cancelled: 'red', returned: 'red'
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailOrder, setDetailOrder] = useState(null)
  const [history, setHistory] = useState([])
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ status: '', tracking_number: '', delivery_partner: '', estimated_delivery_date: '', status_note: '', internal_notes: '' })

  const load = async () => {
    setLoading(true)
    try {
      const result = await fetchOrders({ search, status: statusFilter, page })
      setOrders(result.data); setTotal(result.count)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [page, search, statusFilter])

  const openDetail = async (order) => {
    setDetailOrder(order)
    try {
      const h = await fetchOrderHistory(order.id)
      setHistory(h)
    } catch { setHistory([]) }
  }

  const openEdit = (order) => {
    setEditForm({
      status: order.status || '', tracking_number: order.tracking_number || '',
      delivery_partner: order.delivery_partner || '',
      estimated_delivery_date: order.estimated_delivery_date ? order.estimated_delivery_date.slice(0, 10) : '',
      status_note: '', internal_notes: order.internal_notes || ''
    })
    setEditModal(true)
  }

  const handleUpdate = async () => {
    try {
      await updateOrder(detailOrder?.id || editForm.id, editForm)
      toast.success('Order updated')
      setEditModal(false); load()
      if (detailOrder) { setDetailOrder({ ...detailOrder, ...editForm }); const h = await fetchOrderHistory(detailOrder.id); setHistory(h) }
    } catch (e) { toast.error(e.message) }
  }

  const getStatusBadge = (status) => {
    const labels = { placed: 'Placed', processing: 'Processing', packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned' }
    return <Badge color={STATUS_COLORS[status] || 'slate'}>{labels[status] || status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Orders ({total})</h1>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="rounded-lg border border-slate-200 px-4 py-2 text-sm w-64" />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0) }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition border ${
              statusFilter === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}>
            {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'Order ID', render: r => <span className="font-mono text-xs">{r.id?.slice(0, 8)}...</span> },
          { key: 'customer', label: 'Customer', render: r => r.customer_name || r.customer_phone || '—' },
          { key: 'total_amount', label: 'Total', render: r => formatPrice(r.total_amount) },
          { key: 'status', label: 'Status', render: r => getStatusBadge(r.status) },
          { key: 'payment', label: 'Payment', render: r => r.is_cod ? <Badge color="blue">COD</Badge> : <Badge color="green">Paid</Badge> },
          { key: 'tracking', label: 'Tracking', render: r => r.tracking_number || '—' },
          { key: 'created_at', label: 'Date', render: r => new Date(r.created_at).toLocaleDateString() },
          { key: 'actions', label: '', render: r => <div className="flex gap-1"><button onClick={() => { openDetail(r); openEdit(r) }} className="text-xs font-semibold text-brand-600">Update</button></div> }
        ]}
        data={orders}
        loading={loading}
        onRowClick={openDetail}
      />

      <Pagination page={page} total={total} limit={20} onChange={setPage} />

      {/* Detail Modal */}
      <Modal open={!!detailOrder && !editModal} onClose={() => setDetailOrder(null)} title={`Order ${detailOrder?.id?.slice(0, 8)}`} size="lg">
        {detailOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Customer</p>
                <p className="font-semibold">{detailOrder.customer_name || '—'}</p>
                <p className="text-sm text-slate-600">{detailOrder.customer_phone || '—'}</p>
                <p className="text-sm text-slate-600">{detailOrder.customer_address || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
                <div className="mt-1">{getStatusBadge(detailOrder.status)}</div>
                <p className="mt-2 text-xs font-semibold text-slate-500 uppercase">Payment</p>
                <p className="font-semibold">{detailOrder.is_cod ? 'Cash on Delivery' : 'Prepaid'}</p>
                <p className="text-sm">Total: {formatPrice(detailOrder.total_amount)}</p>
              </div>
            </div>

            {/* Timeline */}
            {history.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Timeline</p>
                <div className="space-y-2">
                  {history.map(h => (
                    <div key={h.id} className="flex items-start gap-3 text-sm">
                      <div className="mt-1 h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                      <div>
                        <p className="font-semibold capitalize">{h.status.replace(/_/g, ' ')}</p>
                        {h.note && <p className="text-slate-500">{h.note}</p>}
                        <p className="text-xs text-slate-400">{new Date(h.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <button onClick={() => { setDetailOrder(null); openEdit(detailOrder) }} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Update Order</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Update Order" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tracking Number</label>
              <input value={editForm.tracking_number} onChange={e => setEditForm({ ...editForm, tracking_number: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Delivery Partner</label>
              <input value={editForm.delivery_partner} onChange={e => setEditForm({ ...editForm, delivery_partner: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g. Delhivery, India Post" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Estimated Delivery Date</label>
              <input type="date" value={editForm.estimated_delivery_date} onChange={e => setEditForm({ ...editForm, estimated_delivery_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status Note</label>
              <input value={editForm.status_note} onChange={e => setEditForm({ ...editForm, status_note: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Optional note" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Internal Notes</label>
            <textarea value={editForm.internal_notes} onChange={e => setEditForm({ ...editForm, internal_notes: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setEditModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={handleUpdate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Update Order</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
