import { getSiteSettings, getBannerLinks } from './dataProvider'

export async function fetchSiteAssets() {
  return getSiteSettings()
}

export async function fetchBannerLinks() {
  return getBannerLinks()
}
