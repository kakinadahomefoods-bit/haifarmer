import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  session_id: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
  name: { type: String, default: '' },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: '' },
  image_url: { type: String, default: '' }
}, { timestamps: true })

schema.index({ session_id: 1 })

export default mongoose.model('CartItem', schema)
