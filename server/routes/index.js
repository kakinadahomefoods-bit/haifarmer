import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as db from '../models/index.js'
import { adminAuth } from '../middleware/auth.js'

const router = Router()

// ==================== AUTH ====================
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    let user = await db.AdminUser.findOne({ email, is_active: true })
    if (!user) {
      if (email === 'admin@gmail.com' && password === 'admin1234') {
        const hash = await bcrypt.hash(password, 10)
        user = await db.AdminUser.create({ email, password: hash, name: 'Admin' })
      } else return res.status(401).json({ error: 'Invalid credentials' })
    }
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    await db.AdminSession.create({ admin_id: user._id, token, expires_at: new Date(Date.now() + 7 * 86400000) })
    res.json({ token, admin: { id: user._id, email: user.email, name: user.name, role: user.role } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/auth/me', adminAuth, async (req, res) => {
  try {
    const user = await db.AdminUser.findById(req.adminId).select('-password')
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json(user)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== GENERIC CRUD HELPER ====================
function crudRoutes(model, path, options = {}) {
  const { sortField = 'createdAt', sortDir = -1 } = options

  // List
  router.get(`/${path}`, adminAuth, async (req, res) => {
    try {
      const { search, order, ...filters } = req.query
      let query = {}
      if (options.searchFields && search) {
        query.$or = options.searchFields.map(f => ({ [f]: { $regex: search, $options: 'i' } }))
      }
      // Apply filters
      Object.entries(filters).forEach(([k, v]) => {
        if (v === 'true') query[k] = true
        else if (v === 'false') query[k] = false
        else if (!isNaN(v)) query[k] = Number(v)
        else query[k] = v
      })
      const orderBy = order || `${sortField}`;
      const sortDirActual = orderBy.startsWith('-') ? -1 : 1
      const sortKey = orderBy.replace(/^-/, '')
      const items = await model.find(query).sort({ [sortKey]: sortDirActual })
      res.json(items)
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  // Get one
  router.get(`/${path}/:id`, adminAuth, async (req, res) => {
    try { res.json(await model.findById(req.params.id)) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })

  // Create
  router.post(`/${path}`, adminAuth, async (req, res) => {
    try { res.status(201).json(await model.create(req.body)) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })

  // Update
  router.put(`/${path}/:id`, adminAuth, async (req, res) => {
    try { res.json(await model.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })

  // Delete
  router.delete(`/${path}/:id`, adminAuth, async (req, res) => {
    try { await model.findByIdAndDelete(req.params.id); res.json({ success: true }) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })
}

// Apply generic CRUD
crudRoutes(db.Category, 'categories', { sortField: 'sort_order', searchFields: ['name', 'description'] })
crudRoutes(db.Bundle, 'bundles', { sortField: 'createdAt', searchFields: ['bundle_name'] })
crudRoutes(db.Coupon, 'coupons', { sortField: 'createdAt', searchFields: ['coupon_code', 'batch_name'] })
crudRoutes(db.Banner, 'banners', { sortField: 'sort_order' })
crudRoutes(db.Announcement, 'announcements', { sortField: 'sort_order' })
crudRoutes(db.Farmer, 'farmers', { sortField: 'createdAt', searchFields: ['name', 'email', 'phone'] })
crudRoutes(db.FarmerRequest, 'farmer-requests', { sortField: 'createdAt' })
crudRoutes(db.QRCode, 'qr-codes', { sortField: 'createdAt', searchFields: ['title'] })
crudRoutes(db.LocationDeliveryFee, 'location-delivery-fees', { sortField: 'location' })
crudRoutes(db.CartItem, 'cart-items', { sortField: 'createdAt' })

// ==================== PRODUCTS ====================
router.get('/products', adminAuth, async (req, res) => {
  try {
    const { search, order } = req.query
    let query = {}
    if (search) query.name = { $regex: search, $options: 'i' }
    const orderBy = order || '-createdAt'
    const sortDir = orderBy.startsWith('-') ? -1 : 1
    const sortKey = orderBy.replace(/^-/, '')
    res.json(await db.Product.find(query).sort({ [sortKey]: sortDir }))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/products/:id', adminAuth, async (req, res) => {
  try { res.json(await db.Product.findById(req.params.id)) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/products', adminAuth, async (req, res) => {
  try { res.status(201).json(await db.Product.create(req.body)) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/products/:id', adminAuth, async (req, res) => {
  try { res.json(await db.Product.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    await db.Product.findByIdAndDelete(req.params.id)
    await db.ProductVariant.deleteMany({ product_id: req.params.id })
    await db.ProductImage.deleteMany({ product_id: req.params.id })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/products/:id/duplicate', adminAuth, async (req, res) => {
  try {
    const orig = await db.Product.findById(req.params.id)
    if (!orig) return res.status(404).json({ error: 'Not found' })
    const copy = await db.Product.create({ ...orig.toObject(), _id: undefined, name: orig.name + ' (copy)', createdAt: undefined, updatedAt: undefined })
    const variants = await db.ProductVariant.find({ product_id: req.params.id })
    for (const v of variants) {
      await db.ProductVariant.create({ ...v.toObject(), _id: undefined, product_id: copy._id, createdAt: undefined, updatedAt: undefined })
    }
    res.status(201).json(copy)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/products/bulk-update', adminAuth, async (req, res) => {
  try {
    const { ids, updates } = req.body
    await db.Product.updateMany({ _id: { $in: ids } }, { $set: updates })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/products/bulk-delete', adminAuth, async (req, res) => {
  try {
    await db.Product.deleteMany({ _id: { $in: req.body.ids } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== VARIANTS ====================
router.get('/products/:productId/variants', adminAuth, async (req, res) => {
  try { res.json(await db.ProductVariant.find({ product_id: req.params.productId })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/products/:productId/variants', adminAuth, async (req, res) => {
  try { res.status(201).json(await db.ProductVariant.create({ ...req.body, product_id: req.params.productId })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/variants/:id', adminAuth, async (req, res) => {
  try { res.json(await db.ProductVariant.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/variants/:id', adminAuth, async (req, res) => {
  try { await db.ProductVariant.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== PRODUCT IMAGES ====================
router.get('/products/:productId/images', adminAuth, async (req, res) => {
  try { res.json(await db.ProductImage.find({ product_id: req.params.productId }).sort('sort_order')) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/products/:productId/images', adminAuth, async (req, res) => {
  try { res.status(201).json(await db.ProductImage.create({ ...req.body, product_id: req.params.productId })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/images/:id', adminAuth, async (req, res) => {
  try { res.json(await db.ProductImage.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/images/:id', adminAuth, async (req, res) => {
  try { await db.ProductImage.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/images/reorder', adminAuth, async (req, res) => {
  try {
    const { ids } = req.body
    for (let i = 0; i < ids.length; i++)
      await db.ProductImage.findByIdAndUpdate(ids[i], { sort_order: i })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== BUNDLE ITEMS ====================
router.get('/bundles/:bundleId/items', adminAuth, async (req, res) => {
  try {
    const items = await db.BundleItem.find({ bundle_id: req.params.bundleId })
      .populate('product_id', 'name image_url')
      .populate('variant_id', 'unit price')
    res.json(items)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/bundles/:bundleId/items', adminAuth, async (req, res) => {
  try {
    const items = req.body.items || [req.body]
    await db.BundleItem.deleteMany({ bundle_id: req.params.bundleId })
    const created = []
    for (const item of items) {
      created.push(await db.BundleItem.create({ ...item, bundle_id: req.params.bundleId }))
    }
    res.status(201).json(created)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== COUPON BATCH ====================
router.post('/coupons/batch', adminAuth, async (req, res) => {
  try {
    const { prefix, count, discount_type, discount_value, min_order_value, max_discount, expiry_date, usage_limit, scope, applicable_products, applicable_categories } = req.body
    const codes = []
    for (let i = 0; i < count; i++) {
      const suffix = Math.random().toString(36).substring(2, 8).toUpperCase()
      codes.push({ coupon_code: prefix ? `${prefix}${suffix}` : suffix, discount_type, discount_value: Number(discount_value), min_order_value: Number(min_order_value || 0), max_discount: max_discount || null, expiry_date: expiry_date || null, usage_limit: Number(usage_limit || 1), scope: scope || 'all', applicable_products: applicable_products || null, applicable_categories: applicable_categories || null })
    }
    await db.Coupon.insertMany(codes)
    res.status(201).json({ count: codes.length })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/coupons/export', adminAuth, async (req, res) => {
  try {
    const coupons = await db.Coupon.find().sort('-createdAt')
    let csv = 'code,type,value,min_order,max_discount,usage_limit,used,expiry,active\n'
    coupons.forEach(c => { csv += `${c.coupon_code},${c.discount_type},${c.discount_value},${c.min_order_value},${c.max_discount||''},${c.usage_limit},${c.used_count||0},${c.expiry_date||''},${c.is_active}\n` })
    res.setHeader('Content-Type', 'text/csv')
    res.send(csv)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/coupons/import', adminAuth, async (req, res) => {
  try {
    const lines = req.body.csv.trim().split('\n')
    const coupons = lines.slice(1).map(line => {
      const [coupon_code, discount_type, discount_value, min_order_value, max_discount, usage_limit, scope] = line.split(',')
      return { coupon_code: coupon_code.trim(), discount_type: discount_type?.trim() || 'percentage', discount_value: Number(discount_value) || 0, min_order_value: Number(min_order_value) || 0, max_discount: max_discount ? Number(max_discount) : null, usage_limit: Number(usage_limit) || 1 }
    })
    await db.Coupon.insertMany(coupons)
    res.json({ count: coupons.length })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== ORDERS ====================
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { search, status, payment, page = 0, limit = 20 } = req.query
    let query = {}
    if (status) query.order_status = status
    if (payment) query.payment_status = payment
    if (search) {
      query.$or = [
        { order_id: { $regex: search, $options: 'i' } },
        { user_name: { $regex: search, $options: 'i' } },
        { user_phone: { $regex: search, $options: 'i' } }
      ]
    }
    const total = await db.Order.countDocuments(query)
    const orders = await db.Order.find(query).sort('-createdAt').skip(Number(page) * Number(limit)).limit(Number(limit))
    res.json({ orders, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/orders/:id', adminAuth, async (req, res) => {
  try { res.json(await db.Order.findById(req.params.id)) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await db.Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (req.body.order_status) {
      await db.OrderTimeline.create({ order_id: req.params.id, status: req.body.order_status, note: req.body.status_note || '', changed_by: req.adminId })
    }
    res.json(order)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/orders/:id/timeline', adminAuth, async (req, res) => {
  try { res.json(await db.OrderTimeline.find({ order_id: req.params.id }).sort('createdAt')) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== DELIVERY SETTINGS ====================
router.get('/delivery-settings', adminAuth, async (req, res) => {
  try {
    const settings = await db.DeliverySetting.find()
    const obj = {}
    settings.forEach(s => { obj[s.key] = ['free_delivery_threshold', 'default_delivery_charge'].includes(s.key) ? Number(s.value) : s.value })
    res.json(obj)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/delivery-settings', adminAuth, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db.DeliverySetting.updateOne({ key }, { $set: { value } }, { upsert: true })
    }
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== PAYMENT SETTINGS ====================
router.get('/payment-settings', adminAuth, async (req, res) => {
  try {
    const settings = await db.PaymentSetting.find()
    const obj = {}
    settings.forEach(s => { obj[s.key] = s.value })
    res.json(obj)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/payment-settings', adminAuth, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db.PaymentSetting.updateOne({ key }, { $set: { value } }, { upsert: true })
    }
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== BUSINESS SETTINGS ====================
router.get('/business-settings', adminAuth, async (req, res) => {
  try {
    const settings = await db.BusinessSetting.find()
    const obj = {}
    settings.forEach(s => { obj[s.key] = s.value })
    res.json(obj)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/business-settings', adminAuth, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db.BusinessSetting.updateOne({ key }, { $set: { value } }, { upsert: true })
    }
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== SITE ASSETS ====================
router.get('/site-assets', adminAuth, async (req, res) => {
  try {
    const assets = await db.SiteAsset.find()
    const obj = {}
    assets.forEach(a => { obj[a.key] = a.value })
    res.json(obj)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/site-assets', adminAuth, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db.SiteAsset.updateOne({ key }, { $set: { value } }, { upsert: true })
    }
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== QR CODE REGENERATE ====================
router.post('/qr-codes/:id/regenerate', adminAuth, async (req, res) => {
  try {
    const { target_url } = req.body
    const qr = await db.QRCode.findByIdAndUpdate(req.params.id, { target_url, image_url: '' }, { new: true })
    // Generate QR image URL using qrserver API
    if (qr.target_url) {
      qr.image_url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr.target_url)}`
      await qr.save()
    }
    res.json(qr)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== DASHBOARD ====================
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalRevenue, totalCustomers, recentOrders, lowStock, orderStatusCounts] = await Promise.all([
      db.Product.countDocuments({ is_active: true }),
      db.Order.countDocuments(),
      db.Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      db.Order.distinct('user_phone').then(p => p.length),
      db.Order.find().sort('-createdAt').limit(5).lean(),
      db.Product.countDocuments({ stock_quantity: { $lte: 10 }, is_active: true }),
      db.Order.aggregate([{ $group: { _id: '$order_status', count: { $sum: 1 } } }])
    ])
    const revenue = totalRevenue[0]?.total || 0
    const ordersByStatus = {}
    orderStatusCounts.forEach(s => { ordersByStatus[s._id] = s.count })

    // Categorize orders for chart (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
    const recentDays = await db.Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } }
    ])

    res.json({ totalProducts, totalOrders, totalRevenue: revenue, totalCustomers, recentOrders, lowStock, ordersByStatus, chart: recentDays })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== AUDIT LOGS ====================
router.get('/audit-logs', adminAuth, async (req, res) => {
  try {
    res.json(await db.AuditLog.find().sort('-createdAt').limit(200))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== CUSTOMERS ====================
router.get('/customers', adminAuth, async (req, res) => {
  try {
    const { search } = req.query
    let query = {}
    if (search) {
      query.$or = [
        { user_name: { $regex: search, $options: 'i' } },
        { user_phone: { $regex: search, $options: 'i' } }
      ]
    }
    const customers = await db.Order.aggregate([
      { $match: query },
      { $group: { _id: '$user_phone', name: { $first: '$user_name' }, phone: { $first: '$user_phone' }, address: { $first: '$user_address' }, totalOrders: { $sum: 1 }, totalSpent: { $sum: '$total' }, firstOrder: { $min: '$createdAt' } } },
      { $sort: { firstOrder: -1 } }
    ])
    res.json(customers)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== PUBLIC ROUTES (no auth) ====================
router.get('/public/categories', async (req, res) => {
  try { res.json(await db.Category.find({ is_active: true }).sort('sort_order')) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/public/products', async (req, res) => {
  try {
    const { category, search } = req.query
    let query = { is_active: true }
    if (category) query.category = category
    if (search) query.name = { $regex: search, $options: 'i' }
    const products = await db.Product.find(query).sort('sort_order').lean()
    // Attach variants
    const ids = products.map(p => p._id)
    const variants = await db.ProductVariant.find({ product_id: { $in: ids }, is_active: true }).lean()
    const groups = {}
    variants.forEach(v => { (groups[v.product_id] = groups[v.product_id] || []).push({ ...v, id: v._id }) })
    products.forEach(p => { p.variants = groups[p._id] || []; if (p.variants.length) { const first = p.variants[0]; p.base_price = first.price; p.unit = first.unit } })
    res.json(products)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/public/product/:id', async (req, res) => {
  try {
    const product = await db.Product.findById(req.params.id).lean()
    if (!product) return res.status(404).json({ error: 'Not found' })
    product.variants = await db.ProductVariant.find({ product_id: product._id, is_active: true }).lean()
    product.images = await db.ProductImage.find({ product_id: product._id }).sort('sort_order').lean()
    res.json(product)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/public/bundles', async (req, res) => {
  try {
    const bundles = await db.Bundle.find({ is_active: true }).sort('sort_order').lean()
    for (const bundle of bundles) {
      const items = await db.BundleItem.find({ bundle_id: bundle._id }).populate('product_id', 'name image_url').populate('variant_id', 'unit price').lean()
      bundle.items = items
    }
    res.json(bundles)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/public/banners', async (req, res) => {
  try { res.json(await db.Banner.find({ is_active: true }).sort('sort_order')) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/public/announcements', async (req, res) => {
  try { res.json(await db.Announcement.find({ is_active: true }).sort('sort_order')) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/public/farmers', async (req, res) => {
  try { res.json(await db.Farmer.find({ is_active: true, is_approved: true })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/public/business-settings', async (req, res) => {
  try {
    const settings = await db.BusinessSetting.find()
    const obj = {}
    settings.forEach(s => { obj[s.key] = ['delivery_charge', 'free_delivery_threshold', 'min_order_amount'].includes(s.key) ? Number(s.value) : s.value })
    res.json(obj)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/public/site-assets', async (req, res) => {
  try {
    const assets = await db.SiteAsset.find()
    const obj = {}
    assets.forEach(a => { obj[a.key] = a.value })
    res.json(obj)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ==================== PUBLIC USER AUTH ====================
router.post('/public/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body
    if (await db.UserProfile.findOne({ email })) return res.status(400).json({ error: 'Email already registered' })
    const profile = await db.UserProfile.create({ email, full_name, password: await bcrypt.hash(password, 10) })
    const token = jwt.sign({ id: profile._id, email: profile.email }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.status(201).json({ token, user: { id: profile._id, email: profile.email, full_name: profile.full_name } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/public/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const profile = await db.UserProfile.findOne({ email })
    if (!profile || !(await bcrypt.compare(password, profile.password)))
      return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: profile._id, email: profile.email }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: profile._id, email: profile.email, full_name: profile.full_name } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/public/qr/:id', async (req, res) => {
  try { res.json(await db.QRCode.findById(req.params.id)) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/public/coupon/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body
    const coupon = await db.Coupon.findOne({ coupon_code: code.toUpperCase(), is_active: true })
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' })
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) return res.status(400).json({ error: 'Coupon expired' })
    if (coupon.min_order_value && orderTotal < coupon.min_order_value) return res.status(400).json({ error: `Minimum order of ₹${coupon.min_order_value} required` })
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return res.status(400).json({ error: 'Coupon usage limit reached' })
    res.json(coupon)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/public/orders', async (req, res) => {
  try {
    const order = await db.Order.create(req.body)
    res.status(201).json(order)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/public/order/:id', async (req, res) => {
  try { res.json(await db.Order.findById(req.params.id)) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/public/qr/scan', async (req, res) => {
  try {
    const { qr_id } = req.body
    const qr = await db.QRCode.findByIdAndUpdate(qr_id, { $inc: { scan_count: 1 } }, { new: true })
    res.json(qr)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/public/farmer-requests', async (req, res) => {
  try { res.status(201).json(await db.FarmerRequest.create(req.body)) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
