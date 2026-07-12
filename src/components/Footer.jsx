import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchSiteAssets } from '../services/siteAssetService'

export default function Footer() {
  const [assets, setAssets] = useState({})

  useEffect(() => {
    fetchSiteAssets().then(a => { if (a) setAssets(a) }).catch(() => {})
  }, [])

  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition">Products</Link></li>
              <li><Link to="/combos" className="hover:text-white transition">Combos</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/farmers" className="hover:text-white transition">Our Farmers</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://wa.me/919909904563" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">WhatsApp</a></li>
              <li className="hover:text-white transition cursor-default">Phone: +91 9909904563</li>
              <li className="hover:text-white transition cursor-default">Email: info@haifarmer.com</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Policies</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default hover:text-white transition">Terms & Conditions</span></li>
              <li><span className="cursor-default hover:text-white transition">Privacy Policy</span></li>
              <li><span className="cursor-default hover:text-white transition">Refund Policy</span></li>
              <li><span className="cursor-default hover:text-white transition">Delivery Policy</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} HAiFarmer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
