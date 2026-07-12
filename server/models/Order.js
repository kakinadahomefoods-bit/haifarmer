import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  order_id: { type: String },
  user_name: { type: String, default: '' },
  user_phone: { type: String, default: '' },
  user_email: { type: String, default: '' },
  user_address: { type: String, default: '' },
  items: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
    name: String, price: Number, quantity: Number, unit: String, image_url: String
  }],
  subtotal: { type: Number, default: 0 },
  delivery_charge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  coupon_code: { type: String, default: '' },
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  payment_method: { type: String, default: '' },
  payment_status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  payment_id: { type: String, default: '' },
  delivery_type: { type: String, default: 'standard' },
  delivery_slot: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true })

schema.index({ status: 1, payment_status: 1 })
schema.index({ createdAt: -1 })
schema.index({ user_phone: 1 })
schema.index({ order_id: 1 })

export default mongoose.model('Order', schema)
