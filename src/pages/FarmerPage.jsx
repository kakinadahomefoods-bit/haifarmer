import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { publicApi } from '../services/api'

export default function FarmerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const qrId = searchParams.get('qr')
  const [valid, setValid] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', crop: '', address: '', message: '', request_type: 'product' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (qrId) {
      publicApi.get(`/qr/${qrId}`).then(qr => {
        if (qr?.is_active) { setValid(true); publicApi.post('/qr/scan', { qr_id: qrId }).catch(() => {}) }
        else setValid(false)
      }).catch(() => setValid(false))
    }
  }, [qrId])

  if (!qrId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🌾</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Farmer Connect</h1>
          <p className="text-slate-600 mb-4">Scan the QR code from your farmer package to access this page.</p>
          <button onClick={() => navigate('/')} className="text-brand-600 font-semibold hover:underline">Go to Home</button>
        </div>
      </div>
    )
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid QR Code</h1>
          <p className="text-slate-600">This QR code is no longer active. Please contact the admin for a new one.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) { toast.error('Name and phone are required'); return }
    setSubmitting(true)
    try {
      await publicApi.post('/farmer-requests', {
        name: form.name, email: form.email, phone: form.phone, address: form.address,
        crop: form.crop, message: form.message
      })
      setSubmitted(true)
    } catch (e) { toast.error(e.message) }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Submitted Successfully!</h1>
          <p className="text-slate-600 mb-4">Thank you for reaching out. Our team will contact you soon.</p>
          <button onClick={() => navigate('/')} className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white">Back to Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌾</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Farmer Connect</h1>
          <p className="text-slate-600 mt-2">Register your details and we'll get in touch</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Your name" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone *</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Phone number" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Email address" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Crop / Product</label>
              <input value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="e.g., Millets, Vegetables" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Address / Village</label>
            <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Your address" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Enquiry Type</label>
            <select value={form.request_type} onChange={e => setForm({...form, request_type: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm">
              <option value="product">Product Supply / Sell Crops</option>
              <option value="bulk">Bulk Order / Partnership</option>
              <option value="harvest">Share Harvest Details</option>
              <option value="other">Other Enquiry</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
            <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Tell us more..." />
          </div>
          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white hover:bg-brand-700 transition disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </div>
  )
}
