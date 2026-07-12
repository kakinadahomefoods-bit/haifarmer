import { Router } from 'express'
import LocationDeliveryFee from '../models/LocationDeliveryFee.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try { const order = req.query.order || 'location'; const data = await LocationDeliveryFee.find().sort(order); res.json(data) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAdmin, async (req, res) => {
  try { const item = await LocationDeliveryFee.create(req.body); res.status(201).json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try { const item = await LocationDeliveryFee.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try { await LocationDeliveryFee.findByIdAndDelete(req.params.id); res.json({ deleted: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
