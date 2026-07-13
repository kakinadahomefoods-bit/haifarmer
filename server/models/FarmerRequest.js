import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  crop: { type: String, default: '' },
  address: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true, toJSON: { virtuals: true } })

export default mongoose.model('FarmerRequest', schema)
