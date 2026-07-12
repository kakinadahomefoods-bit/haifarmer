import { Router } from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Coupon from '../models/Coupon.js'
import Farmer from '../models/Farmer.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAdmin, async (req, res) => {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const [
      totalOrders, monthOrders, totalRevenue, monthRevenue,
      totalProducts, totalCategories, activeCoupons, approvedFarmers,
      recentOrders, pendingOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Product.countDocuments({ is_active: true }),
      Category.countDocuments({ is_active: true }),
      Coupon.countDocuments({ is_active: true }),
      Farmer.countDocuments({ is_approved: true }),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Order.countDocuments({ status: 'pending' })
    ])
    res.json({
      total_orders: totalOrders, month_orders: monthOrders,
      total_revenue: totalRevenue[0]?.total || 0, month_revenue: monthRevenue[0]?.total || 0,
      total_products: totalProducts, total_categories: totalCategories,
      active_coupons: activeCoupons, approved_farmers: approvedFarmers,
      recent_orders: recentOrders, pending_orders: pendingOrders
    })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
