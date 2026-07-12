import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  provider: { type: String, enum: ['razorpay', 'whatsapp'], default: 'whatsapp' },
  razorpay_key_id: { type: String, default: '' },
  razorpay_key_secret: { type: String, default: '' },
  whatsapp_number: { type: String, default: '' },
  whatsapp_message_template: { type: String, default: '' }
}, { timestamps: true })

export default mongoose.model('PaymentSetting', schema)
