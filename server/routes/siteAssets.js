import { Router } from 'express'
import SiteAsset from '../models/SiteAsset.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

async function getOrCreate() {
  let s = await SiteAsset.findOne()
  if (!s) { s = await SiteAsset.create({}) }
  return s
}

router.get('/', async (req, res) => {
  try { res.json(await getOrCreate()) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/', requireAdmin, async (req, res) => {
  try {
    let s = await getOrCreate()
    Object.assign(s, req.body)
    await s.save()
    res.json(s)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

export default router
