import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchShippingSettings, updateShippingSettings, fetchLocationFees, upsertLocationFee, deleteLocationFee } from '../services/adminService'
import { Modal, ConfirmDialog, Toggle } from '../../components/ui'

export default function AdminShipping() {
  const [settings, setSettings] = useState({
    free_delivery_enabled: true, free_delivery_min_amount: 1499,
    default_delivery_charge: 0, same_day_delivery: false,
    express_delivery: false, cod_available: true, estimated_delivery_days: 3
  })
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationModal, setLocationModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [locationForm, setLocationForm] = useState({ location_name: '', pincode: '', delivery_charge: 0, estimated_days: 3 })

  const load = async () => {
    setLoading(true)
    try {
      const [s, l] = await Promise.all([fetchShippingSettings(), fetchLocationFees()])
      if (s) setSettings(s)
      setLocations(l)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSaveSettings = async () => {
    try {
      await updateShippingSettings(settings)
      toast.success('Shipping settings updated')
    } catch (e) { toast.error(e.message) }
  }

  const handleSaveLocation = async () => {
    if (!locationForm.location_name) { toast.error('Location name required'); return }
    try {
      await upsertLocationFee(locationForm)
      toast.success('Location fee saved')
      setLocationModal(false)
      load()
    } catch (e) { toast.error(e.message) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Shipping Settings</h1>

      {/* Main settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Delivery Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Free Delivery Min Amount (₹)</label>
            <input type="number" value={settings.free_delivery_min_amount} onChange={e => setSettings({ ...settings, free_delivery_min_amount: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Default Delivery Charge (₹)</label>
            <input type="number" value={settings.default_delivery_charge} onChange={e => setSettings({ ...settings, default_delivery_charge: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Estimated Delivery Days</label>
            <input type="number" value={settings.estimated_delivery_days} onChange={e => setSettings({ ...settings, estimated_delivery_days: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-3 pt-6">
            <Toggle checked={settings.free_delivery_enabled} onChange={() => setSettings({ ...settings, free_delivery_enabled: !settings.free_delivery_enabled })} label="Enable Free Delivery" />
            <Toggle checked={settings.same_day_delivery} onChange={() => setSettings({ ...settings, same_day_delivery: !settings.same_day_delivery })} label="Same-Day Delivery" />
            <Toggle checked={settings.express_delivery} onChange={() => setSettings({ ...settings, express_delivery: !settings.express_delivery })} label="Express Delivery" />
            <Toggle checked={settings.cod_available} onChange={() => setSettings({ ...settings, cod_available: !settings.cod_available })} label="Cash on Delivery" />
          </div>
        </div>
        <button onClick={handleSaveSettings} className="mt-4 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">Save Settings</button>
      </div>

      {/* Location fees */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Location-wise Delivery Fees</h2>
          <button onClick={() => { setLocationForm({ location_name: '', pincode: '', delivery_charge: 0, estimated_days: 3 }); setLocationModal(true) }} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">+ Add Location</button>
        </div>
        {locations.length === 0 ? (
          <p className="text-sm text-slate-400">No location-specific fees configured</p>
        ) : (
          <div className="space-y-2">
            {locations.map(loc => (
              <div key={loc.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div>
                  <span className="font-semibold text-slate-700">{loc.location_name}</span>
                  {loc.pincode && <span className="ml-2 text-sm text-slate-400">({loc.pincode})</span>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">₹{loc.delivery_charge}</span>
                  <span className="text-sm text-slate-500">{loc.estimated_days} days</span>
                  <button onClick={() => { setLocationForm(loc); setLocationModal(true) }} className="text-xs font-semibold text-blue-600">Edit</button>
                  <button onClick={() => setDeleteTarget(loc)} className="text-xs font-semibold text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={locationModal} onClose={() => setLocationModal(false)} title={locationForm.id ? 'Edit Location' : 'Add Location'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Location Name *</label><input value={locationForm.location_name} onChange={e => setLocationForm({ ...locationForm, location_name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Pincode</label><input value={locationForm.pincode} onChange={e => setLocationForm({ ...locationForm, pincode: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Delivery Charge (₹)</label><input type="number" value={locationForm.delivery_charge} onChange={e => setLocationForm({ ...locationForm, delivery_charge: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Est. Days</label><input type="number" value={locationForm.estimated_days} onChange={e => setLocationForm({ ...locationForm, estimated_days: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setLocationModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={handleSaveLocation} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Save</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteLocationFee(deleteTarget.id).then(() => { toast.success('Deleted'); load() }).catch(e => toast.error(e.message))}
        title="Delete Location Fee?" message={`Delete fee for "${deleteTarget?.location_name}"?`} />
    </div>
  )
}
