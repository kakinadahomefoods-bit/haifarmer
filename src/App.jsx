import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileBottomNav from './components/MobileBottomNav'
import { ProtectedRoute } from './components/ProtectedRoute'
import Home from './pages/Home'

const About = lazy(() => import('./pages/About'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Bundles = lazy(() => import('./pages/Bundles'))
const BundleDetail = lazy(() => import('./pages/BundleDetail'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Payment = lazy(() => import('./pages/Payment'))
const Account = lazy(() => import('./pages/Account'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Farmers = lazy(() => import('./pages/Farmers'))
const FarmerPage = lazy(() => import('./pages/FarmerPage'))

// Admin
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'))
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'))
const AdminCategories = lazy(() => import('./admin/pages/Categories'))
const AdminProducts = lazy(() => import('./admin/pages/Products'))
const AdminCombos = lazy(() => import('./admin/pages/Combos'))
const AdminCoupons = lazy(() => import('./admin/pages/IndividualCoupons'))
const AdminBatchCoupons = lazy(() => import('./admin/pages/BatchCoupons'))
const AdminOrders = lazy(() => import('./admin/pages/Orders'))
const AdminCustomers = lazy(() => import('./admin/pages/Customers'))
const AdminBanners = lazy(() => import('./admin/pages/Banners'))
const AdminAnnouncements = lazy(() => import('./admin/pages/Announcements'))
const AdminDelivery = lazy(() => import('./admin/pages/Delivery'))
const AdminPayment = lazy(() => import('./admin/pages/Payment'))
const AdminFarmers = lazy(() => import('./admin/pages/Farmers'))
const AdminQR = lazy(() => import('./admin/pages/QRCodes'))
const AdminWebsite = lazy(() => import('./admin/pages/Website'))
const AdminAuditLogs = lazy(() => import('./admin/pages/AuditLogs'))

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-slate-400">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/farmers" element={<Farmers />} />
            <Route path="/farmer" element={<FarmerPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/combos" element={<Bundles />} />
            <Route path="/combos/:id" element={<BundleDetail />} />
            <Route path="/cart" element={<Navigate to="/checkout" replace />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Account initialTab="orders" /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account initialTab="account" /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="combos" element={<AdminCombos />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="coupons/batch" element={<AdminBatchCoupons />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="delivery" element={<AdminDelivery />} />
              <Route path="payment" element={<AdminPayment />} />
              <Route path="farmers" element={<AdminFarmers />} />
              <Route path="qr" element={<AdminQR />} />
              <Route path="website" element={<AdminWebsite />} />
              <Route path="audit" element={<AdminAuditLogs />} />
            </Route>

            <Route path="*" element={
              <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-slate-900">404</h1>
                  <p className="mt-2 text-slate-600">Page not found</p>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </div>
  )
}
