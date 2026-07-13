import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  crop: { type: String, default: '' },
  image_url: { type: String, default: '' },
  address: { type: String, default: '' },
  description: { type: String, default: '' },
  is_approved: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true } })

schema.index({ is_approved: 1, is_active: 1 })

export default mongoose.model('Farmer', schema)
