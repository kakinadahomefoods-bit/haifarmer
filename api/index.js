import mongoose from 'mongoose'
import { MONGO_URI, MONGO_URI_DIRECT } from '../server/config.js'
import { createApp } from '../server/app.js'
import AdminUser from '../server/models/AdminUser.js'

let conn = null
let seeded = false

async function connect() {
  if (conn) return conn
  try {
    conn = await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  } catch (e) {
    console.warn('Primary MONGO_URI failed:', e.message, 'trying MONGO_URI_DIRECT')
    conn = await mongoose.connect(MONGO_URI_DIRECT, { serverSelectionTimeoutMS: 10000 })
  }
  return conn
}

const app = createApp()

export default async function handler(req, res) {
  try {
    await connect()
    if (!seeded) {
      const count = await AdminUser.countDocuments()
      if (count === 0) {
        await AdminUser.create({ email: 'admin@gmail.com', password: 'admin1234', name: 'Admin', role: 'superadmin' })
        console.log('Default admin seeded')
      }
      seeded = true
    }
    app(req, res)
  } catch (err) {
    console.error('FUNCTION_INVOCATION_FAILED:', err)
    res.status(500).json({ error: 'Internal server error: ' + err.message })
  }
}
