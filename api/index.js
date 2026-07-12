import mongoose from 'mongoose'
import { MONGO_URI, MONGO_URI_DIRECT } from '../server/config.js'
import { createApp } from '../server/app.js'
import AdminUser from '../server/models/AdminUser.js'

let cached = global._mongoConn
if (!cached) cached = global._mongoConn = { conn: null, promise: null }

async function connect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
      .catch(() => mongoose.connect(MONGO_URI_DIRECT, { serverSelectionTimeoutMS: 10000 }))
  }
  cached.conn = await cached.promise

  const adminCount = await AdminUser.countDocuments()
  if (adminCount === 0) {
    await AdminUser.create({ email: 'admin@gmail.com', password: 'admin1234', name: 'Admin', role: 'superadmin' })
    console.log('Default admin seeded')
  }
  return cached.conn
}

const app = createApp()

export default async function handler(req, res) {
  await connect()
  return app(req, res)
}
