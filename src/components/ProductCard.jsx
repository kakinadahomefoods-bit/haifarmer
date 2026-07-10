import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice, getDiscountedPrice, slugify, placeholderImage } from '../utils/helpers'

export default function ProductCard({ product, compact = false }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null
  )

  const basePrice = Number(product.base_price) || 0
  const discountPercent = Number(product.discount_percent) || 0
  const discountedPrice = getDiscountedPrice(basePrice, discountPercent)
  const hasDiscount = discountPercent > 0
  const variants = product.variants || []
  const currentPrice = selectedVariant ? Number(selectedVariant.price) : discountedPrice

  const cartItem = cartItems.find(
    ci => ci.product_id === product.id &&
          (selectedVariant ? ci.variant_id === selectedVariant.id : true)
  )
  const inCartQuantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      variant_id: selectedVariant?.id || null,
      quantity: 1,
      product,
      variant: selectedVariant
    })
  }

  return (
    <div className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* Image */}
      <Link to={`/products/${slugify(product.name)}`} className="block overflow-hidden rounded-2xl">
        <div className="relative aspect-[4/3] w-full">
          <img
            src={product.image_url || placeholderImage}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {hasDiscount && (
            <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="mt-3 flex flex-1 flex-col">
        <Link to={`/products/${slugify(product.name)}`}>
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-brand-700 transition">
            {product.name}
          </h3>
        </Link>

        {!hasDiscount && (
          <span className="mt-0.5 text-[11px] font-semibold text-brand-600">Farm fresh</span>
        )}

        {/* Variants */}
        {variants.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
                  selectedVariant?.id === v.id
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {v.weight_label}
              </button>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{formatPrice(currentPrice)}</span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">{formatPrice(basePrice)}</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">+ shipping cost</span>
        </div>

        {/* Add to cart */}
        <div className="mt-2">
          {inCartQuantity > 0 ? (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-1">
              <button
                onClick={() => {
                  if (inCartQuantity <= 1) removeFromCart(cartItem.id)
                  else updateQuantity(cartItem.id, inCartQuantity - 1)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                -
              </button>
              <span className="min-w-[24px] text-center text-sm font-semibold text-slate-900">
                {String(inCartQuantity).padStart(2, '0')}
              </span>
              <button
                onClick={() => updateQuantity(cartItem.id, inCartQuantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full rounded-xl bg-brand-600 py-2 text-sm font-bold text-white hover:bg-brand-700 transition active:scale-95"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
