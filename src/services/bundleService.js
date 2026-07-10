import { getBundles, getBundleById, getComboBundles } from './dataProvider'

export async function fetchBundles() {
  return getBundles()
}

export async function fetchBundleById(id) {
  return getBundleById(id)
}

export async function fetchComboBundles() {
  return getComboBundles()
}
