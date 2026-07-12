import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)
const GUEST_CART_KEY = 'grocery_guest_cart'

function loadCart() {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]') } catch { return [] }
}
function saveCart(items) { localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items)) }

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState(null)

  useEffect(() => { setCartItems(loadCart()); setLoading(false) }, [user])

  function addToCart(item) {
    setCartItems(prev => {
      const existing = prev.findIndex(ci => ci.product_id === item.product_id && ci.variant_id === item.variant_id && ci.bundle_id === item.bundle_id)
      let updated
      if (existing >= 0) {
        updated = prev.map((ci, i) => i === existing ? { ...ci, quantity: ci.quantity + (item.quantity || 1) } : ci)
      } else {
        updated = [...prev, { ...item, id: Date.now().toString() + Math.random() }]
      }
      saveCart(updated)
      return updated
    })
  }

  function updateQuantity(id, quantity) {
    if (quantity < 1) return
    setCartItems(prev => {
      const updated = prev.map(ci => ci.id === id ? { ...ci, quantity } : ci)
      saveCart(updated)
      return updated
    })
  }

  function removeFromCart(id) {
    setCartItems(prev => {
      const updated = prev.filter(ci => ci.id !== id)
      saveCart(updated)
      return updated
    })
  }

  function clearCart() {
    setCartItems([])
    localStorage.removeItem(GUEST_CART_KEY)
  }

  const totals = (() => {
    let baseTotal = 0, discountTotal = 0, couponDiscount = 0
    for (const item of cartItems) {
      if (item.bundle) {
        const bp = Number(item.bundle.bundle_price) || 0
        const bd = Number(item.bundle.bundle_discount_percent) || 0
        const discounted = bd > 0 ? Math.round(bp * (1 - bd / 100)) : bp
        baseTotal += bp * item.quantity
        discountTotal += (bp - discounted) * item.quantity
      } else if (item.variant) {
        baseTotal += Number(item.variant.price) * item.quantity
      } else if (item.product) {
        const p = Number(item.product.base_price) || 0
        const d = Number(item.product.discount_percent) || 0
        const discounted = d > 0 ? Math.round(p * (1 - d / 100)) : p
        baseTotal += p * item.quantity
        discountTotal += (p - discounted) * item.quantity
      }
    }
    const afterDiscounts = Math.max(0, baseTotal - discountTotal)
    if (coupon) {
      couponDiscount = coupon.discount_type === 'percentage'
        ? Math.round(afterDiscounts * (coupon.discount_value / 100))
        : Math.min(coupon.discount_value, afterDiscounts)
    }
    return { baseTotal, discountTotal, couponDiscount, finalTotal: Math.max(0, afterDiscounts - couponDiscount) }
  })()

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, updateQuantity, removeFromCart, clearCart, totals, coupon, setCoupon }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
