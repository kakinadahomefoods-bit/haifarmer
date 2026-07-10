import { getProducts, getProductsBySlug, getCategories, getNewArrivals, searchProducts } from './dataProvider'

export async function fetchProducts(search = '', order = 'created_at.desc') {
  const products = search ? searchProducts(search) : getProducts()
  if (order) {
    const [field, dir] = order.split('.')
    products.sort((a, b) => {
      const aVal = a[field] ?? ''
      const bVal = b[field] ?? ''
      if (dir === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })
  }
  return products
}

export async function fetchProductBySlug(slug) {
  return getProductsBySlug(slug) || {}
}

export async function fetchCategories() {
  return getCategories()
}

export async function fetchNewArrivals() {
  return getNewArrivals()
}
