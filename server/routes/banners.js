import { Router } from 'express'
import mongoose from 'mongoose'
import Banner from '../models/Banner.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

router.get('/', async (req, res) => {
  try {
    const order = req.query.order || 'sort_order'
    const query = req.query.all === 'true' ? {} : { is_active: true }
    const data = await Banner.find(query).sort(order)
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid banner ID' })
    const item = await Banner.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Banner not found' })
    res.json(item)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAdmin, async (req, res) => {
  try { const item = await Banner.create(req.body); res.status(201).json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid banner ID' })
    const item = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Banner not found' })
    res.json(item)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid banner ID' })
    await Banner.findByIdAndDelete(req.params.id)
    res.json({ deleted: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
