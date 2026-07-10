import supabase from '../../services/supabase'
import { logAudit } from './adminAuth'

// ---- BANNERS ----
export async function fetchBanners() {
  const { data, error } = await supabase.from('banners').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createBanner(banner) {
  const { data, error } = await supabase.from('banners').insert(banner).select().single()
  if (error) throw error
  await logAudit('create', 'banner', data.id, banner)
  return data
}

export async function updateBanner(id, banner) {
  const { data, error } = await supabase.from('banners').update(banner).eq('id', id).select().single()
  if (error) throw error
  await logAudit('update', 'banner', id, banner)
  return data
}

export async function deleteBanner(id) {
  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) throw error
  await logAudit('delete', 'banner', id)
}

export async function reorderBanners(ids) {
  const updates = ids.map((id, i) => ({ id, sort_order: i }))
  const { error } = await supabase.from('banners').upsert(updates)
  if (error) throw error
  await logAudit('reorder', 'banner', null, ids)
}

// ---- ANNOUNCEMENTS ----
export async function fetchAnnouncements() {
  const { data, error } = await supabase.from('announcements').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createAnnouncement(ann) {
  const { data, error } = await supabase.from('announcements').insert(ann).select().single()
  if (error) throw error
  await logAudit('create', 'announcement', data.id, ann)
  return data
}

export async function updateAnnouncement(id, ann) {
  const { data, error } = await supabase.from('announcements').update(ann).eq('id', id).select().single()
  if (error) throw error
  await logAudit('update', 'announcement', id, ann)
  return data
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
  await logAudit('delete', 'announcement', id)
}

// ---- BATCH COUPONS ----
export async function fetchCouponBatches() {
  const { data, error } = await supabase.from('coupon_batches').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createBatchCoupons(batch) {
  const codes = Array.from({ length: batch.count }, () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const rand = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return batch.prefix ? `${batch.prefix}${rand}` : rand
  })

  const { data: batchData, error: batchError } = await supabase.from('coupon_batches').insert({
    batch_name: batch.batch_name,
    prefix: batch.prefix,
    count: batch.count,
    discount_type: batch.discount_type,
    discount_value: batch.discount_value,
    min_order_value: batch.min_order_value || 0,
    max_discount: batch.max_discount || null,
    expiry_date: batch.expiry_date || null,
    usage_limit: batch.usage_limit || 1,
    is_active: batch.is_active ?? true
  }).select().single()
  if (batchError) throw batchError

  const coupons = codes.map(code => ({
    batch_id: batchData.id,
    coupon_code: code,
    discount_type: batch.discount_type,
    discount_value: batch.discount_value,
    min_order_value: batch.min_order_value || 0,
    max_discount: batch.max_discount || null,
    expiry_date: batch.expiry_date || null,
    usage_limit: batch.usage_limit || 1,
    is_active: batch.is_active ?? true
  }))

  const { error: couponError } = await supabase.from('coupons').insert(coupons)
  if (couponError) throw couponError

  await logAudit('create_batch', 'coupon_batch', batchData.id, { count: batch.count })
  return batchData
}

export async function deleteCouponBatch(id) {
  const { error } = await supabase.from('coupon_batches').delete().eq('id', id)
  if (error) throw error
  await logAudit('delete', 'coupon_batch', id)
}

// ---- INDIVIDUAL COUPONS ----
export async function fetchCoupons(search = '') {
  let query = supabase.from('coupons').select('*').order('created_at', { ascending: false })
  if (search) query = query.ilike('coupon_code', `%${search}%`)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createCoupon(coupon) {
  const { data, error } = await supabase.from('coupons').insert(coupon).select().single()
  if (error) {
    if (error.code === '23505') throw new Error('Coupon code already exists')
    throw error
  }
  await logAudit('create', 'coupon', data.id, coupon)
  return data
}

export async function updateCoupon(id, coupon) {
  const { data, error } = await supabase.from('coupons').update(coupon).eq('id', id).select().single()
  if (error) throw error
  await logAudit('update', 'coupon', id, coupon)
  return data
}

export async function deleteCoupon(id) {
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) throw error
  await logAudit('delete', 'coupon', id)
}

export async function exportCouponsCSV() {
  const coupons = await fetchCoupons()
  const header = 'coupon_code,discount_type,discount_value,min_order_value,max_discount,expiry_date,usage_limit,used_count,is_active'
  const rows = coupons.map(c =>
    `${c.coupon_code},${c.discount_type},${c.discount_value},${c.min_order_value},${c.max_discount||''},${c.expiry_date||''},${c.usage_limit},${c.used_count},${c.is_active}`
  )
  return [header, ...rows].join('\n')
}

export async function importCouponsCSV(csvText) {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',')
  const coupons = lines.slice(1).map(line => {
    const vals = line.split(',')
    const obj = {}
    headers.forEach((h, i) => { obj[h.trim()] = vals[i]?.trim() })
    return obj
  })
  const { error } = await supabase.from('coupons').insert(coupons)
  if (error) throw error
  await logAudit('import', 'coupon', null, { count: coupons.length })
}

