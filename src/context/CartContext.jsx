import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../services/supabase'

const CartContext = createContext(null)

const GUEST_CART_KEY = 'grocery_guest_cart'

function loadGuestCart() {
  try {
    const data = localStorage.getItem(GUEST_CART_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState(null)

  useEffect(() => {
    if (user) {
      loadCartFromServer()
    } else {
      setCartItems(loadGuestCart())
    }
  }, [user])

  async function loadCartFromServer() {
    if (!user) return
    setLoading(true)
    const guestItems = loadGuestCart()
    if (guestItems.length > 0) {
      for (const item of guestItems) {
        await supabase.from('cart_items').upsert({
          user_id: user.id,
          product_id: item.product_id || null,
          variant_id: item.variant_id || null,
          bundle_id: item.bundle_id || null,
          quantity: item.quantity
        })
      }
      localStorage.removeItem(GUEST_CART_KEY)
    }
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*), variant:product_variants(*), bundle:bundles(*, bundle_items(*, product(*), variant(*)))')
      .eq('user_id', user.id)
    setCartItems(data || [])
    setLoading(false)
  }

  async function addToCart(item) {
    const newItem = {
      product_id: item.product_id || null,
      variant_id: item.variant_id || null,
      bundle_id: item.bundle_id || null,
      quantity: item.quantity || 1,
      product: item.product || null,
      variant: item.variant || null,
      bundle: item.bundle || null
    }

    if (user) {
      const existing = cartItems.find(
        ci => ci.product_id === newItem.product_id &&
              ci.variant_id === newItem.variant_id &&
              ci.bundle_id === newItem.bundle_id
      )
      if (existing) {
        await updateQuantity(existing.id, existing.quantity + newItem.quantity)
      } else {
        const { data } = await supabase.from('cart_items').insert({
          user_id: user.id,
          ...newItem
        }).select('*, product:products(*), variant:product_variants(*), bundle:bundles(*, bundle_items(*, product(*), variant(*)))')
        if (data) setCartItems(prev => [...prev, data[0]])
      }
    } else {
      setCartItems(prev => {
        const existing = prev.findIndex(
          ci => ci.product_id === newItem.product_id &&
                ci.variant_id === newItem.variant_id &&
                ci.bundle_id === newItem.bundle_id
        )
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + newItem.quantity }
          saveGuestCart(updated)
          return updated
        }
        const id = Date.now().toString()
        const updated = [...prev, { ...newItem, id }]
        saveGuestCart(updated)
        return updated
      })
    }
  }

  async function updateQuantity(id, quantity) {
    if (quantity < 1) return
    if (user) {
      await supabase.from('cart_items').update({ quantity }).eq('id', id)
      setCartItems(prev => prev.map(ci => ci.id === id ? { ...ci, quantity } : ci))
    } else {
      setCartItems(prev => {
        const updated = prev.map(ci => ci.id === id ? { ...ci, quantity } : ci)
        saveGuestCart(updated)
        return updated
      })
    }
  }

  async function removeFromCart(id) {
    if (user) {
      await supabase.from('cart_items').delete().eq('id', id)
    }
    setCartItems(prev => {
      const updated = prev.filter(ci => ci.id !== id)
      if (!user) saveGuestCart(updated)
      return updated
    })
  }

  async function clearCart() {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id)
    }
    setCartItems([])
    if (!user) localStorage.removeItem(GUEST_CART_KEY)
  }

  const totals = (() => {
    let baseTotal = 0
    let discountTotal = 0
    let couponDiscount = 0
    let finalTotal = 0

    for (const item of cartItems) {
      if (item.bundle) {
        const bundlePrice = Number(item.bundle.bundle_price) || 0
        const bundleDiscount = Number(item.bundle.bundle_discount_percent) || 0
        const discounted = bundleDiscount > 0
          ? Math.round(bundlePrice * (1 - bundleDiscount / 100))
          : bundlePrice
        baseTotal += bundlePrice * item.quantity
        discountTotal += (bundlePrice - discounted) * item.quantity
      } else if (item.variant) {
        baseTotal += Number(item.variant.price) * item.quantity
      } else if (item.product) {
        const price = Number(item.product.base_price) || 0
        const disc = Number(item.product.discount_percent) || 0
        const discounted = disc > 0 ? Math.round(price * (1 - disc / 100)) : price
        baseTotal += price * item.quantity
        discountTotal += (price - discounted) * item.quantity
      }
    }

    const afterProductDiscounts = Math.max(0, baseTotal - discountTotal)

    if (coupon) {
      if (coupon.discount_type === 'percentage') {
        couponDiscount = Math.round(afterProductDiscounts * (coupon.discount_value / 100))
      } else {
        couponDiscount = Math.min(coupon.discount_value, afterProductDiscounts)
      }
    }

    finalTotal = Math.max(0, afterProductDiscounts - couponDiscount)

    return { baseTotal, discountTotal, couponDiscount, finalTotal }
  })()

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totals,
      coupon,
      setCoupon
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
