import { getFarmers } from './dataProvider'

export async function fetchFarmers() {
  return getFarmers()
}
