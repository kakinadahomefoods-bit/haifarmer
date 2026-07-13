import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  admin_id: { type: String, default: '' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entity_id: { type: String, default: null },
  details: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true, toJSON: { virtuals: true } })

schema.index({ createdAt: -1 })
schema.index({ entity: 1, entity_id: 1 })

export default mongoose.model('AuditLog', schema)
