import mongoose from 'mongoose'

const Schema = mongoose.Schema

// --- Category ---
const categorySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  image_url: String,
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true })

// --- Product ---
const productSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  base_price: { type: Number, required: true },
  discount_percent: { type: Number, default: 0 },
  discount_price: Number,
  unit: { type: String, default: '500g' },
  weight: String,
  image_url: String,
  stock_quantity: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false },
  is_best_seller: { type: Boolean, default: false },
  is_new_arrival: { type: Boolean, default: false },
  is_trending: { type: Boolean, default: false },
  sort_order: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true })

// --- Product Variant ---
const productVariantSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: Number,
  stock: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true })

// --- Product Image ---
const productImageSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  image_url: { type: String, required: true },
  sort_order: { type: Number, default: 0 }
}, { timestamps: true })

// --- Bundle ---
const bundleSchema = new Schema({
  bundle_name: { type: String, required: true },
  bundle_description: String,
  bundle_price: { type: Number, required: true },
  bundle_discount_percent: { type: Number, default: 0 },
  bundle_image_url: String,
  is_combo: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 }
}, { timestamps: true })

// --- Bundle Item ---
const bundleItemSchema = new Schema({
  bundle_id: { type: Schema.Types.ObjectId, ref: 'Bundle', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
  quantity: { type: Number, default: 1 }
}, { timestamps: true })

// --- Coupon ---
const couponSchema = new Schema({
  coupon_code: { type: String, required: true, unique: true },
  batch_name: String,
  prefix: String,
  discount_type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discount_value: { type: Number, required: true },
  min_order_value: { type: Number, default: 0 },
  max_discount: Number,
  expiry_date: Date,
  usage_limit: { type: Number, default: 1 },
  used_count: { type: Number, default: 0 },
  scope: { type: String, enum: ['all', 'products', 'combos'], default: 'all' },
  applicable_products: [String],
  applicable_categories: [String],
  is_active: { type: Boolean, default: true }
}, { timestamps: true })

// --- Banner ---
const bannerSchema = new Schema({
  title: { type: String, required: true },
  subtitle: String,
  button_text: String,
  button_url: String,
  desktop_image_url: String,
  mobile_image_url: String,
  is_active: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 },
  starts_at: Date,
  ends_at: Date
}, { timestamps: true })

// --- Announcement ---
const announcementSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  link_url: String,
  is_active: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 }
}, { timestamps: true })

// --- Farmer ---
const farmerSchema = new Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  crop: String,
  image_url: String,
  address: String,
  description: String,
  is_approved: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true }
}, { timestamps: true })

// --- Farmer Request ---
const farmerRequestSchema = new Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  crop: String,
  message: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true })

// --- QR Code ---
const qrCodeSchema = new Schema({
  title: { type: String, required: true },
  target_url: { type: String, required: true },
  image_url: String,
  scan_count: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true })

// --- Order ---
const orderSchema = new Schema({
  order_id: { type: String, unique: true },
  user_id: String,
  user_name: String,
  user_phone: String,
  user_address: String,
  items: [{
    product_id: String,
    product_name: String,
    quantity: Number,
    unit: String,
    price: Number,
    image_url: String
  }],
  subtotal: { type: Number, required: true },
  delivery_charge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  coupon_code: String,
  total: { type: Number, required: true },
  payment_method: String,
  payment_status: { type: String, default: 'pending' },
  order_status: { type: String, default: 'pending' },
  delivery_date: String,
  delivery_slot: String,
  notes: String,
  address_label: String
}, { timestamps: true })

// --- Order Timeline ---
const orderTimelineSchema = new Schema({
  order_id: { type: String, required: true },
  status: { type: String, required: true },
  note: String,
  changed_by: String
}, { timestamps: true })

// --- Delivery Setting ---
const deliverySettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: Schema.Types.Mixed
}, { timestamps: true })

// --- Location Delivery Fee ---
const locationDeliveryFeeSchema = new Schema({
  location: { type: String, required: true },
  fee: { type: Number, required: true },
  min_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true })

// --- Payment Setting ---
const paymentSettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: Schema.Types.Mixed
}, { timestamps: true })

// --- Business Setting ---
const businessSettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: Schema.Types.Mixed
}, { timestamps: true })

// --- Site Asset ---
const siteAssetSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: Schema.Types.Mixed
}, { timestamps: true })

// --- Admin User ---
const adminUserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, default: 'admin' },
  is_active: { type: Boolean, default: true }
}, { timestamps: true })

// --- Admin Session ---
const adminSessionSchema = new Schema({
  admin_id: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  token: { type: String, required: true },
  expires_at: Date
}, { timestamps: true })

// --- Audit Log ---
const auditLogSchema = new Schema({
  action: { type: String, required: true },
  entity: String,
  entity_id: String,
  details: Schema.Types.Mixed,
  admin_id: String
}, { timestamps: true })

// --- Cart Item ---
const cartItemSchema = new Schema({
  session_id: String,
  user_id: String,
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
  quantity: { type: Number, default: 1 },
  unit: String,
  price: Number
}, { timestamps: true })

// --- User Profile ---
const userProfileSchema = new Schema({
  full_name: String,
  name: String,
  email: { type: String, unique: true, sparse: true },
  password: String,
  phone: { type: String, unique: true, sparse: true },
  address: String,
  city: String,
  state: String,
  pincode: String
}, { timestamps: true })

// --- Export all models ---
export const Category = mongoose.model('Category', categorySchema)
export const Product = mongoose.model('Product', productSchema)
export const ProductVariant = mongoose.model('ProductVariant', productVariantSchema)
export const ProductImage = mongoose.model('ProductImage', productImageSchema)
export const Bundle = mongoose.model('Bundle', bundleSchema)
export const BundleItem = mongoose.model('BundleItem', bundleItemSchema)
export const Coupon = mongoose.model('Coupon', couponSchema)
export const Banner = mongoose.model('Banner', bannerSchema)
export const Announcement = mongoose.model('Announcement', announcementSchema)
export const Farmer = mongoose.model('Farmer', farmerSchema)
export const FarmerRequest = mongoose.model('FarmerRequest', farmerRequestSchema)
export const QRCode = mongoose.model('QRCode', qrCodeSchema)
export const Order = mongoose.model('Order', orderSchema)
export const OrderTimeline = mongoose.model('OrderTimeline', orderTimelineSchema)
export const DeliverySetting = mongoose.model('DeliverySetting', deliverySettingSchema)
export const LocationDeliveryFee = mongoose.model('LocationDeliveryFee', locationDeliveryFeeSchema)
export const PaymentSetting = mongoose.model('PaymentSetting', paymentSettingSchema)
export const BusinessSetting = mongoose.model('BusinessSetting', businessSettingSchema)
export const SiteAsset = mongoose.model('SiteAsset', siteAssetSchema)
export const AdminUser = mongoose.model('AdminUser', adminUserSchema)
export const AdminSession = mongoose.model('AdminSession', adminSessionSchema)
export const AuditLog = mongoose.model('AuditLog', auditLogSchema)
export const CartItem = mongoose.model('CartItem', cartItemSchema)
export const UserProfile = mongoose.model('UserProfile', userProfileSchema)
