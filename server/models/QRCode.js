import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  target_url: { type: String, default: '' },
  qr_image_url: { type: String, default: '' },
  scan_count: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
, { timestamps: true, toJSON: { virtuals: true } })

export default mongoose.model('QRCode', schema)
