import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  status: { type: String, required: true },
  note: { type: String, default: '' },
  updated_by: { type: String, default: 'system' }
}, { timestamps: true })

schema.index({ order_id: 1, createdAt: -1 })

export default mongoose.model('OrderTimeline', schema)
