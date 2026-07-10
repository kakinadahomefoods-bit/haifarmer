import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import BundleCard from '../components/BundleCard'
import { fetchBundles } from '../services/bundleService'
import { toast } from 'react-toastify'

function CartIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
      <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2" />
    </svg>
  )
}

export default function Bundles() {
  const navigate = useNavigate()
  const { cartItems } = useCart()
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await fetchBundles()
        setBundles(data)
      } catch (e) {
        toast.error(e.message || 'Failed to load combos')
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Combo offers</h1>
          <p className="mt-2 text-slate-600">Combo savings with curated HAiFarmer combos for fast checkout.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 h-80" />
          ))
        ) : (
          bundles.map(bundle => <BundleCard key={bundle.id} bundle={bundle} />)
        )}
      </div>

      {/* Floating cart */}
      <button type="button" onClick={() => navigate('/checkout')} className="fixed bottom-[68px] right-4 z-50 inline-flex h-14 w-14 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_14px_28px_rgba(22,163,74,0.35)] transition hover:-translate-y-1 hover:bg-brand-700 sm:bottom-6 sm:right-8 sm:h-16 sm:w-16" aria-label="Open shopping cart">
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{cartCount}</span>}
      </button>
    </div>
  )
}
