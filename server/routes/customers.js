import { Router } from 'express'
import Order from '../models/Order.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAdmin, async (req, res) => {
  try {
    const search = req.query.search || ''
    const match = search ? { $or: [{ user_name: { $regex: search, $options: 'i' } }, { user_phone: { $regex: search, $options: 'i' } }] } : {}
    const customers = await Order.aggregate([
      { $match: match },
      { $group: { _id: { name: '$user_name', phone: '$user_phone' }, name: { $first: '$user_name' }, phone: { $first: '$user_phone' }, email: { $first: '$user_email' }, address: { $first: '$user_address' }, total_orders: { $sum: 1 }, total_spent: { $sum: '$total' }, first_order: { $min: '$createdAt' }, last_order: { $max: '$createdAt' } } },
      { $sort: { last_order: -1 } }
    ])
    res.json(customers.map(c => ({ id: c._id.name + c._id.phone, name: c.name, phone: c.phone, email: c.email, address: c.address, total_orders: c.total_orders, total_spent: c.total_spent, joined_at: c.first_order, last_order: c.last_order })))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
