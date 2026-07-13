import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  discount_percent: { type: Number, default: 0 },
  unit: { type: String, default: '' },
  unit_count: { type: Number, default: 1 },
  stock_quantity: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true } })

schema.index({ product_id: 1 })

export default mongoose.model('ProductVariant', schema)
