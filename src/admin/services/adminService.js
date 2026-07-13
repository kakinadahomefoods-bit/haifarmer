import { api } from '../../services/api'

// ==================== GENERIC HELPERS ====================
async function logAudit(action, entity, entityId, details) {
  try { await api.post('/audit-logs', { action, entity, entity_id: entityId, details, admin_id: localStorage.getItem('admin_id') }) } catch (e) { console.warn('Audit log failed:', e.message) }
}

export function crud(path) {
  return {
    fetch: async (order) => api.get(`/${path}${order ? `?order=${order}` : ''}`),
    fetchById: async (id) => api.get(`/${path}/${id}`),
    create: async (payload) => { const data = await api.post(`/${path}`, payload); logAudit('create', path, data?.id, payload); return data },
    update: async (id, payload) => { const data = await api.put(`/${path}/${id}`, payload); logAudit('update', path, id, payload); return data },
    remove: async (id) => { await api.delete(`/${path}/${id}`); logAudit('delete', path, id) }
  }
}

// ==================== CATEGORIES ====================
export const categoryApi = crud('categories')
export async function fetchCategories(order) { return categoryApi.fetch(order || 'sort_order') }

// ==================== PRODUCTS ====================
export async function fetchProducts(search = '', order = '-createdAt') {
  const params = new URLSearchParams({ order })
  if (search) params.set('search', search)
  return api.get(`/products?${params}`)
}
export async function createProduct(data) { return api.post('/products', data) }
export async function updateProduct(id, data) { return api.put(`/products/${id}`, data) }
export async function bulkUpdateProducts(ids, updates) {
  const data = await api.post('/products/bulk-update', { ids, updates })
  logAudit('bulk_update', 'product', null, { ids, updates }); return data
}
export async function bulkDeleteProducts(ids) {
  const data = await api.post('/products/bulk-delete', { ids })
  logAudit('bulk_delete', 'product', null, { ids }); return data
}
export async function duplicateProduct(id) {
  const data = await api.post(`/products/${id}/duplicate`)
  logAudit('duplicate', 'product', data?.id, { original_id: id }); return data
}

// ==================== VARIANTS ====================
export const variantApi = {
  fetch: async (productId) => api.get(`/products/${productId}/variants`),
  create: async (productId, payload) => api.post(`/products/${productId}/variants`, payload),
  update: async (id, payload) => api.put(`/variants/${id}`, payload),
  remove: async (id) => api.delete(`/variants/${id}`)
}
export async function fetchVariants(productId) { return variantApi.fetch(productId) }

// ==================== BUNDLES / COMBOS ====================
export const bundleApi = crud('bundles')
export async function fetchBundles(order) { return bundleApi.fetch(order || '-createdAt') }
export async function fetchBundleWithItems(id) {
  const bundle = await api.get(`/bundles/${id}`)
  bundle.items = await api.get(`/bundles/${id}/items`)
  return bundle
}
export async function saveBundleItems(bundleId, items) {
  await api.post(`/bundles/${bundleId}/items`, { items })
  logAudit('update_items', 'bundle', bundleId, { count: items?.length || 0 })
}

// ==================== COUPONS ====================
export const couponApi = crud('coupons')
export async function fetchCoupons(search = '') {
  return api.get(`/coupons${search ? `?search=${search}` : ''}`)
}
export async function createCoupon(coupon) {
  const data = await api.post('/coupons', coupon)
  logAudit('create', 'coupon', data?.id, coupon); return data
}
export async function updateCoupon(id, coupon) {
  const data = await api.put(`/coupons/${id}`, coupon)
  logAudit('update', 'coupon', id, coupon); return data
}
export async function deleteCoupon(id) {
  await api.delete(`/coupons/${id}`)
  logAudit('delete', 'coupon', id)
}
export async function exportCouponsCSV() {
  return api.get('/coupons/export')
}
export async function importCouponsCSV(csvText) {
  const data = await api.post('/coupons/import', { csv: csvText })
  logAudit('import', 'coupon', null, { count: data?.count }); return data
}
export async function createBatchCoupons(batch) {
  const data = await api.post('/coupons/batch', batch)
  logAudit('create_batch', 'coupon', null, { count: batch.count }); return data
}

