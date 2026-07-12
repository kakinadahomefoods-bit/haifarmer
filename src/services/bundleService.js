import { getBundles } from './dataProvider'

export async function fetchBundles() {
  return getBundles()
}

export async function fetchBundleById(id) {
  const bundles = await getBundles()
  return bundles.find(b => b.id === id || b._id === id) || null
}

export async function fetchComboBundles() {
  const bundles = await getBundles()
  return bundles.filter(b => b.is_combo)
}
