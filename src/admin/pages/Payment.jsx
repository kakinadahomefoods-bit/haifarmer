import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchPaymentSettings, updatePaymentSettings } from '../services/adminService'
import { Toggle } from '../../components/ui'

export default function AdminPayment() {
  const [form, setForm] = useState({
    active_gateway: 'whatsapp', razorpay_key: '', razorpay_secret: '', razorpay_enabled: false,
    whatsapp_number: '919909904563', whatsapp_message_template: '', whatsapp_enabled: true
  })
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPaymentSettings().then(d => { if (d) setForm(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try { await updatePaymentSettings(form); toast.success('Payment settings saved') } catch (e) { toast.error(e.message) }
    setSaving(false)
  }

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Payment Settings</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Active Gateway</h2>
          <div className="flex gap-4">
            <button onClick={() => setForm({...form, active_gateway: 'whatsapp'})} className={`flex-1 rounded-xl border-2 p-4 text-center transition ${form.active_gateway === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
              <span className="text-2xl">💬</span>
              <p className="font-semibold text-sm mt-1">WhatsApp Orders</p>
              <p className="text-xs text-slate-500">Manual order via WhatsApp</p>
            </button>
            <button onClick={() => setForm({...form, active_gateway: 'razorpay'})} className={`flex-1 rounded-xl border-2 p-4 text-center transition ${form.active_gateway === 'razorpay' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
              <span className="text-2xl">💳</span>
              <p className="font-semibold text-sm mt-1">Razorpay</p>
              <p className="text-xs text-slate-500">Online payments</p>
            </button>
          </div>
        </div>
        {form.active_gateway === 'razorpay' && (
          <div className="space-y-4 border-t pt-4">
            <h2 className="font-semibold text-slate-900">Razorpay Configuration</h2>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">API Key</label><input value={form.razorpay_key} onChange={e => setForm({...form, razorpay_key: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="rzp_live_..." /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Secret Key</label><input value={form.razorpay_secret} onChange={e => setForm({...form, razorpay_secret: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="..." /></div>
            <div className="flex items-center gap-2"><Toggle checked={form.razorpay_enabled} onChange={() => setForm({...form, razorpay_enabled: !form.razorpay_enabled})} /><span className="text-sm">Enable Razorpay</span></div>
          </div>
        )}
        {form.active_gateway === 'whatsapp' && (
          <div className="space-y-4 border-t pt-4">
            <h2 className="font-semibold text-slate-900">WhatsApp Configuration</h2>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp Number (with country code, no +)</label><input value={form.whatsapp_number} onChange={e => setForm({...form, whatsapp_number: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="919909904563" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Message Template</label><textarea value={form.whatsapp_message_template} onChange={e => setForm({...form, whatsapp_message_template: e.target.value})} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-xs" placeholder="New Order from {customer_name}..." /><p className="text-xs text-slate-400 mt-1">Available variables: {'{customer_name}'}, {'{items}'}, {'{total}'}, {'{address}'}, {'{phone}'}, {'{payment_method}'}</p></div>
            <div className="flex items-center gap-2"><Toggle checked={form.whatsapp_enabled} onChange={() => setForm({...form, whatsapp_enabled: !form.whatsapp_enabled})} /><span className="text-sm">Enable WhatsApp Orders</span></div>
          </div>
        )}
        <div className="flex justify-end pt-4 border-t">
          <button onClick={save} disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </div>
    </div>
  )
}
