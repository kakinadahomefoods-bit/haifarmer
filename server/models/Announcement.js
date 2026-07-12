import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  message: { type: String, default: '' },
  link: { type: String, default: '' },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true })

schema.index({ sort_order: 1 })

export default mongoose.model('Announcement', schema)
