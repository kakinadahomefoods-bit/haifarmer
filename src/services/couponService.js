import { publicApi } from './api'

export async function validateCoupon(code, orderTotal) {
  return publicApi.post('/coupon/validate', { code, orderTotal })
}
