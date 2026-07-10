import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { fetchProductBySlug } from '../services/productService'
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

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProductBySlug(slug)
        setProduct(data)
        setSelectedVariant(data.variants?.[0] || null)
      } catch (e) {
        toast.error('Product not found')
        navigate('/products')
      }
      setLoading(false)
    }
    load()
  }, [slug, navigate])

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-32 w-32 animate-pulse rounded-3xl bg-slate-100" /></div>
  }

  if (!product) return null

  const basePrice = Number(product.base_price) || 0
  const discountPercent = Number(product.discount_percent) || 0
  const hasDiscount = discountPercent > 0
  const currentPrice = selectedVariant ? Number(selectedVariant.price) : (hasDiscount ? getDiscountedPrice(basePrice, discountPercent) : basePrice)

  const cartItem = cartItems.find(ci => ci.product_id === product.id && (selectedVariant ? ci.variant_id === selectedVariant.id : true))
  const inCartQuantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    addToCart({ product_id: product.id, variant_id: selectedVariant?.id || null, quantity: 1, product, variant: selectedVariant })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden bg-slate-100">
          <img src={product.image_url || placeholderImage} alt={product.name} className="h-full w-full object-cover" />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{product.name}</h1>
          {product.category && (
            <span className="mt-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 w-fit">{product.category}</span>
          )}

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{formatPrice(currentPrice)}</span>
            {hasDiscount && <span className="text-lg text-slate-400 line-through">{formatPrice(basePrice)}</span>}
            {hasDiscount && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">{discountPercent}% OFF</span>}
          </div>
          <span className="text-sm text-slate-400">+ shipping cost</span>

          {product.description && <p className="mt-4 text-slate-600">{product.description}</p>}

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-700">Select variant</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      selectedVariant?.id === v.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {v.weight_label} - {formatPrice(v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
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

      {/* Floating cart */}
      <button type="button" onClick={() => navigate('/checkout')} className="fixed bottom-[68px] right-4 z-50 inline-flex h-14 w-14 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_14px_28px_rgba(22,163,74,0.35)] transition hover:-translate-y-1 hover:bg-brand-700 sm:bottom-6 sm:right-8 sm:h-16 sm:w-16" aria-label="Open shopping cart">
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{cartCount}</span>}
      </button>
    </div>
  )
}
