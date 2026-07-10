import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { fetchFarmers } from '../services/farmerService'
import { placeholderImage } from '../utils/helpers'
import { toast } from 'react-toastify'

function CartIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
      <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2" />
    </svg>
  )
}

export default function Farmers() {
  const navigate = useNavigate()
  const { cartItems } = useCart()
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCrop, setSelectedCrop] = useState('all')

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchFarmers()
        setFarmers(data)
      } catch (e) {
        toast.error(e.message || 'Failed to load farmers')
      }
      setLoading(false)
    }
    load()
  }, [])

  const crops = ['all', ...new Set(farmers.map(f => f.crop).filter(Boolean))]
  const filtered = selectedCrop === 'all' ? farmers : farmers.filter(f => f.crop === selectedCrop)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Our Farmers</h1>
        <p className="mt-2 text-slate-600">Meet the tribal farmers behind your natural groceries</p>
      </div>

      {/* Crop filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {crops.map(crop => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition border ${
              selectedCrop === crop
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            {crop === 'all' ? 'All Farmers' : crop}
          </button>
        ))}
      </div>

      {/* Farmer grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-3xl bg-slate-100 h-72" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-slate-500 font-semibold">No farmers found</p>
            <p className="text-slate-400 text-sm mt-1">Check back soon for more farmers</p>
          </div>
        ) : (
          filtered.map(farmer => (
            <div key={farmer.id} className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="relative overflow-hidden h-48">
                <img
                  src={farmer.image_url || placeholderImage}
                  alt={farmer.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-slate-900">{farmer.name}</h3>
                <p className="mt-1 text-sm text-slate-600">🌾 {farmer.crop}</p>
                {farmer.address && <p className="mt-1 text-xs text-slate-500">📍 {farmer.address}</p>}
                <div className="mt-3 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 inline-block border border-green-200">
                  🌧️ Rainwater-fed • No chemicals • Sustainable
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats bar */}
      <div className="mt-12 rounded-3xl bg-gradient-to-r from-brand-50 to-green-50 border border-brand-100 p-6 sm:p-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-brand-700">{farmers.length}</p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Active Farmers</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-brand-700">{crops.length - 1}</p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Different Crops</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-brand-700">100%</p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Natural Farming</p>
          </div>
        </div>
      </div>

      {/* Floating cart */}
      <button type="button" onClick={() => navigate('/checkout')} className="fixed bottom-[68px] right-4 z-50 inline-flex h-14 w-14 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_14px_28px_rgba(22,163,74,0.35)] transition hover:-translate-y-1 hover:bg-brand-700 sm:bottom-6 sm:right-8 sm:h-16 sm:w-16" aria-label="Open shopping cart">
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{cartCount}</span>}
      </button>
    </div>
  )
}
