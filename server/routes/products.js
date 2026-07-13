import { Router } from 'express'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import ProductVariant from '../models/ProductVariant.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
function isValidId(id) { return mongoose.Types.ObjectId.isValid(id) }

router.get('/', async (req, res) => {
  try {
    const { search, order = '-createdAt', category, all } = req.query
    const query = {}
    if (all !== 'true') query.is_active = true
    if (category) query.category = category
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }]
    const sort = {}
    const field = order.replace(/^-/, '')
    sort[field] = order.startsWith('-') ? -1 : 1
    const data = await Product.find(query).sort(sort)
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' })
    const item = await Product.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    const variants = await ProductVariant.find({ product_id: item._id })
    res.json({ ...item.toObject(), variants })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { variants, ...productData } = req.body
    if (!productData.name || !productData.name.trim()) return res.status(400).json({ error: 'Product name is required' })
    productData.base_price = Math.max(0, Number(productData.base_price) || 0)
    productData.discount_percent = Math.min(100, Math.max(0, Number(productData.discount_percent) || 0))
    productData.stock_quantity = Math.max(0, Number(productData.stock_quantity) || 0)
    productData.final_price = productData.base_price * (1 - productData.discount_percent / 100)
    const product = await Product.create(productData)
    if (variants?.length) {
      await ProductVariant.insertMany(variants.map(v => ({ ...v, product_id: product._id })))
    }
    res.status(201).json(product)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' })
    const { variants, ...productData } = req.body
    if (productData.base_price !== undefined) productData.base_price = Math.max(0, Number(productData.base_price) || 0)
    if (productData.discount_percent !== undefined) {
      productData.discount_percent = Math.min(100, Math.max(0, Number(productData.discount_percent) || 0))
      productData.final_price = productData.base_price * (1 - productData.discount_percent / 100)
    }
    if (productData.stock_quantity !== undefined) productData.stock_quantity = Math.max(0, Number(productData.stock_quantity) || 0)
    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ error: 'Not found' })
    if (variants) {
      await ProductVariant.deleteMany({ product_id: product._id })
      if (variants.length) await ProductVariant.insertMany(variants.map(v => ({ ...v, product_id: product._id })))
    }
    res.json(product)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' })
    await Product.findByIdAndDelete(req.params.id)
    await ProductVariant.deleteMany({ product_id: req.params.id })
    res.json({ deleted: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/bulk-update', requireAdmin, async (req, res) => {
  try {
    const { ids, updates } = req.body
    if (updates.discount_percent !== undefined) updates.final_price = { $multiply: ['$base_price', 1 - updates.discount_percent / 100] }
    await Product.updateMany({ _id: { $in: ids } }, { $set: updates })
    res.json({ updated: ids.length })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.post('/bulk-delete', requireAdmin, async (req, res) => {
  try {
    await Product.deleteMany({ _id: { $in: req.body.ids } })
    await ProductVariant.deleteMany({ product_id: { $in: req.body.ids } })
    res.json({ deleted: req.body.ids.length })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.post('/:id/duplicate', requireAdmin, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' })
    const original = await Product.findById(req.params.id)
    if (!original) return res.status(404).json({ error: 'Not found' })
    const copy = await Product.create({ ...original.toObject(), _id: undefined, name: `${original.name} (Copy)`, createdAt: undefined, updatedAt: undefined })
    const variants = await ProductVariant.find({ product_id: original._id })
    if (variants.length) await ProductVariant.insertMany(variants.map(v => ({ ...v.toObject(), _id: undefined, product_id: copy._id })))
    res.status(201).json(copy)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Variant routes nested under products
router.get('/:productId/variants', async (req, res) => {
  try { const items = await ProductVariant.find({ product_id: req.params.productId }); res.json(items) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/:productId/variants', requireAdmin, async (req, res) => {
  try { const item = await ProductVariant.create({ ...req.body, product_id: req.params.productId }); res.status(201).json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

// Standalone variant routes for update/delete
router.put('/variants/:id', requireAdmin, async (req, res) => {
  try { const item = await ProductVariant.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(item) }
  catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/variants/:id', requireAdmin, async (req, res) => {
  try { await ProductVariant.findByIdAndDelete(req.params.id); res.json({ deleted: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
