import { supabase } from './supabase'

// ============ AUTH ============
export async function adminLogin(email, password) {
  // First check if it's a regular user with admin role
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single()
  if (error || !data) throw new Error('Invalid credentials')
  if (!data.is_active) throw new Error('Account disabled')
  // Simple hash comparison (in production use bcrypt via edge functions)
  const { data: verifyData, error: verifyError } = await supabase.rpc('verify_admin_password', {
    admin_email: email,
    password_input: password
  })
  if (verifyError || !verifyData) throw new Error('Invalid credentials')
  return data
}

// ============ BANNERS ============
export async function fetchBanners() {
  const { data, error } = await supabase.from('banners').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createBanner(banner) {
  const { data, error } = await supabase.from('banners').insert(banner).select().single()
  if (error) throw error
  return data
}

export async function updateBanner(id, banner) {
  const { data, error } = await supabase.from('banners').update(banner).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteBanner(id) {
  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) throw error
}

export async function reorderBanners(banners) {
  for (const [index, banner] of banners.entries()) {
    await supabase.from('banners').update({ sort_order: index }).eq('id', banner.id)
  }
}

// ============ ANNOUNCEMENTS ============
export async function fetchAnnouncements() {
  const { data, error } = await supabase.from('announcements').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createAnnouncement(announcement) {
  const { data, error } = await supabase.from('announcements').insert(announcement).select().single()
  if (error) throw error
  return data
}

export async function updateAnnouncement(id, announcement) {
  const { data, error } = await supabase.from('announcements').update(announcement).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
}

// ============ BATCH COUPONS ============
export async function fetchBatchCoupons() {
  const { data, error } = await supabase.from('batch_coupons').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createBatchCoupon(batch) {
  const { data, error } = await supabase.from('batch_coupons').insert(batch).select().single()
  if (error) throw error
  return data
}

export async function updateBatchCoupon(id, batch) {
  const { data, error } = await supabase.from('batch_coupons').update(batch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteBatchCoupon(id) {
  const { error } = await supabase.from('batch_coupons').delete().eq('id', id)
  if (error) throw error
}

export async function generateBatchCodes(batchId, prefix, count, discountType, discountValue, minOrder, maxDiscount, expiry) {
  const codes = []
  for (let i = 0; i < count; i++) {
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase()
    const code = prefix ? `${prefix}${rand}` : rand
    codes.push({
      batch_id: batchId,
      coupon_code: code,
    })
  }
  const { data, error } = await supabase.from('generated_coupons').insert(codes).select()
  if (error) throw error
  await supabase.from('batch_coupons').update({ total_generated: count }).eq('id', batchId)
  return data
}

export async function fetchGeneratedCoupons(batchId) {
  const { data, error } = await supabase.from('generated_coupons').select('*').eq('batch_id', batchId).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ============ INDIVIDUAL COUPONS ============
export async function fetchIndividualCoupons() {
  const { data, error } = await supabase.from('individual_coupons').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createIndividualCoupon(coupon) {
  const { data, error } = await supabase.from('individual_coupons').insert(coupon).select().single()
  if (error) throw error
  return data
}

export async function updateIndividualCoupon(id, coupon) {
  const { data, error } = await supabase.from('individual_coupons').update(coupon).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteIndividualCoupon(id) {
  const { error } = await supabase.from('individual_coupons').delete().eq('id', id)
  if (error) throw error
}

// ============ SHIPPING ============
export async function fetchShippingSettings() {
  const { data, error } = await supabase.from('shipping_settings').select('*').single()
  if (error) throw error
  return data || {}
}

export async function updateShippingSettings(settings) {
  const { data, error } = await supabase.from('shipping_settings').update(settings).eq('id', settings.id).select().single()
  if (error) throw error
  return data
}

export async function fetchLocationFees() {
  const { data, error } = await supabase.from('location_delivery_fees').select('*').order('location', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createLocationFee(fee) {
  const { data, error } = await supabase.from('location_delivery_fees').insert(fee).select().single()
  if (error) throw error
  return data
}

export async function updateLocationFee(id, fee) {
  const { data, error } = await supabase.from('location_delivery_fees').update(fee).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteLocationFee(id) {
  const { error } = await supabase.from('location_delivery_fees').delete().eq('id', id)
  if (error) throw error
}

// ============ ORDERS ============
export async function fetchOrders(filters = {}) {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.payment_status) query = query.eq('payment_status', filters.payment_status)
  if (filters.search) query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`)
  if (filters.from_date) query = query.gte('created_at', filters.from_date)
  if (filters.to_date) query = query.lte('created_at', filters.to_date)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchOrderById(id) {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function updateOrder(id, updates) {
  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single()
  if (error) throw error
  // Add timeline entry if status changed
  if (updates.status) {
    await supabase.from('order_timeline').insert({
      order_id: id,
      status: updates.status,
      note: updates.status_note || '',
      created_by: updates.updated_by || 'admin'
    })
  }
  return data
}

export async function fetchOrderTimeline(orderId) {
  const { data, error } = await supabase.from('order_timeline').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

// ============ DASHBOARD ============
export async function fetchDashboardStats() {
  const [ordersRes, productsRes, customersRes, couponsRes, todayRes, monthlyRes, topProductsRes] = await Promise.all([
    supabase.from('orders').select('total,status,created_at'),
    supabase.from('products').select('id,is_active,stock_quantity'),
    supabase.from('cart_items').select('user_id', { count: 'distinct' }),
    supabase.from('individual_coupons').select('used_count'),
    supabase.from('orders').select('total,created_at').gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    supabase.rpc('get_monthly_sales'),
    supabase.from('orders').select('items').not('items', 'is', null)
  ])

  const orders = ordersRes.data || []
  const products = productsRes.data || []
  const monthlyData = monthlyRes.data || []
  const todayOrders = todayRes.data || []

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const totalOrders = orders.length
  const totalCustomers = customersRes.count || 0
  const totalProducts = products.length
  const lowStockProducts = products.filter(p => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 5)
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const couponsUsed = (couponsRes.data || []).reduce((sum, c) => sum + (c.used_count || 0), 0)

  // Top selling products
  const productSales = {}
  for (const order of orders) {
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        const name = item.product?.name || item.bundle?.bundle_name || 'Unknown'
        productSales[name] = (productSales[name] || 0) + (item.quantity || 1)
      }
    }
  }
  const topSelling = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts: lowStockProducts.length,
    topSellingProducts: topSelling,
    todayOrders: todayOrders.length,
    todayRevenue,
    monthlySales: monthlyData,
    couponsUsed
  }
}

// ============ AUDIT LOGS ============
export async function fetchAuditLogs() {
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
  if (error) throw error
  return data || []
}

export async function createAuditLog(log) {
  await supabase.from('audit_logs').insert(log)
}

// ============ PRODUCT IMAGES ============
export async function addProductImage(productId, imageUrl, sortOrder = 0) {
  const { data, error } = await supabase.from('product_images').insert({ product_id: productId, image_url: imageUrl, sort_order: sortOrder }).select().single()
  if (error) throw error
  return data
}

export async function fetchProductImages(productId) {
  const { data, error } = await supabase.from('product_images').select('*').eq('product_id', productId).order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function deleteProductImage(id) {
  const { error } = await supabase.from('product_images').delete().eq('id', id)
  if (error) throw error
}

export async function reorderProductImages(images) {
  for (const [index, img] of images.entries()) {
    await supabase.from('product_images').update({ sort_order: index }).eq('id', img.id)
  }
}

// ============ BULK PRODUCT OPERATIONS ============
export async function bulkUpdateProducts(ids, updates) {
  const { error } = await supabase.from('products').update(updates).in('id', ids)
  if (error) throw error
}

export async function bulkDeleteProducts(ids) {
  const { error } = await supabase.from('products').delete().in('id', ids)
  if (error) throw error
}
