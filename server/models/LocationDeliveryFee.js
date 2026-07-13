import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  location: { type: String, required: true },
  charge: { type: Number, default: 0 },
  min_order: { type: Number, default: 0 }
}, { timestamps: true, toJSON: { virtuals: true } })

schema.index({ location: 1 })

export default mongoose.model('LocationDeliveryFee', schema)
