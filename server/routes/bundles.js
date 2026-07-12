import { Router } from 'express'
import Bundle from '../models/Bundle.js'
import BundleItem from '../models/BundleItem.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try { const order = req.query.order || '-createdAt'; const data = await Bundle.find({ is_active: true }).sort(order); res.json(data) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/all', async (req, res) => {
  try { const order = req.query.order || '-createdAt'; const data = await Bundle.find().sort(order); res.json(data) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/:id', async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id)
    if (!bundle) return res.status(404).json({ error: 'Not found' })
    const items = await BundleItem.find({ bundle_id: bundle._id })
    res.json({ ...bundle.toObject(), items })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAdmin, async (req, res) => {
  try { const item = await Bundle.create(req.body); res.status(201).json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try { const item = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try { await Bundle.findByIdAndDelete(req.params.id); await BundleItem.deleteMany({ bundle_id: req.params.id }); res.json({ deleted: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/:id/items', async (req, res) => {
  try { const items = await BundleItem.find({ bundle_id: req.params.id }); res.json(items) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/:id/items', requireAdmin, async (req, res) => {
  try {
    await BundleItem.deleteMany({ bundle_id: req.params.id })
    if (req.body.items?.length) await BundleItem.insertMany(req.body.items.map(i => ({ ...i, bundle_id: req.params.id })))
    res.json({ saved: req.body.items?.length || 0 })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

export default router
