import { Router } from 'express'
import BusinessSetting from '../models/BusinessSetting.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

async function getOrCreate() {
  let s = await BusinessSetting.findOne()
  if (!s) { s = await BusinessSetting.create({}) }
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
