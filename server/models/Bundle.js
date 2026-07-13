import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  bundle_name: { type: String, required: true },
  bundle_description: { type: String, default: '' },
  bundle_price: { type: Number, default: 0 },
  bundle_discount_percent: { type: Number, default: 0 },
  bundle_image_url: { type: String, default: '' },
  is_combo: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true } })

schema.index({ is_active: 1 })

export default mongoose.model('Bundle', schema)
