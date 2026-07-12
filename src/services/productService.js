import { getProducts, getProductById, getCategories } from './dataProvider'

export async function fetchProducts(search = '', order = '-createdAt') {
  const products = await getProducts(search ? { search } : {})
  if (order) {
    const dir = order.startsWith('-') ? -1 : 1
    const field = order.replace(/^-/, '')
    products.sort((a, b) => {
      const aVal = a[field] ?? ''
      const bVal = b[field] ?? ''
      if (dir === -1) return aVal < bVal ? 1 : -1
      return aVal > bVal ? 1 : -1
    })
  }
  return products
}

export async function fetchProductBySlug(slug) {
  const all = await getProducts()
  return all.find(p => p.slug === slug || p.id === slug) || {}
}

export async function fetchProductById(id) {
  return getProductById(id)
}

export async function fetchNewArrivals() {
  const all = await getProducts()
  return all.filter(p => p.is_new_arrival).slice(0, 10)
}

export async function fetchCategories() {
  return getCategories()
}
