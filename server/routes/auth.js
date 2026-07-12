import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'
import AdminUser from '../models/AdminUser.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    let admin = await AdminUser.findOne({ email: email.toLowerCase() })
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' })
    const valid = await admin.comparePassword(password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    if (!admin.is_active) return res.status(403).json({ error: 'Account disabled' })
    const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/me', requireAdmin, (req, res) => {
  res.json({ id: req.admin._id, email: req.admin.email, name: req.admin.name, role: req.admin.role })
})

export default router
