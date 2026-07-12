import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'
import AdminUser from '../models/AdminUser.js'

export async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' })
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const admin = await AdminUser.findById(decoded.id)
    if (!admin) return res.status(401).json({ error: 'Admin not found' })
    req.admin = admin
    next()
  } catch { return res.status(401).json({ error: 'Invalid token' }) }
}
