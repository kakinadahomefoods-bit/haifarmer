import { Router } from 'express'
import AuditLog from '../models/AuditLog.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAdmin, async (req, res) => {
  try { const data = await AuditLog.find().sort({ createdAt: -1 }).limit(200); res.json(data) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAdmin, async (req, res) => {
  try { const item = await AuditLog.create(req.body); res.status(201).json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

export default router
