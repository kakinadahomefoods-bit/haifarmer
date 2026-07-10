import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { fetchSiteAssets } from '../services/siteAssetService'
import { validateCoupon } from '../services/couponService'
import { formatPrice } from '../utils/helpers'
import { toast } from 'react-toastify'

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeFromCart, totals, coupon, setCoupon } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [siteAssets, setSiteAssets] = useState({ freeDeliveryThreshold: 2599 })

  useEffect(() => {
    fetchSiteAssets().then(data => {
      setSiteAssets({ freeDeliveryThreshold: Number(data?.free_delivery_threshold ?? 2599) })
    }).catch(() => {})
  }, [])

  const baseTotal = totals?.baseTotal ?? 0
  const discountTotal = totals?.discountTotal ?? 0
  const finalTotal = totals?.finalTotal ?? 0
  const couponDiscount = totals?.couponDiscount ?? 0

  const freeDeliveryThreshold = siteAssets.freeDeliveryThreshold || 2599
  const isFreeDelivery = baseTotal >= freeDeliveryThreshold
  const amountNeeded = Math.max(0, freeDeliveryThreshold - baseTotal)

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponInput.trim()) return toast.error('Enter a coupon code')
    setApplying(true)
    try {
      const result = await validateCoupon(couponInput.trim(), baseTotal)
      setCoupon(result)
      toast.success('Coupon applied!')
    } catch (err) {
      toast.error(err.message)
      setCoupon(null)
    }
    setApplying(false)
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!cartItems.length) { toast.error('Cart is empty'); return }
    setPlacing(true)

    const itemsList = cartItems.map(item => {
      const name = item.product?.name || item.bundle?.bundle_name || 'Item'
      const weight = item.variant?.weight_label ? ` (${item.variant.weight_label})` : ''
      const price = item.variant?.price || item.bundle?.bundle_price || item.variant_price || 0
      return `${item.quantity}x ${name}${weight} @ ₹${price} = ₹${price * item.quantity}`
    }).join('\n')

    const deliveryStr = isFreeDelivery ? 'Free' : 'Extra'
    const message = `
Hi HAiFarmer! 

I'd like to place an order:

*Items:*
${itemsList}

*Subtotal:* ₹${baseTotal}
${discountTotal > 0 ? `*Product Discounts:* -₹${discountTotal}\n` : ''}${coupon ? `*Coupon Code:* ${coupon.coupon_code}\n*Coupon Discount:* -₹${couponDiscount}\n` : ''}*Delivery Charges:* ${deliveryStr}
*Order Total:* ₹${finalTotal}

Please confirm my order and provide delivery instructions.
    `.trim()

    try {
      const url = `https://wa.me/9709704563?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')
      toast.success('Opening WhatsApp with your order details!')
    } catch {
      toast.error('Failed to open WhatsApp. Please try again.')
    }
    setPlacing(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr,0.8fr]">
        {/* Left - Cart items */}
        <section className="md:rounded-3xl md:border md:border-slate-200 md:bg-white md:p-0 md:shadow-sm">
          <div className="p-4 md:p-6 md:pb-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Checkout</h1>
            <p className="mt-1 text-slate-500 text-sm md:text-base">Review your items and place your order via WhatsApp.</p>
          </div>
          <div className="mt-3 md:mt-4 space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
            {cartItems.length > 0 ? (
              <div className="space-y-3">
                {cartItems.map(item => {
                  const name = item.product?.name || item.bundle?.bundle_name
                  const weight = item.variant?.weight_label ? ` (${item.variant.weight_label})` : ''
                  const subtitle = (item.product?.farmer_name || item.bundle?.bundle_name || '') + weight
                  const price = (item.variant?.price || item.bundle?.bundle_price || 0) * item.quantity
                  return (
                    <div key={item.id || `${item.product_id}-${item.bundle_id}`} className="relative rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
                      <button onClick={() => removeFromCart(item.id)} className="absolute right-3 top-3 text-brand-600 hover:text-brand-700 md:text-slate-400 md:hover:text-slate-600 font-bold">&times;</button>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex items-center gap-3">
                          <img src={item.product?.image_url || item.bundle?.bundle_image_url} alt={name} className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover border" />
                          <div className="flex-1 min-w-0">
                            <h3 className="truncate text-xs sm:text-base font-semibold text-brand-800">{name}</h3>
                            <p className="mt-0.5 text-[11px] sm:text-sm text-slate-500 truncate">{subtitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                          <div className="rounded-full bg-slate-50 px-2 py-1 flex items-center gap-2 text-xs">
                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="text-brand-800 px-2">&minus;</button>
                            <div className="px-2 font-semibold text-sm">{String(item.quantity).padStart(2, '0')}</div>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-brand-800 px-2">+</button>
                          </div>
                          <div className="text-sm font-semibold text-brand-800">{formatPrice(price)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                <p>Your cart is empty</p>
              </div>
            )}

            {/* Mobile CTA */}
            <div className="md:hidden">
              <div className="fixed left-0 right-0 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-50 flex items-center justify-center">
                <button onClick={handlePlaceOrder} disabled={placing || !cartItems.length} className="mx-4 w-[calc(100%-48px)] rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  💬 {placing ? 'Opening...' : 'Place Order via WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right - Order summary */}
        <aside className="rounded-3xl border border-slate-200 bg-white p-0 shadow-sm flex flex-col">
          <div className="p-4 md:p-6">
            <h2 className="text-base md:text-xl font-semibold text-slate-900">Order summary</h2>

            <div className="mt-4 pt-4 border-t border-slate-200">
              {coupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-700 font-semibold text-sm">✓ Coupon Applied</p>
                      <p className="text-emerald-600 text-xs mt-1">{coupon.coupon_code}</p>
                    </div>
                    <button onClick={() => { setCoupon(null); setCouponInput('') }} className="text-emerald-700 hover:text-emerald-900 font-bold">&times;</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input type="text" value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Enter coupon code" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  <button type="submit" disabled={applying || !couponInput.trim()} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {applying ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-4 space-y-2 text-slate-700 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(baseTotal)}</span></div>
              {discountTotal > 0 && <div className="flex justify-between text-emerald-600"><span>Product discounts</span><span>-{formatPrice(discountTotal)}</span></div>}
              {coupon && <div className="flex justify-between text-emerald-600"><span>Coupon discount</span><span>-{formatPrice(couponDiscount)}</span></div>}
              <div className="flex justify-between text-slate-600"><span>Delivery charges</span><span>{isFreeDelivery ? 'Free' : 'Extra'}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-semibold"><span>Total to pay</span><span>{formatPrice(finalTotal)}</span></div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              {isFreeDelivery ? (
                <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200">
                  <p className="text-emerald-700 font-semibold text-sm">✓ Free delivery unlocked!</p>
                  <p className="text-emerald-600 text-xs mt-1">Your order qualifies for free delivery</p>
                </div>
              ) : (
                <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                  <p className="text-blue-700 font-semibold text-sm">Free delivery on orders above ₹{freeDeliveryThreshold}</p>
                  <p className="text-blue-600 text-xs mt-1">Add {formatPrice(amountNeeded)} more to unlock free delivery</p>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block bg-slate-50 p-6 border-t border-slate-100">
            <button onClick={handlePlaceOrder} disabled={placing || !cartItems.length} className="w-full rounded-2xl bg-green-600 px-6 py-4 text-sm font-semibold text-white hover:bg-green-700 shadow disabled:opacity-50 disabled:cursor-not-allowed">
              💬 {placing ? 'Opening...' : 'Place Order via WhatsApp'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
