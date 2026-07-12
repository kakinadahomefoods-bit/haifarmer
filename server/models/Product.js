import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  base_price: { type: Number, default: 0 },
  discount_percent: { type: Number, default: 0 },
  final_price: { type: Number, default: 0 },
  image_url: { type: String, default: '' },
  unit: { type: String, default: '250g' },
  unit_count: { type: Number, default: 1 },
  stock_quantity: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false },
  is_best_seller: { type: Boolean, default: false },
  is_new_arrival: { type: Boolean, default: false },
  is_trending: { type: Boolean, default: false },
  tags: [{ type: String }]
}, { timestamps: true })

schema.index({ name: 'text', description: 'text' })
schema.index({ category: 1 })
schema.index({ is_active: 1 })
schema.index({ is_featured: 1, is_best_seller: 1, is_new_arrival: 1, is_trending: 1 })

export default mongoose.model('Product', schema)
