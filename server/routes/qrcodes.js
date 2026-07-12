import { Router } from 'express'
import QRCode from '../models/QRCode.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const order = req.query.order || '-createdAt'
    const data = await QRCode.find().sort(order)
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAdmin, async (req, res) => {
  try { const item = await QRCode.create(req.body); res.status(201).json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try { const item = await QRCode.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try { await QRCode.findByIdAndDelete(req.params.id); res.json({ deleted: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/:id/regenerate', requireAdmin, async (req, res) => {
  try {
    const { target_url } = req.body
    const item = await QRCode.findByIdAndUpdate(req.params.id, { target_url: target_url || undefined }, { new: true })
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
