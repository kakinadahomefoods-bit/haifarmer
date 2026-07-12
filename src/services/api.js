const API_BASE = 'http://localhost:4000/api'

function token() { return localStorage.getItem('haifarmer_admin_token') }

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

function headers(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra }
  const t = token()
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

export const api = {
  get: (path) => fetch(`${API_BASE}${path}`, { headers: headers() }).then(handleResponse),
  post: (path, body) => fetch(`${API_BASE}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  put: (path, body) => fetch(`${API_BASE}${path}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  delete: (path) => fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: headers() }).then(handleResponse),
}

export const publicApi = {
  get: (path) => fetch(`${API_BASE}/public${path}`).then(r => r.json()),
  post: (path, body) => fetch(`${API_BASE}/public${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
}
