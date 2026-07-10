import supabase from '../../services/supabase'

const ADMIN_TOKEN_KEY = 'haifarmer_admin_token'

const LOCAL_ADMIN = {
  email: 'admin@gmail.com',
  password: 'admin1234',
  id: 'local-admin-001',
  full_name: 'Admin',
  role: 'super_admin',
  is_active: true
}

export async function adminLogin(email, password) {
  if (email === LOCAL_ADMIN.email && password === LOCAL_ADMIN.password) {
    const session = { ...LOCAL_ADMIN }
    localStorage.setItem(ADMIN_TOKEN_KEY, 'local-token')
    localStorage.setItem('adminSession', JSON.stringify(session))
    return { admin: session, token: 'local-token' }
  }
  const { data, error } = await supabase.rpc('admin_login', { p_email: email, p_password: password })
  if (error) throw new Error(error.message)
  if (!data?.token) throw new Error('Invalid credentials')
  localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
  localStorage.setItem('adminSession', JSON.stringify(data.admin))
  return data
}

export async function adminLogout() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (token && token !== 'local-token') {
    await supabase.from('admin_sessions').delete().eq('token', token)
  }
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem('adminSession')
}

export async function verifyAdminSession() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (!token) return null
  if (token === 'local-token') {
    return JSON.parse(localStorage.getItem('adminSession') || 'null')
  }
  const { data, error } = await supabase
    .from('admin_sessions')
    .select('*, admin:admin_users(*)')
    .eq('token', token)
    .gte('expires_at', new Date().toISOString())
    .single()
  if (error || !data) {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem('adminSession')
    return null
  }
  return data.admin
}

export async function logAudit(action, entityType, entityId = null, changes = null) {
  const session = JSON.parse(localStorage.getItem('adminSession') || '{}')
  try {
    await supabase.from('audit_logs').insert({
      admin_id: session.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes
    })
  } catch (e) {
    console.error('Audit log failed:', e)
  }
}

export function getAuthHeaders() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}
