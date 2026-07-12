import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchDeliverySettings, updateDeliverySettings, fetchLocationFees, upsertLocationFee, deleteLocationFee } from '../services/adminService'
import { Modal, ConfirmDialog, Toggle } from '../../components/ui'

export default function AdminDelivery() {
  const [form, setForm] = useState({
    free_delivery_enabled: true, free_delivery_min_amount: 1499, default_delivery_charge: 0,
    same_day_delivery: false, express_delivery: false, pickup_enabled: false, pickup_address: '',
    cod_enabled: true, estimated_delivery_days: 3
  })
  const [locations, setLocations] = useState([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false)
  const [locationModal, setLocationModal] = useState(false); const [locForm, setLocForm] = useState({ location: '', pincode: '', delivery_charge: 0, estimated_days: 3, is_active: true })
  const [editingLoc, setEditingLoc] = useState(null); const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    Promise.all([fetchDeliverySettings(), fetchLocationFees()]).then(([d, l]) => {
      if (d) setForm(d); setLocations(l); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const save = async () => { setSaving(true); try { await updateDeliverySettings(form); toast.success('Delivery settings saved') } catch (e) { toast.error(e.message) }; setSaving(false) }
  const openLocModal = (item) => {
    if (item) { setEditingLoc(item); setLocForm({ ...item }) } else { setEditingLoc(null); setLocForm({ location: '', pincode: '', delivery_charge: 0, estimated_days: 3, is_active: true }) }
    setLocationModal(true)
  }
  const saveLocation = async () => {
    if (!locForm.location) { toast.error('Location is required'); return }
    try { await upsertLocationFee(editingLoc ? { ...locForm, id: editingLoc.id } : locForm); toast.success('Saved'); setLocationModal(false); setLocations(await fetchLocationFees()) } catch (e) { toast.error(e.message) }
  }
  const handleDeleteLoc = async () => {
    try { await deleteLocationFee(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); setLocations(await fetchLocationFees()) } catch (e) { toast.error(e.message) }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Delivery Settings</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-semibold mb-1">Free Delivery Min Amount (₹)</label><input type="number" value={form.free_delivery_min_amount} onChange={e => setForm({...form, free_delivery_min_amount: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-semibold mb-1">Default Delivery Charge (₹)</label><input type="number" value={form.default_delivery_charge} onChange={e => setForm({...form, default_delivery_charge: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-semibold mb-1">Estimated Delivery (days)</label><input type="number" value={form.estimated_delivery_days} onChange={e => setForm({...form, estimated_delivery_days: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-semibold mb-1">Pickup Address</label><input value={form.pickup_address} onChange={e => setForm({...form, pickup_address: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2"><Toggle checked={form.free_delivery_enabled} onChange={() => setForm({...form, free_delivery_enabled: !form.free_delivery_enabled})} /><span className="text-sm">Free Delivery</span></div>
          <div className="flex items-center gap-2"><Toggle checked={form.same_day_delivery} onChange={() => setForm({...form, same_day_delivery: !form.same_day_delivery})} /><span className="text-sm">Same Day Delivery</span></div>
          <div className="flex items-center gap-2"><Toggle checked={form.express_delivery} onChange={() => setForm({...form, express_delivery: !form.express_delivery})} /><span className="text-sm">Express Delivery</span></div>
          <div className="flex items-center gap-2"><Toggle checked={form.pickup_enabled} onChange={() => setForm({...form, pickup_enabled: !form.pickup_enabled})} /><span className="text-sm">Pickup Option</span></div>
          <div className="flex items-center gap-2"><Toggle checked={form.cod_enabled} onChange={() => setForm({...form, cod_enabled: !form.cod_enabled})} /><span className="text-sm">Cash on Delivery</span></div>
        </div>
        <div className="flex justify-end pt-4 border-t"><button onClick={save} disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Save Settings'}</button></div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Location-wise Delivery Fees ({locations.length})</h2>
          <button onClick={() => openLocModal(null)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">+ Add Location</button>
        </div>
        {locations.length === 0 ? (
          <p className="text-sm text-slate-500">No location fees configured. Add one to set custom delivery charges by area.</p>
        ) : (
          <div className="space-y-2">
            {locations.map(loc => (
              <div key={loc.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div><span className="font-semibold text-sm">{loc.location}</span>{loc.pincode && <span className="text-xs text-slate-500 ml-2">({loc.pincode})</span>}</div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">₹{loc.delivery_charge}</span>
                  <span className="text-xs text-slate-500">{loc.estimated_days}d</span>
                  <button onClick={() => openLocModal(loc)} className="text-xs font-semibold text-blue-600">Edit</button>
                  <button onClick={() => setDeleteTarget(loc)} className="text-xs font-semibold text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={locationModal} onClose={() => setLocationModal(false)} title={editingLoc ? 'Edit Location Fee' : 'Add Location Fee'} size="sm">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-1">Location *</label><input value={locForm.location} onChange={e => setLocForm({...locForm, location: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-semibold mb-1">Pincode</label><input value={locForm.pincode} onChange={e => setLocForm({...locForm, pincode: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Delivery Charge (₹)</label><input type="number" value={locForm.delivery_charge} onChange={e => setLocForm({...locForm, delivery_charge: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold mb-1">Est. Days</label><input type="number" value={locForm.estimated_days} onChange={e => setLocForm({...locForm, estimated_days: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex items-center gap-2"><Toggle checked={locForm.is_active} onChange={() => setLocForm({...locForm, is_active: !locForm.is_active})} /><span className="text-sm">Active</span></div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setLocationModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={saveLocation} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteLoc} title="Delete Location Fee?" message={`Delete fee for "${deleteTarget?.location}"?`} />
    </div>
  )
}
