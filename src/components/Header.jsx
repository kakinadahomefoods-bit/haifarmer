import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchSiteAssets } from '../services/siteAssetService'

function CartIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2" />
    </svg>
  )
}

function UserIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LogoutIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function MenuIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function Header() {
  const { user, logout } = useAuth()
  const { cartItems } = useCart()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [headerText, setHeaderText] = useState('Free delivery over ₹1,499')
  const [logoUrl, setLogoUrl] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    fetchSiteAssets().then(assets => {
      if (assets?.header_text_1) setHeaderText(assets.header_text_1)
      if (assets?.logo_url) setLogoUrl(assets.logo_url)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'PRODUCTS', path: '/products' },
    { label: 'COMBOS', path: '/combos' },
    { label: 'ABOUT', path: '/about' },
  ]

  return (
    <header className={`sticky top-0 z-50 w-full transition-shadow duration-200 ${scrolled ? 'bg-white/95 shadow-sm backdrop-blur-md' : 'bg-white'}`}>
      {/* Marquee */}
      <div className="relative overflow-hidden bg-brand-600 py-1.5 text-center text-xs font-semibold text-white">
        <div className="header-marquee whitespace-nowrap">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="mx-8 inline-block">{headerText}</span>
          ))}
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="HAiFarmer" className="h-9 w-auto sm:h-11" />
          ) : (
            <span className="font-display text-xl font-bold tracking-tight text-brand-700 sm:text-2xl">HAiFarmer</span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Cart */}
          <button
            onClick={() => navigate('/checkout')}
            className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            aria-label="Cart"
          >
            <CartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account - desktop */}
          {user && (
            <button
              onClick={() => navigate('/account')}
              className="hidden rounded-full p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition md:block"
              aria-label="Account"
            >
              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Logout - desktop */}
          {user && (
            <button
              onClick={logout}
              className="hidden rounded-full p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition md:block"
              aria-label="Logout"
            >
              <LogoutIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* WhatsApp */}
          <a
            href="https://wa.me/9709704563?text=Hello%20HAiFarmer%2C%20I%20would%20like%20to%20place%20an%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition md:inline-flex md:items-center md:gap-1"
          >
            💬 WhatsApp
          </a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="flex flex-col px-4 py-3">
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-semibold tracking-wide transition ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false) }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              >
                Logout
              </button>
            )}
            <a
              href="https://wa.me/9709704563?text=Hello%20HAiFarmer%2C%20I%20would%20like%20to%20place%20an%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-lg bg-green-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              💬 Chat on WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
