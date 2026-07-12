import { Router } from 'express'
import Farmer from '../models/Farmer.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const order = req.query.order || '-createdAt'
    const query = req.query.all === 'true' ? {} : { is_active: true, is_approved: true }
    const data = await Farmer.find(query).sort(order)
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/:id', async (req, res) => {
  try { const item = await Farmer.findById(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAdmin, async (req, res) => {
  try { const item = await Farmer.create(req.body); res.status(201).json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try { const item = await Farmer.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try { await Farmer.findByIdAndDelete(req.params.id); res.json({ deleted: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
