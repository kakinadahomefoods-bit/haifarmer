import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  bundle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bundle', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
  product_name: { type: String, default: '' },
  variant_name: { type: String, default: '' },
  quantity: { type: Number, default: 1 }
, { timestamps: true, toJSON: { virtuals: true } })

schema.index({ bundle_id: 1 })

export default mongoose.model('BundleItem', schema)
