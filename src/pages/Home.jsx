import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import BundleCard from '../components/BundleCard'
import { fetchProducts, fetchNewArrivals } from '../services/productService'
import { fetchComboBundles } from '../services/bundleService'
import { fetchCategories } from '../services/productService'
import { fetchSiteAssets, fetchBannerLinks } from '../services/siteAssetService'
import { placeholderImage } from '../utils/helpers'

function CartIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2" />
    </svg>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { cartItems } = useCart()
  const [products, setProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [bundles, setBundles] = useState([])
  const [categories, setCategories] = useState([])
  const [homeAssets, setHomeAssets] = useState({})
  const [bannerLinks, setBannerLinks] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const newArrivalsRef = useRef(null)

  const mainBannerKeys = ['home_main_banner_1_url', 'home_main_banner_2_url', 'home_main_banner_3_url', 'home_main_banner_4_url']

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    setIsMobile(mq.matches)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [prods, arrivals, comboBundles, cats, assets, links] = await Promise.all([
          fetchProducts().catch(() => []),
          fetchNewArrivals().catch(() => []),
          fetchComboBundles().catch(() => []),
          fetchCategories().catch(() => []),
          fetchSiteAssets().catch(() => ({})),
          fetchBannerLinks().catch(() => [])
        ])
        setProducts(prods)
        setNewArrivals(arrivals)
        setBundles(comboBundles)
        setCategories(cats)
        setHomeAssets(assets)
        const linkMap = {}
        links.forEach(l => { linkMap[l.banner_key] = l.link_url })
        setBannerLinks(linkMap)
      } catch (err) {
        console.error('Failed to load home data', err)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // Banner auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % 4)
    }, 2100)
    return () => clearInterval(timer)
  }, [])

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  const getBannerUrl = (key) => homeAssets[key] || ''
  const getBannerLink = (key) => bannerLinks[key] || ''

  const scrollNewArrivals = (direction) => {
    if (newArrivalsRef.current) {
      const scrollAmount = 280
      newArrivalsRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen">
      {/* Banner Section */}
      <section className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] lg:grid-cols-[2.2fr,0.85fr,0.6fr] gap-2 sm:gap-3">
          {/* Main banner carousel */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-100 aspect-[16/9] md:aspect-auto md:min-h-[300px] lg:min-h-[400px]">
            {mainBannerKeys.map((key, idx) => {
              const url = getBannerUrl(key)
              return (
                <a
                  key={key}
                  href={getBannerLink(key) || '#'}
                  target={getBannerLink(key) ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={`absolute inset-0 transition-opacity duration-600 ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transitionDuration: '600ms', transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }}
                >
                  <img
                    src={url || placeholderImage}
                    alt={`Main offer banner ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </a>
              )
            })}
          </div>

          {/* Middle banners */}
          <div className="hidden md:flex md:flex-col gap-2 sm:gap-3">
            <a
              href={getBannerLink('home_middle_top_banner') || '#'}
              target={getBannerLink('home_middle_top_banner') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex-1 overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-100 min-h-[140px] lg:min-h-[190px]"
            >
              <img
                src={getBannerUrl('home_middle_top_banner_url') || placeholderImage}
                alt="Top side offer banner"
                className="h-full w-full object-cover"
              />
            </a>
            <a
              href={getBannerLink('home_middle_bottom_banner') || '#'}
              target={getBannerLink('home_middle_bottom_banner') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex-1 overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-100 min-h-[140px] lg:min-h-[190px]"
            >
              <img
                src={getBannerUrl('home_middle_bottom_banner_url') || placeholderImage}
                alt="Bottom side offer banner"
                className="h-full w-full object-cover"
              />
            </a>
          </div>

          {/* Right story banner - hidden on mobile/tablet */}
          <a
            href={getBannerLink('home_right_story_banner') || '#'}
            target={getBannerLink('home_right_story_banner') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="hidden lg:block overflow-hidden rounded-3xl bg-slate-100 min-h-[400px]"
          >
            <img
              src={getBannerUrl('home_right_story_banner_url') || placeholderImage}
              alt="Farmer story banner"
              className="h-full w-full object-cover"
            />
          </a>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">New arrivals</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Naturally grown from tribal villages 🌱 Rainwater-fed 🌱 Minimal pollution
            </p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Browse all →
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-72 w-48 shrink-0 animate-pulse rounded-3xl bg-slate-100" />
            ))}
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No new arrivals selected yet. Mark products as new arrivals from the admin panel.
          </div>
        ) : (
          <div className="relative">
            {newArrivals.length > 5 && (
              <>
                <button
                  onClick={() => scrollNewArrivals(-1)}
                  className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-slate-200 text-slate-700 hover:text-slate-900 md:block"
                  aria-label="Scroll left"
                >
                  ‹
                </button>
                <button
                  onClick={() => scrollNewArrivals(1)}
                  className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-slate-200 text-slate-700 hover:text-slate-900 md:block"
                  aria-label="Scroll right"
                >
                  ›
                </button>
              </>
            )}
            <div
              ref={newArrivalsRef}
              className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
            >
              {newArrivals.map(product => (
                <div key={product.id} className="w-48 shrink-0 sm:w-52 md:w-56">
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Ad Banners */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <a
            href={getBannerLink('ad_banner_left') || '#'}
            target={getBannerLink('ad_banner_left') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-100 aspect-[2/1] sm:aspect-[3/1]"
          >
            <img
              src={getBannerUrl('ad_banner_left_url') || placeholderImage}
              alt="Advertisement banner for dry fruits"
              className="h-full w-full object-cover"
            />
          </a>
          <a
            href={getBannerLink('ad_banner_right') || '#'}
            target={getBannerLink('ad_banner_right') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-100 aspect-[2/1] sm:aspect-[3/1]"
          >
            <img
              src={getBannerUrl('ad_banner_right_url') || placeholderImage}
              alt="Advertisement banner for spices and masalas"
              className="h-full w-full object-cover"
            />
          </a>
        </div>
      </section>

      {/* Combos */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Combo's</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Curated bundles from tribal farms 🌱 Natural farming 🌱 Pure quality
            </p>
          </div>
          <Link to="/combos" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View bundles →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-3xl bg-slate-100" />
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No combos selected yet. Mark bundles as combos from the admin panel.
          </div>
        ) : (
          <div className="space-y-4">
            {bundles.map(bundle => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        )}
      </section>

      {/* Floating cart button */}
      <button
        type="button"
        onClick={() => navigate('/checkout')}
        className="fixed bottom-[68px] right-4 z-50 inline-flex h-14 w-14 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_14px_28px_rgba(22,163,74,0.35)] transition hover:-translate-y-1 hover:bg-brand-700 sm:bottom-6 sm:right-8 sm:h-16 sm:w-16"
        aria-label="Open shopping cart"
      >
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  )
}
