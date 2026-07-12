import { api } from '../../services/api'

const ADMIN_TOKEN_KEY = 'haifarmer_admin_token'

export async function adminLogin(email, password) {
  const data = await api.post('/auth/login', { email, password })
  localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
  localStorage.setItem('adminSession', JSON.stringify(data.admin))
  localStorage.setItem('admin_id', data.admin.id)
  return data
}

export async function adminLogout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem('adminSession')
  localStorage.removeItem('admin_id')
}

export async function verifyAdminSession() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (!token) return null
  try {
    const admin = await api.get('/auth/me')
    return admin
  } catch {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem('adminSession')
    localStorage.removeItem('admin_id')
    return null
  }
}

export function getAuthHeaders() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}
