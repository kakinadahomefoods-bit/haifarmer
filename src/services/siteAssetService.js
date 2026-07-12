import { getBusinessSettings, getSiteAssets } from './dataProvider'

export async function fetchSiteAssets() {
  return getSiteAssets()
}

export async function fetchBannerLinks() {
  return getSiteAssets()
}
