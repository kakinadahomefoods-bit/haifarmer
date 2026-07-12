import { Router } from 'express'
import Order from '../models/Order.js'
import OrderTimeline from '../models/OrderTimeline.js'
import { requireAdmin } from '../middleware/auth.js'
import { v4 as uuid } from 'uuid'

const router = Router()

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { search, status, payment, from, to, page = '0', limit = '20' } = req.query
    const query = {}
    if (status && status !== 'all') query.status = status
    if (payment) query.payment_method = payment
    if (search) query.$or = [{ order_id: { $regex: search, $options: 'i' } }, { user_name: { $regex: search, $options: 'i' } }, { user_phone: { $regex: search, $options: 'i' } }]
    const skip = parseInt(page) * parseInt(limit)
    const [orders, total] = await Promise.all([Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)), Order.countDocuments(query)])
    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/:id', requireAdmin, async (req, res) => {
  try { const item = await Order.findById(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const item = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    if (req.body.status) await OrderTimeline.create({ order_id: item._id, status: req.body.status, note: req.body.notes || '', updated_by: req.admin?.name || 'admin' })
    res.json(item)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.get('/:id/timeline', requireAdmin, async (req, res) => {
  try { const items = await OrderTimeline.find({ order_id: req.params.id }).sort({ createdAt: -1 }); res.json(items) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
