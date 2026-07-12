import { Router } from 'express'
import Coupon from '../models/Coupon.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const query = {}
    if (req.query.search) query.coupon_code = { $regex: req.query.search, $options: 'i' }
    const order = req.query.order || '-createdAt'
    const data = await Coupon.find(query).sort(order)
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/:id', async (req, res) => {
  try { const item = await Coupon.findById(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { coupon_code } = req.body
    if (!coupon_code) return res.status(400).json({ error: 'Coupon code required' })
    const item = await Coupon.create({ ...req.body, coupon_code: coupon_code.toUpperCase() })
    res.status(201).json(item)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try { const item = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try { await Coupon.findByIdAndDelete(req.params.id); res.json({ deleted: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/batch', requireAdmin, async (req, res) => {
  try {
    const { prefix = '', count = 1, discount_type, discount_value, min_order_value, max_discount, expiry_date, usage_limit, scope, applicable_products, applicable_categories } = req.body
    const codes = []
    for (let i = 0; i < count; i++) {
      const code = prefix + Math.random().toString(36).substring(2, 8).toUpperCase()
      codes.push({ coupon_code: code, discount_type, discount_value, min_order_value: min_order_value || 0, max_discount, expiry_date: expiry_date || null, usage_limit: usage_limit || 1, scope: scope || 'all', applicable_products: applicable_products || [], applicable_categories: applicable_categories || [] })
    }
    await Coupon.insertMany(codes)
    res.status(201).json({ count: codes.length })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.get('/export', requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().lean()
    const header = 'coupon_code,discount_type,discount_value,min_order_value,max_discount,expiry_date,usage_limit,used_count,scope'
    const rows = coupons.map(c => `${c.coupon_code},${c.discount_type},${c.discount_value},${c.min_order_value},${c.max_discount||''},${c.expiry_date?c.expiry_date.toISOString().split('T')[0]:''},${c.usage_limit},${c.used_count},${c.scope}`)
    res.type('text/csv').send([header, ...rows].join('\n'))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/import', requireAdmin, async (req, res) => {
  try {
    const lines = req.body.csv?.split('\n').filter(Boolean) || []
    const coupons = lines.slice(1).map(line => {
      const [coupon_code, discount_type, discount_value, min_order_value, max_discount, expiry_date, usage_limit] = line.split(',').map(s => s.trim())
      return { coupon_code: coupon_code?.toUpperCase(), discount_type, discount_value: Number(discount_value), min_order_value: Number(min_order_value||0), max_discount: max_discount ? Number(max_discount) : null, expiry_date: expiry_date || null, usage_limit: Number(usage_limit||1) }
    })
    const result = await Coupon.insertMany(coupons)
    res.json({ count: result.length })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

export default router
