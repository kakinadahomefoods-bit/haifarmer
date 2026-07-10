import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Password reset email sent!')
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email')
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Forgot Password</h1>
        {sent ? (
          <div className="text-center">
            <p className="text-emerald-600 font-semibold mb-4">Password reset email sent! Check your inbox.</p>
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="your@email.com" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 transition">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-slate-600">
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
