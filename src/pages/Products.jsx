import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import { fetchProducts, fetchCategories } from '../services/productService'
import { toast } from 'react-toastify'

function CartIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
      <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2" />
    </svg>
  )
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { cartItems } = useCart()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState(
    (searchParams.get('category') || '').split(',').filter(Boolean)
  )
  const [selectedRatings, setSelectedRatings] = useState(
    (searchParams.get('rating') || '').split(',').map(Number).filter(Boolean)
  )
  const [sortOrder, setSortOrder] = useState('created_at.desc')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [loading, setLoading] = useState(true)

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [prods, cats] = await Promise.all([
          fetchProducts(searchQuery, sortOrder),
          fetchCategories()
        ])
        setProducts(prods)
        setCategories(cats)
      } catch (e) {
        toast.error(e.message || 'Failed to load products')
      }
      setLoading(false)
    }
    load()
    window.addEventListener('haifarmer:refresh-products', load)
    return () => window.removeEventListener('haifarmer:refresh-products', load)
  }, [searchQuery, sortOrder])

  useEffect(() => {
    const params = {}
    if (searchQuery) params.q = searchQuery
    if (selectedCategories.length) params.category = selectedCategories.join(',')
    if (selectedRatings.length) params.rating = selectedRatings.join(',')
    setSearchParams(params, { replace: true })
  }, [searchQuery, selectedCategories, selectedRatings, setSearchParams])

  const categoryCounts = useMemo(() => {
    const counts = {}
    categories.forEach(cat => {
      counts[cat.name] = products.filter(p => p.category === cat.name).length
    })
    return counts
  }, [categories, products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const catMatch = !selectedCategories.length || selectedCategories.includes(p.category)
      const rating = Number(p.rating ?? p.avg_rating ?? 4)
      const validRating = Number.isFinite(rating) ? Math.max(1, Math.min(5, Math.round(rating))) : 4
      const ratingMatch = !selectedRatings.length || selectedRatings.some(r => validRating >= r)
      return catMatch && ratingMatch
    })
  }, [products, selectedCategories, selectedRatings])

  useEffect(() => { setSearchInput(searchQuery) }, [searchQuery])

  const toggleCategory = (name) => {
    setSelectedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    )
  }

  const toggleRating = (rating) => {
    setSelectedRatings(prev =>
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    )
  }

  const clearAll = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedRatings([])
  }

  return (
    <div className="products-page-outer mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="hidden sm:block mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">Natural Groceries - Natural Food from Tribal Villages</h1>
        <p className="text-slate-600 text-lg mb-4">Shop natural vegetables, fruits, natural spices (pasupu, karam), natural pulses, and more. All naturally grown, rainwater-fed, pesticide-free with minimal pollution.</p>
        <p className="text-slate-600 text-sm">Browse our complete range of natural groceries including vegetables, fruits, spices, grains, and combo packs - all sourced directly from tribal farms with fair prices and fast delivery.</p>
      </div>

      {/* Mobile filter bar */}
      <div className="mobile-products-sticky sticky top-0 z-20 mb-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden max-h-[88px] overflow-hidden">
        <div className="flex items-center gap-2">
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search products"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={() => setSearchQuery(searchInput.trim())}
            className="rounded-xl bg-brand-600 px-2 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Search
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <select
            value={selectedCategories[0] || ''}
            onChange={e => setSelectedCategories(e.target.value ? [e.target.value] : [])}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900"
          >
            <option value="">All categories</option>
            {categories.map(cat => (
              <option key={cat.name || cat} value={cat.name || cat}>{cat.name || cat}</option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900"
          >
            <option value="created_at.desc">Newest</option>
            <option value="base_price.asc">Price low-high</option>
            <option value="base_price.desc">Price high-low</option>
          </select>
        </div>
      </div>

      {/* Main grid */}
      <div className="products-grid grid gap-6 lg:grid-cols-[280px,1fr]">
        {/* Sidebar filters - desktop */}
        <aside className="hidden h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:block">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort by</label>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="created_at.desc">Newest</option>
                <option value="base_price.asc">Price low-high</option>
                <option value="base_price.desc">Price high-low</option>
              </select>
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Clear all
            </button>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <h2 className="text-base font-semibold text-slate-900">Filters</h2>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Search products</label>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Categories</label>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat.name || cat} className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-700">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => toggleCategory(cat.name)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    {cat.name}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {categoryCounts[cat.name] || 0}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Rating</label>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <label key={rating} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedRatings.includes(rating)}
                    onChange={() => toggleRating(rating)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-amber-500">
                    {'★'.repeat(rating)}
                    <span className="text-slate-300">{'★'.repeat(5 - rating)}</span>
                  </span>
                  <span>& Up</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="products-scroll-area max-h-[calc(100vh-120px)] overflow-y-auto lg:max-h-none lg:overflow-visible">
          <div className="grid grid-cols-2 justify-items-stretch gap-4 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 w-full max-w-[170px] animate-pulse rounded-3xl border border-slate-200 bg-white p-6 sm:max-w-none" />
              ))
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="w-full">
                  <ProductCard product={product} compact />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SEO content */}
      <div className="mt-16 px-4 py-12 bg-gradient-to-b from-slate-50 to-white rounded-2xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Natural & Natural Food Products</h2>
          <div className="prose prose-sm max-w-none text-slate-700 space-y-4">
            <p>HAiFarmer brings you the finest natural groceries and natural food products directly from tribal villages. Our entire range includes naturally grown vegetables, fresh fruits, natural spices, and complete grocery essentials - all cultivated using sustainable rainwater-fed farming with minimal pollution.</p>
            <p>Shop natural vegetables like tomatoes, onions, potatoes, carrots, spinach, and broccoli. Browse our fresh natural fruits including bananas, apples, oranges, and seasonal produce. Find natural spices like <strong>pasupu (turmeric)</strong> and <strong>karam (red chili)</strong> that are naturally ground and chemical-free.</p>
            <p>Our natural grocery collection also includes natural rice, natural pulses (dal), natural tea, pure oils, natural grains, and pesticide-free produce. All combo packs combine value with variety - vegetable combos, spice packs, and mixed grocery bundles at special discounts.</p>
            <p>Every product is sourced directly from tribal farmers who practice traditional, sustainable agriculture. We guarantee rainwater-fed cultivation, minimal use of chemicals, and support for tribal communities. Experience farm-to-table freshness with HAiFarmer's commitment to natural farming and natural food quality.</p>
          </div>
        </div>
      </div>

      {/* Floating cart */}
      <button
        type="button"
        onClick={() => navigate('/checkout')}
        className="fixed bottom-[68px] right-4 z-50 inline-flex h-14 w-14 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_14px_28px_rgba(22,163,74,0.35)] transition hover:-translate-y-1 hover:bg-brand-700 sm:bottom-6 sm:right-8 sm:h-16 sm:w-16"
        aria-label="Open shopping cart"
      >
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{cartCount}</span>
        )}
      </button>
    </div>
  )
}
