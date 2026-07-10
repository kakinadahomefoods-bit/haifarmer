import rawData from './supabase-data.json'

const SUPABASE_STORAGE = 'https://hnilmlhyqcgsbfbguuuz.supabase.co/storage/v1/object/public/'

function localizeUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (!url.startsWith(SUPABASE_STORAGE)) return url
  const path = url.replace(SUPABASE_STORAGE, '')
  if (path.startsWith('product-images/products/')) return `/images/products/${path.split('/').pop()}`
  if (path.startsWith('product-images/categories/')) return `/images/categories/${path.split('/').pop()}`
  if (path.startsWith('bundle-images/bundles/')) return `/images/bundles/${decodeURIComponent(path.split('/').pop())}`
  if (path.startsWith('farmers/images/')) return `/images/farmers/${path.split('/').pop()}`
  if (path.startsWith('site-assets/')) {
    const filename = path.split('/').pop()
    if (path.includes('/about/')) return `/images/about/${filename}`
    return `/images/banners/${filename}`
  }
  return url
}

function walkAndLocalize(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(walkAndLocalize)
  const result = {}
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string' && (key.includes('url') || key.includes('image') || key.includes('icon'))) {
      result[key] = localizeUrl(val)
    } else if (typeof val === 'object' && val !== null) {
      result[key] = walkAndLocalize(val)
    } else {
      result[key] = val
    }
  }
  return result
}

function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return product
  const normalized = walkAndLocalize(product)
  if (normalized.product_variants) {
    normalized.variants = normalized.product_variants
    delete normalized.product_variants
  }
  return normalized
}

const data = walkAndLocalize(rawData)

function extract(key) {
  const entry = data[key]
  if (entry && Array.isArray(entry.value)) return entry.value
  if (Array.isArray(entry)) return entry
  return []
}
function extractSingle(key) {
  const arr = extract(key)
  return arr.length > 0 ? arr[0] : {}
}

const rawProducts = extract('products')
const rawBundles = extract('bundles')
const farmers = extract('farmers')
const categories = extract('categories')
const siteSettings = extractSingle('site_settings')

const products = rawProducts.map(normalizeProduct)
const bundles = rawBundles.map(b => {
  if (!b || typeof b !== 'object') return b
  const nb = walkAndLocalize(b)
  if (nb.bundle_items) {
    nb.bundle_items = nb.bundle_items.map(item => {
      if (item.product) item.product = normalizeProduct(item.product)
      return item
    })
  }
  return nb
})

export function getProducts() { return products }
export function getProductById(id) { return products.find(p => p.id === id) }
export function getProductsBySlug(slug) {
  return products.find(p => p.name.toLowerCase().trim() === slug.replace(/-/g, ' ').trim().toLowerCase())
}
export function searchProducts(query) {
  if (!query) return products
  const q = query.toLowerCase()
  return products.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
}
export function getNewArrivals() { return products.filter(p => p.is_new_arrival) }
export function getCategories() { return categories }
export function getBundles() { return bundles }
export function getComboBundles() { return bundles.filter(b => b.is_combo) }
export function getBundleById(id) { return bundles.find(b => b.id === id) }
export function getFarmers() { return farmers }
export function getSiteSettings() { return siteSettings }
export function getBannerLinks() { return [] }

export function calculateBundlePrice(bundle) {
  if (!bundle || !bundle.bundle_items) return bundle.bundle_price || 0
  const total = bundle.bundle_items.reduce((sum, item) => {
    return sum + ((item.variant?.price || 0) * item.quantity)
  }, 0)
  const discount = bundle.bundle_discount_percent || 0
  return discount > 0 ? Math.round(total * (1 - discount / 100)) : total
}
