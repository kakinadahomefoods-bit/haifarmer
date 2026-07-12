import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { MONGO_URI, MONGO_URI_DIRECT, PORT } from './config.js'
import authRoutes from './routes/auth.js'
import categoryRoutes from './routes/categories.js'
import productRoutes from './routes/products.js'
import bundleRoutes from './routes/bundles.js'
import couponRoutes from './routes/coupons.js'
import orderRoutes from './routes/orders.js'
import bannerRoutes from './routes/banners.js'
import announcementRoutes from './routes/announcements.js'
import farmerRoutes from './routes/farmers.js'
import qrRoutes from './routes/qrcodes.js'
import businessSettingRoutes from './routes/businessSettings.js'
import siteAssetRoutes from './routes/siteAssets.js'
import deliverySettingRoutes from './routes/deliverySettings.js'
import locationFeeRoutes from './routes/locationDeliveryFees.js'
import paymentSettingRoutes from './routes/paymentSettings.js'
import dashboardRoutes from './routes/dashboard.js'
import customerRoutes from './routes/customers.js'
import auditLogRoutes from './routes/auditLogs.js'
import { requireAdmin } from './middleware/auth.js'
import AdminUser from './models/AdminUser.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/bundles', bundleRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/banners', bannerRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/farmers', farmerRoutes)
app.use('/api/qr-codes', qrRoutes)
app.use('/api/business-settings', businessSettingRoutes)
app.use('/api/site-assets', siteAssetRoutes)
app.use('/api/delivery-settings', deliverySettingRoutes)
app.use('/api/location-delivery-fees', locationFeeRoutes)
app.use('/api/payment-settings', paymentSettingRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/audit-logs', auditLogRoutes)

// Public routes that mirror private ones (no auth)
const publicRouter = express.Router()
publicRouter.get('/categories', async (req, res) => { req.query.all = 'false'; categoryRoutes(req, res) })
publicRouter.get('/products', async (req, res) => { productRoutes(req, res) })
publicRouter.get('/products/:id', async (req, res) => { productRoutes(req, res) })
publicRouter.get('/products/:productId/variants', async (req, res) => { productRoutes(req, res) })
publicRouter.get('/bundles', async (req, res) => { bundleRoutes(req, res) })
publicRouter.get('/banners', async (req, res) => { bannerRoutes(req, res) })
publicRouter.get('/announcements', async (req, res) => { announcementRoutes(req, res) })
publicRouter.get('/farmers', async (req, res) => { farmerRoutes(req, res) })
publicRouter.post('/qr-codes/validate', async (req, res) => { qrRoutes(req, res) })
publicRouter.get('/business-settings', async (req, res) => { businessSettingRoutes(req, res) })
publicRouter.get('/site-assets', async (req, res) => { siteAssetRoutes(req, res) })
publicRouter.get('/delivery-settings', async (req, res) => { deliverySettingRoutes(req, res) })
publicRouter.get('/payment-settings', async (req, res) => { paymentSettingRoutes(req, res) })
app.use('/api/public', publicRouter)

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

// Connect and start
async function start() {
  try {
    try { await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 }) }
    catch { await mongoose.connect(MONGO_URI_DIRECT, { serverSelectionTimeoutMS: 10000 }) }
    console.log('Connected to MongoDB')
    // Seed default admin if none exists
    const adminCount = await AdminUser.countDocuments()
    if (adminCount === 0) {
      await AdminUser.create({ email: 'admin@gmail.com', password: 'admin1234', name: 'Admin', role: 'superadmin' })
      console.log('Default admin created: admin@gmail.com / admin1234')
    }
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  } catch (e) { console.error('Startup error:', e); process.exit(1) }
}

start()
