import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/helpers'

export default function Payment() {
  const navigate = useNavigate()
  const { totals, cartItems } = useCart()

  if (!cartItems.length) {
    navigate('/checkout')
    return null
  }

  const handlePayment = async () => {
    // In a real app, this would integrate with Razorpay
    navigate('/orders')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Payment</h1>
        <div className="space-y-4">
          <div className="flex justify-between text-slate-700">
            <span>Amount to pay</span>
            <span className="text-xl font-bold text-slate-900">{formatPrice(totals?.finalTotal || 0)}</span>
          </div>
          <button
            onClick={handlePayment}
            className="w-full rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition shadow-md"
          >
            Pay {formatPrice(totals?.finalTotal || 0)}
          </button>
        </div>
      </div>
    </div>
  )
}
