import mongoose from 'mongoose'
import { MONGO_URI, MONGO_URI_DIRECT, PORT } from './config.js'
import { createApp } from './app.js'
import AdminUser from './models/AdminUser.js'

async function start() {
  try {
    try { await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 }) }
    catch { await mongoose.connect(MONGO_URI_DIRECT, { serverSelectionTimeoutMS: 10000 }) }
    console.log('Connected to MongoDB')
    const adminCount = await AdminUser.countDocuments()
    if (adminCount === 0) {
      await AdminUser.create({ email: 'admin@gmail.com', password: 'admin1234', name: 'Admin', role: 'superadmin' })
      console.log('Default admin created: admin@gmail.com / admin1234')
    }
    const app = createApp()
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  } catch (e) { console.error('Startup error:', e); process.exit(1) }
}

start()
