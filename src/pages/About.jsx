import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { fetchSiteAssets } from '../services/siteAssetService'
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

export default function About() {
  const navigate = useNavigate()
  const { cartItems } = useCart()
  const [assets, setAssets] = useState({
    about_heading: 'Tribal & Natural Farm Fresh',
    about_description: 'HAiFarmer connects families with naturally grown food from tribal villages. Our products are cultivated using rainwater and traditional farming methods with minimal pollution, ensuring pure, wholesome nutrition.',
    about_image_url: ''
  })

  useEffect(() => {
    let cancelled = false
    fetchSiteAssets()
      .then(data => {
        if (!cancelled) {
          setAssets({
            about_heading: data.about_heading || 'Tribal & Natural Farm Fresh',
            about_description: data.about_description || 'HAiFarmer connects families with naturally grown food from tribal villages. Our products are cultivated using rainwater and traditional farming methods with minimal pollution, ensuring pure, wholesome nutrition.',
            about_image_url: data.about_image_url || ''
          })
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  const values = [
    { icon: '🌱', title: 'Naturally Grown', description: 'Rainwater-fed crops with minimal pollution, grown in tribal villages' },
    { icon: '💧', title: 'Sustainable Practices', description: 'Natural farming methods that protect the environment and soil health' },
    { icon: '🏘️', title: 'Tribal Community', description: 'Sourced directly from tribal farmers supporting their livelihoods' },
    { icon: '🤝', title: 'Fair & Transparent', description: 'Direct partnership ensuring fair prices and honest value' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/30 to-white">
      {/* Hero */}
      <div className="mx-auto max-w-6xl px-2 py-8 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-12 items-center">
          <div className="flex flex-col justify-center order-2 md:order-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 mb-1 sm:mb-2">Our Story</p>
            <h1 className="text-xl sm:text-2xl md:text-5xl font-bold text-slate-900 leading-tight mb-3 sm:mb-6">{assets.about_heading}</h1>
            <p className="text-sm sm:text-base md:text-lg leading-6 sm:leading-8 text-slate-600 mb-2 sm:mb-4">{assets.about_description}</p>
            <p className="text-sm sm:text-base md:text-lg leading-6 sm:leading-8 text-slate-600">Every order directly supports tribal farming communities and preserves traditional agricultural knowledge while bringing you the cleanest, naturally grown produce.</p>
          </div>
          <div className="order-1 md:order-2">
            {assets.about_image_url ? (
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden h-56 sm:h-80 md:h-96 shadow-lg border border-brand-100/50 bg-slate-100">
                <img src={assets.about_image_url} alt="About section" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-brand-50 to-green-50 rounded-2xl sm:rounded-3xl h-56 sm:h-80 md:h-96 flex items-center justify-center shadow-lg border border-brand-100/50">
                <div className="text-center">
                  <p className="text-5xl sm:text-8xl mb-2 sm:mb-4">🌾</p>
                  <p className="text-base sm:text-xl font-semibold text-slate-900">Farm Fresh Quality</p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">From soil to table</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Our Promise */}
      <div className="mx-auto max-w-6xl px-2 py-8 sm:py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 mb-1 sm:mb-3">Our Promise</p>
          <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-4">Naturally Grown from Tribal Villages</h2>
          <p className="text-xs sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Rainwater-fed crops, minimal pollution, direct from tribal communities. Pure nature in every product.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {values.map((v, i) => (
            <div key={i} className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-slate-200 shadow-sm hover:shadow-lg hover:border-brand-200 transition duration-300">
              <div className="text-3xl sm:text-5xl mb-2 sm:mb-4 transform group-hover:scale-110 transition duration-300">{v.icon}</div>
              <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">{v.title}</h3>
              <p className="text-xs sm:text-base text-slate-600 leading-5 sm:leading-6">{v.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="bg-slate-50 py-8 sm:py-16 md:py-20 rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 md:mx-6 lg:mx-8 my-6 sm:my-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-8">
          <div className="text-center">
            <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-6">Our Mission</h2>
            <p className="text-xs sm:text-base md:text-lg leading-5 sm:leading-8 text-slate-700 mb-4 sm:mb-8">
              To make premium, farm-fresh groceries accessible to everyone while creating sustainable livelihoods for local farmers. We believe in connecting people directly with the source of their food and building a community where freshness, quality, and transparency are guaranteed.
            </p>
            <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row justify-center">
              <button onClick={() => navigate('/products')} className="inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-brand-600 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-md transition hover:bg-brand-700 active:scale-95">
                Shop Now
              </button>
              <button onClick={() => navigate('/products')} className="inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-brand-600 shadow-sm border border-slate-200 transition hover:bg-slate-50">
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sourcing Promise */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 md:mx-6 lg:mx-8 p-4 sm:p-8 md:p-12 my-6 sm:my-8">
        <div className="text-center">
          <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">Our Sourcing Promise</h2>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-8">
            <div>
              <p className="text-2xl sm:text-4xl mb-2 sm:mb-3">💧</p>
              <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">Rainwater Fed</h3>
              <p className="text-xs sm:text-base text-slate-700">Crops grown using natural rainwater, reducing chemical dependency and preserving water resources</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl mb-2 sm:mb-3">🏞️</p>
              <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">Tribal Villages</h3>
              <p className="text-xs sm:text-base text-slate-700">Direct partnership with tribal farming communities, preserving traditional knowledge and supporting local economies</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl mb-2 sm:mb-3">🌍</p>
              <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">Low Pollution</h3>
              <p className="text-xs sm:text-base text-slate-700">Minimal use of pesticides and chemicals, protecting soil health and the environment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Range */}
      <div className="mx-auto max-w-6xl px-2 py-8 sm:py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-4">Our Natural Grocery Range</h2>
          <p className="text-xs sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto">From natural vegetables to natural spices, we offer a complete range of natural groceries. Shop pasupu (turmeric), karam (red chili), fresh vegetables, fruits, and more - all naturally grown from tribal villages.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-8 border border-slate-200">
            <h3 className="text-base sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-4">Vegetables & Fruits</h3>
            <p className="text-xs sm:text-base text-slate-700 mb-2 sm:mb-4">Natural vegetables and natural fruits sourced directly from tribal farms. Our produce includes:</p>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-base text-slate-600">
              <li>✓ Natural tomatoes, onions, potatoes, carrots</li>
              <li>✓ Fresh spinach, cabbage, broccoli</li>
              <li>✓ Natural fruits - bananas, apples, oranges</li>
              <li>✓ Seasonal fresh produce with pesticide-free guarantee</li>
              <li>✓ Rainwater-fed, minimal pollution farming</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-8 border border-slate-200">
            <h3 className="text-base sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-4">Spices & Groceries</h3>
            <p className="text-xs sm:text-base text-slate-700 mb-2 sm:mb-4">Natural spices and natural groceries including traditional favorites in English and Telugu:</p>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-base text-slate-600">
              <li>✓ Pasupu (Turmeric) - Naturally ground</li>
              <li>✓ Karam (Red Chili) - Fresh, potent natural spice</li>
              <li>✓ Natural ginger, garlic, cumin, coriander</li>
              <li>✓ Natural rice, dal, pulses, natural grains</li>
              <li>✓ Pure natural oils, natural tea & coffee</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-2xl p-4 sm:p-8 md:p-12">
          <h3 className="text-base sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 text-center">Combo Packs - Value & Variety</h3>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h4 className="font-bold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">Vegetable Combos</h4>
              <p className="text-slate-700 text-xs sm:text-sm">Curated mix of seasonal vegetables - fresh, natural, and ready to cook. Family-sized combos at special prices.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">Spice Combo Packs</h4>
              <p className="text-slate-700 text-xs sm:text-sm">Essential natural spices bundle including pasupu, karam, and other natural spices for complete kitchen setup.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">Fruit & Grocery Combos</h4>
              <p className="text-slate-700 text-xs sm:text-sm">Mixed seasonal fruits, natural grains, and essential groceries - perfect for healthy families at discounted rates.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="mx-auto max-w-6xl px-2 py-8 sm:py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-4">Get in Touch</h2>
          <p className="text-xs sm:text-base md:text-lg text-slate-600">Questions about our tribal sourcing? We'd love to connect with you!</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-2xl border border-slate-200 p-4 sm:p-8 md:p-12 text-center">
          <p className="text-slate-700 mb-4 sm:mb-6 text-xs sm:text-base md:text-lg">Reach out to us on WhatsApp for any queries or support</p>
          <a
            href="https://wa.me/9709704563?text=Hello%20HAiFarmer%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-green-600 px-6 sm:px-8 py-2.5 sm:py-4 text-sm sm:text-base md:text-lg font-semibold text-white shadow-md transition hover:bg-green-700 active:scale-95"
          >
            💬 Chat on WhatsApp
          </a>
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