// ==================== DELIVERY SETTINGS ====================
export async function fetchDeliverySettings() { return api.get('/delivery-settings') }
export async function updateDeliverySettings(settings) {
  const data = await api.put('/delivery-settings', settings)
  logAudit('update', 'delivery_settings', null, settings); return data
}

export const locationFeeApi = crud('location-delivery-fees')
export async function fetchLocationFees() { return locationFeeApi.fetch('location') }
export async function upsertLocationFee(fee) {
  if (fee.id) return locationFeeApi.update(fee.id, fee)
  return locationFeeApi.create(fee)
}
export const deleteLocationFee = locationFeeApi.remove

// ==================== PAYMENT SETTINGS ====================
export async function fetchPaymentSettings() { return api.get('/payment-settings') }
export async function updatePaymentSettings(settings) {
  const data = await api.put('/payment-settings', settings)
  logAudit('update', 'payment_settings', null, settings); return data
}

// ==================== BANNERS ====================
export const bannerApi = crud('banners')
export async function fetchBanners() { return bannerApi.fetch('sort_order') }
export async function createBanner(data) { return bannerApi.create(data) }
export async function updateBanner(id, data) { return bannerApi.update(id, data) }
export async function deleteBanner(id) { return bannerApi.remove(id) }
export async function reorderBanners(ids) {
  for (let i = 0; i < ids.length; i++) await bannerApi.update(ids[i], { sort_order: i })
  logAudit('reorder', 'banner', null, ids)
}

// ==================== ANNOUNCEMENTS ====================
export const announcementApi = crud('announcements')
export async function fetchAnnouncements() { return announcementApi.fetch('sort_order') }
export async function createAnnouncement(data) { return announcementApi.create(data) }
export async function updateAnnouncement(id, data) { return announcementApi.update(id, data) }
export async function deleteAnnouncement(id) { return announcementApi.remove(id) }

// ==================== FARMERS ====================
export const farmerApi = crud('farmers')
export async function fetchFarmers() { return farmerApi.fetch('-createdAt') }
export async function approveFarmer(id) {
  const data = await farmerApi.update(id, { is_approved: true })
  logAudit('approve', 'farmer', id); return data
}
export const farmerRequestApi = crud('farmer-requests')

// ==================== QR CODES ====================
export const qrApi = crud('qr-codes')
export async function fetchQRCodes() { return qrApi.fetch('-createdAt') }
export async function regenerateQR(id, targetUrl) {
  const data = await api.post(`/qr-codes/${id}/regenerate`, { target_url: targetUrl })
  logAudit('regenerate', 'qr_code', id); return data
}

// ==================== BUSINESS SETTINGS ====================
export async function fetchBusinessSettings() { return api.get('/business-settings') || {} }
export async function updateBusinessSettings(settings) {
  const data = await api.put('/business-settings', settings)
  logAudit('update', 'business_settings', null, settings); return data
}

// ==================== SITE ASSETS ====================
export async function fetchSiteAssets() { return api.get('/site-assets') || {} }
export async function updateSiteAssets(assets) {
  const data = await api.put('/site-assets', assets)
  logAudit('update', 'site_assets', null, assets); return data
}

// ==================== DASHBOARD ====================
export async function fetchDashboardData() { return api.get('/dashboard') || {} }

// ==================== ORDERS ====================
export async function fetchOrders({ search = '', status, payment, from, to, page = 0, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (search) params.set('search', search)
  if (status && status !== 'all') params.set('status', status)
  if (payment) params.set('payment', payment)
  const result = await api.get(`/orders?${params}`)
  return { data: result?.orders || [], count: result?.total || 0, ...result }
}
export async function updateOrder(id, updates) {
  const data = await api.put(`/orders/${id}`, updates)
  logAudit('update', 'order', id, updates); return data
}
export async function fetchOrderTimeline(orderId) { return api.get(`/orders/${orderId}/timeline`) }
export async function fetchOrderById(id) { return api.get(`/orders/${id}`) }

// ==================== AUDIT LOGS ====================
export async function fetchAuditLogs() { return api.get('/audit-logs') || [] }

// ==================== CUSTOMERS ====================
export async function fetchCustomers(search = '') {
  return api.get(`/customers${search ? `?search=${search}` : ''}`)
}
