import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  coupon_code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, default: '' },
  discount_type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discount_value: { type: Number, required: true },
  min_order_value: { type: Number, default: 0 },
  max_discount: { type: Number, default: null },
  usage_limit: { type: Number, default: 1 },
  used_count: { type: Number, default: 0 },
  scope: { type: String, enum: ['all', 'products', 'combos'], default: 'all' },
  applicable_products: [{ type: String }],
  applicable_categories: [{ type: String }],
  expiry_date: { type: Date, default: null },
  is_active: { type: Boolean, default: true }
}, { timestamps: true })
schema.index({ is_active: 1, expiry_date: 1 })

export default mongoose.model('Coupon', schema)
