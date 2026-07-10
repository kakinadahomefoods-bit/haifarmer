import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { fetchBundleById } from '../services/bundleService'
import { formatPrice, getDiscountedPrice, placeholderImage } from '../utils/helpers'
import { toast } from 'react-toastify'

function CartIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
      <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2" />
    </svg>
  )
}

export default function BundleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchBundleById(id)
        setBundle(data)
      } catch (e) {
        toast.error('Bundle not found')
        navigate('/combos')
      }
      setLoading(false)
    }
    load()
  }, [id, navigate])

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-32 w-32 animate-pulse rounded-3xl bg-slate-100" /></div>
  if (!bundle) return null

  const bundlePrice = Number(bundle.bundle_price) || 0
  const bundleDiscount = Number(bundle.bundle_discount_percent) || 0
  const discountedPrice = getDiscountedPrice(bundlePrice, bundleDiscount)
  const hasDiscount = bundleDiscount > 0
  const items = bundle.bundle_items || []

  const cartItem = cartItems.find(ci => ci.bundle_id === bundle.id)
  const inCartQuantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    addToCart({ bundle_id: bundle.id, quantity: 1, bundle })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="rounded-3xl overflow-hidden bg-slate-100">
          <img src={bundle.bundle_image_url || placeholderImage} alt={bundle.bundle_name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 w-fit">BEST VALUE</span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">{bundle.bundle_name}</h1>
          {bundle.bundle_description && <p className="mt-3 text-slate-600">{bundle.bundle_description}</p>}

          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">100% Natural</span>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">Chemical Free</span>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">Direct from Farmers</span>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{formatPrice(discountedPrice)}</span>
            {hasDiscount && <span className="text-lg text-slate-400 line-through">{formatPrice(bundlePrice)}</span>}
            {hasDiscount && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Save {formatPrice(bundlePrice - discountedPrice)} ({bundleDiscount}% OFF)</span>}
          </div>
          <span className="text-sm text-slate-400">+ shipping cost</span>

          <div className="mt-8">
            {inCartQuantity > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-slate-200">
                  <button onClick={() => { if (inCartQuantity <= 1) removeFromCart(cartItem.id); else updateQuantity(cartItem.id, inCartQuantity - 1) }} className="flex h-10 w-10 items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100">-</button>
                  <span className="min-w-[32px] text-center font-semibold">{String(inCartQuantity).padStart(2, '0')}</span>
                  <button onClick={() => updateQuantity(cartItem.id, inCartQuantity + 1)} className="flex h-10 w-10 items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100">+</button>
                </div>
                <button onClick={() => removeFromCart(cartItem.id)} className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 border border-red-200">Remove</button>
              </div>
            ) : (
              <button onClick={handleAddToCart} className="w-full sm:w-auto rounded-xl bg-brand-600 px-8 py-3 text-base font-bold text-white hover:bg-brand-700 transition active:scale-95">Add to Cart</button>
            )}
          </div>
        </div>
      </div>

      {/* Bundle items */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900 mb-4">What's in the bundle</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <img src={item.product?.image_url || placeholderImage} alt={item.product?.name} className="h-16 w-16 rounded-xl object-cover" />
              <div>
                <p className="font-semibold text-slate-900">{item.product?.name || 'Item'}</p>
                {item.variant?.weight_label && <p className="text-sm text-slate-500">{item.variant.weight_label}</p>}
                <p className="text-xs text-slate-400">Qty: {item.quantity || 1}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button type="button" onClick={() => navigate('/checkout')} className="fixed bottom-[68px] right-4 z-50 inline-flex h-14 w-14 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_14px_28px_rgba(22,163,74,0.35)] transition hover:-translate-y-1 hover:bg-brand-700 sm:bottom-6 sm:right-8 sm:h-16 sm:w-16" aria-label="Open shopping cart">
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{cartCount}</span>}
      </button>
    </div>
  )
}
