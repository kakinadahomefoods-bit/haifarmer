import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice, getDiscountedPrice, placeholderImage } from '../utils/helpers'

export default function BundleCard({ bundle }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
  const bundlePrice = Number(bundle.bundle_price) || 0
  const bundleDiscount = Number(bundle.bundle_discount_percent) || 0
  const discountedPrice = getDiscountedPrice(bundlePrice, bundleDiscount)
  const hasDiscount = bundleDiscount > 0
  const items = bundle.bundle_items || []

  const cartItem = cartItems.find(ci => ci.bundle_id === bundle.id)
  const inCartQuantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    addToCart({
      bundle_id: bundle.id,
      quantity: 1,
      bundle
    })
  }

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image section */}
        <div className="relative md:w-80 shrink-0">
          <Link to={`/combos/${bundle.id}`}>
            <div className="aspect-[4/3] md:aspect-auto md:h-full w-full">
              <img
                src={bundle.bundle_image_url || placeholderImage}
                alt={bundle.bundle_name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </Link>
          <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            BEST VALUE
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-slate-900/70 px-2 py-0.5 text-[11px] font-bold text-white">
            {items.length} items
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <Link to={`/combos/${bundle.id}`}>
            <h3 className="text-lg font-bold text-slate-900 hover:text-brand-700 transition">
              {bundle.bundle_name}
            </h3>
          </Link>

          {bundle.bundle_description && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{bundle.bundle_description}</p>
          )}

          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 border border-green-200">
              100% Natural
            </span>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 border border-green-200">
              Chemical Free
            </span>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 border border-green-200">
              Direct from Farmers
            </span>
          </div>

          {/* Items preview */}
          <div className="mt-3 space-y-1">
            {items.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="h-1 w-1 rounded-full bg-brand-400" />
                <span>{item.product?.name || 'Item'} {item.variant?.weight_label ? `(${item.variant.weight_label})` : ''}</span>
              </div>
            ))}
            {items.length > 3 && (
              <Link to={`/combos/${bundle.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                View all {items.length} products →
              </Link>
            )}
          </div>

          {/* Price & add to cart */}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">{formatPrice(discountedPrice)}</span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">{formatPrice(bundlePrice)}</span>
                )}
              </div>
              {hasDiscount && (
                <span className="text-xs font-semibold text-brand-600">
                  Save {formatPrice(bundlePrice - discountedPrice)} ({bundleDiscount}% OFF)
                </span>
              )}
              <div className="text-[10px] text-slate-400">+ shipping cost</div>
            </div>

            <div className="flex items-center gap-2">
              {inCartQuantity > 0 ? (
                <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                  <button
                    onClick={() => {
                      if (inCartQuantity <= 1) removeFromCart(cartItem.id)
                      else updateQuantity(cartItem.id, inCartQuantity - 1)
                    }}
                    className="flex h-9 w-9 items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100 transition rounded-l-xl"
                  >
                    -
                  </button>
                  <span className="min-w-[28px] text-center text-sm font-semibold text-slate-900">
                    {String(inCartQuantity).padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => updateQuantity(cartItem.id, inCartQuantity + 1)}
                    className="flex h-9 w-9 items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100 transition rounded-r-xl"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 transition active:scale-95"
                >
                  Add to cart
                </button>
              )}
              {inCartQuantity > 0 && (
                <button
                  onClick={() => removeFromCart(cartItem.id)}
                  className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition border border-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
