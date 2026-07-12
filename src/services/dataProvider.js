import { publicApi } from './api'
import rawData from './supabase-data.json'

const API_HOST = 'http://localhost:4000'

async function tryApi(path) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_HOST}/api/public${path}`, { signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data) ? data : (data?.value || data)
    }
    return null
  } catch { return null }
}

async function fetchData(path) {
  const apiResult = await tryApi(path)
  if (apiResult) return apiResult
  // Fallback to JSON only if API fails
  return fromJson(path) || []
}

function fromJson(path) {
  const key = path.replace(/^\//, '').replace(/\//g, '.')
  const parts = key.split('.')
  let data = rawData
  for (const part of parts) {
    if (data && typeof data === 'object' && part in data) data = data[part]
    else return null
  }
  if (data && typeof data === 'object' && 'value' in data && Array.isArray(data.value)) return data.value
  if (Array.isArray(data)) return data
  return data
}

// --- Public data getters ---
export async function getCategories() { return fetchData('/categories') }
export async function getProducts(filters = {}) {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.search) params.set('search', filters.search)
  const qs = params.toString()
  const apiResult = await tryApi(`/products${qs ? `?${qs}` : ''}`)
  if (apiResult) return apiResult
  const all = fromJson('/products') || []
  return all.filter(p => {
    if (filters.category && p.category !== filters.category) return false
    if (filters.search && !(p.name || '').toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })
}
export async function getProductById(id) { return (await tryApi(`/product/${id}`)) || (await getProducts()).find(p => p.id === id) || null }
export async function getBundles() { return fetchData('/bundles') }
export async function getBanners() { return fetchData('/banners') }
export async function getAnnouncements() { return fetchData('/announcements') }
export async function getFarmers() { return fetchData('/farmers') }
export async function getBusinessSettings() { return fetchData('/business-settings') || {} }
export async function getSiteAssets() { return fetchData('/site-assets') || {} }
