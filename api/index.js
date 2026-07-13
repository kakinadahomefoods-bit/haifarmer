import mongoose from 'mongoose'
import { MONGO_URI, MONGO_URI_DIRECT } from '../server/config.js'
import { createApp } from '../server/app.js'
import AdminUser from '../server/models/AdminUser.js'

let conn = null

async function connect() {
  if (conn) return conn
  try {
    conn = await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  } catch {
    console.warn('Primary MONGO_URI failed, trying MONGO_URI_DIRECT')
    conn = await mongoose.connect(MONGO_URI_DIRECT, { serverSelectionTimeoutMS: 10000 })
  }
  const adminCount = await AdminUser.countDocuments()
  if (adminCount === 0) {
    await AdminUser.create({ email: 'admin@gmail.com', password: 'admin1234', name: 'Admin', role: 'superadmin' })
    console.log('Default admin seeded')
  }
  return conn
}

const app = createApp()

export default async function handler(req, res) {
  try {
    await connect()
    app(req, res)
  } catch (err) {
    console.error('FUNCTION_INVOCATION_FAILED:', err)
    res.status(500).json({ error: 'Internal server error: ' + err.message })
  }
}
