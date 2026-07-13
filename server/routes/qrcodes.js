import { Router } from 'express'
import mongoose from 'mongoose'
import QRCode from '../models/QRCode.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
function isValidId(id) { return mongoose.Types.ObjectId.isValid(id) }

router.get('/', async (req, res) => {
  try {
    const order = req.query.order || '-createdAt'
    const data = await QRCode.find().sort(order)
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'QR name is required' })
    if (!req.body.target_url) return res.status(400).json({ error: 'Target URL is required' })
    const item = await QRCode.create(req.body)
    res.status(201).json(item)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid QR code ID' })
    const item = await QRCode.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid QR code ID' })
    await QRCode.findByIdAndDelete(req.params.id)
    res.json({ deleted: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/:id/regenerate', requireAdmin, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid QR code ID' })
    const { target_url } = req.body
    if (!target_url) return res.status(400).json({ error: 'Target URL is required' })
    const item = await QRCode.findByIdAndUpdate(req.params.id, { target_url }, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Public: validate QR and increment scan
router.post('/validate', async (req, res) => {
  try {
    const { qr_id } = req.body
    if (!qr_id) return res.status(400).json({ error: 'QR ID required' })
    const qr = await QRCode.findById(qr_id)
    if (!qr) return res.status(404).json({ error: 'Invalid QR code' })
    if (!qr.is_active) return res.status(403).json({ error: 'QR code is disabled' })
    await QRCode.findByIdAndUpdate(qr_id, { $inc: { scan_count: 1 } })
    res.json({ valid: true, target_url: qr.target_url, name: qr.name })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
