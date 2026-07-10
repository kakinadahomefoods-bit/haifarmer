export function formatPrice(price) {
  if (price == null || isNaN(price)) return '₹0'
  return '₹' + Math.round(price).toLocaleString('en-IN')
}

export function slugify(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getDiscountedPrice(basePrice, discountPercent) {
  const price = Number(basePrice) || 0
  const discount = Number(discountPercent) || 0
  return Math.round(price * (1 - discount / 100))
}

export function getBundleDiscountedPrice(basePrice, discountPercent) {
  return getDiscountedPrice(basePrice, discountPercent)
}

export const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23f1f5f9'/%3E%3Ctext x='320' y='200' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-size='20' font-family='sans-serif'%3EImage not available%3C/text%3E%3C/svg%3E"
