import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  store_name: { type: String, default: '' },
  tagline: { type: String, default: '' },
  logo_url: { type: String, default: '' },
  favicon_url: { type: String, default: '' },
  primary_phone: { type: String, default: '' },
  secondary_phone: { type: String, default: '' },
  primary_email: { type: String, default: '' },
  address: { type: String, default: '' },
  footer_text: { type: String, default: '' },
  currency: { type: String, default: 'INR' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  terms_page: { type: String, default: '' },
  privacy_page: { type: String, default: '' },
  refund_page: { type: String, default: '' },
  shipping_page: { type: String, default: '' },
  about_page: { type: String, default: '' }
}, { timestamps: true })

export default mongoose.model('BusinessSetting', schema)
