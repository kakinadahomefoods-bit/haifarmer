import { supabase } from './supabase'

export async function validateCoupon(code, orderTotal) {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('coupon_code', code.toUpperCase())
    .single()
  if (error || !data) throw new Error('Invalid coupon code')
  const now = new Date()
  if (data.valid_from && now < new Date(data.valid_from)) throw new Error('Coupon not yet valid')
  if (data.valid_until && now > new Date(data.valid_until)) throw new Error('Coupon expired')
  if (data.min_order_value && orderTotal < data.min_order_value) {
    throw new Error(`Minimum order value of ₹${data.min_order_value} required`)
  }
  if (data.max_uses && data.used_count >= data.max_uses) throw new Error('Coupon usage limit reached')
  return data
}
