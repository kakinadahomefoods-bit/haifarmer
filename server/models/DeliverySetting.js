import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  free_delivery_threshold: { type: Number, default: 0 },
  default_charge: { type: Number, default: 40 },
  same_day_delivery: { type: Boolean, default: false },
  express_delivery: { type: Boolean, default: false },
  pickup_available: { type: Boolean, default: false },
  cod_available: { type: Boolean, default: true },
  delivery_slots: { type: String, default: '' },
  delivery_note: { type: String, default: '' }
}, { timestamps: true, toJSON: { virtuals: true } })

export default mongoose.model('DeliverySetting', schema)