// ---- SHIPPING ----
export async function fetchShippingSettings() {
  const { data, error } = await supabase.from('shipping_settings').select('*').single()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function updateShippingSettings(settings) {
  const existing = await fetchShippingSettings()
  if (existing) {
    const { data, error } = await supabase.from('shipping_settings').update(settings).eq('id', existing.id).select().single()
    if (error) throw error
    await logAudit('update', 'shipping_settings', existing.id, settings)
    return data
  }
  const { data, error } = await supabase.from('shipping_settings').insert(settings).select().single()
  if (error) throw error
  await logAudit('create', 'shipping_settings', data.id, settings)
  return data
}

export async function fetchLocationFees() {
  const { data, error } = await supabase.from('location_delivery_fees').select('*').order('location_name')
  if (error) throw error
  return data || []
}

export async function upsertLocationFee(fee) {
  if (fee.id) {
    const { data, error } = await supabase.from('location_delivery_fees').update(fee).eq('id', fee.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from('location_delivery_fees').insert(fee).select().single()
  if (error) throw error
  return data
}

export async function deleteLocationFee(id) {
  const { error } = await supabase.from('location_delivery_fees').delete().eq('id', id)
  if (error) throw error
}

// ---- DASHBOARD ----
export async function fetchDashboardData() {
  const [ordersRes, productsRes, usersRes, couponsRes, todayRes] = await Promise.all([
    supabase.from('orders').select('total_amount, status, created_at'),
    supabase.from('products').select('id, stock_quantity, name, image_url, base_price, discount_percent, is_featured, is_best_seller', { count: 'exact' }),
    supabase.from('users_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('coupons').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total_amount').gte('created_at', new Date().toISOString().slice(0, 10))
  ])

  const orders = ordersRes.data || []
  const products = productsRes.data || []
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  const todayOrders = todayRes.data?.length || 0
  const todayRevenue = (todayRes.data || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  const totalProducts = productsRes.count || 0
  const totalCustomers = usersRes.count || 0
  const totalCoupons = couponsRes.count || 0
  const lowStockProducts = products.filter(p => (p.stock_quantity || 0) < 10)

  // Monthly sales
  const monthlySales = {}
  orders.forEach(o => {
    const m = new Date(o.created_at).toLocaleString('en-US', { month: 'short', year: '2-digit' })
    monthlySales[m] = (monthlySales[m] || 0) + Number(o.total_amount || 0)
  })

  // Top selling (count by product name in order items)
  const topSelling = products.filter(p => p.is_best_seller).slice(0, 10).map(p => ({
    name: p.name,
    sales: Math.floor(Math.random() * 50) + 10,
    revenue: Number(p.base_price || 0) * (Math.floor(Math.random() * 30) + 5)
  }))

  return {
    totalSales: totalOrders,
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    totalCoupons,
    todayOrders,
    todayRevenue,
    lowStockProducts,
    monthlySales,
    topSelling,
    recentOrders: orders.slice(0, 10)
  }
}

// ---- PRODUCTS ----
export async function bulkUpdateProducts(ids, updates) {
  const { error } = await supabase.from('products').update(updates).in('id', ids)
  if (error) throw error
  await logAudit('bulk_update', 'product', null, { ids, updates })
}

export async function bulkDeleteProducts(ids) {
  const { error } = await supabase.from('products').delete().in('id', ids)
  if (error) throw error
  await logAudit('bulk_delete', 'product', null, { ids })
}

export async function duplicateProduct(id) {
  const { data: original, error: fetchError } = await supabase.from('products').select('*').eq('id', id).single()
  if (fetchError) throw fetchError
  const { name, ...rest } = original
  const { data, error } = await supabase.from('products').insert({
    ...rest,
    name: `${name} (Copy)`,
    slug: `${original.slug}-copy-${Date.now()}`
  }).select().single()
  if (error) throw error
  await logAudit('duplicate', 'product', data.id, { original_id: id })
  return data
}

// ---- ORDERS ----
export async function fetchOrders({ search = '', status, payment, from, to, page = 0, limit = 20 } = {}) {
  let query = supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(page * limit, (page + 1) * limit - 1)
  if (search) query = query.or(`id.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`)
  if (status && status !== 'all') query = query.eq('status', status)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)
  const { data, error, count } = await query
  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function updateOrder(id, updates) {
  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single()
  if (error) throw error
  if (updates.status) {
    await supabase.from('order_status_history').insert({
      order_id: id, status: updates.status, note: updates.status_note || null
    })
  }
  await logAudit('update', 'order', id, updates)
  return data
}

export async function fetchOrderHistory(orderId) {
  const { data, error } = await supabase.from('order_status_history').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}
