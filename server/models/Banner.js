import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  button_text: { type: String, default: '' },
  button_url: { type: String, default: '' },
  desktop_image_url: { type: String, default: '' },
  mobile_image_url: { type: String, default: '' },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  starts_at: { type: Date, default: null },
  ends_at: { type: Date, default: null }
}, { timestamps: true, toJSON: { virtuals: true } })

schema.index({ sort_order: 1 })

export default mongoose.model('Banner', schema)
