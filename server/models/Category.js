import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image_url: { type: String, default: '' },
  slug: { type: String, default: '' },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true } })

schema.index({ sort_order: 1 })
schema.index({ is_active: 1 })
schema.index({ name: 'text' })

export default mongoose.model('Category', schema)
