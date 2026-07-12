import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Admin' },
  role: { type: String, default: 'admin', enum: ['admin', 'superadmin'] },
  is_active: { type: Boolean, default: true }
}, { timestamps: true })

schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

schema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('AdminUser', schema)
