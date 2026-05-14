import React, { Suspense } from 'react';
// Build trigger: Forcing deployment of branding updates (Asmita Gruh Udhyog)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
const Scene = React.lazy(() => import('./components/Scene'));
const Navbar = React.lazy(() => import('./components/Navbar'));
const Hero = React.lazy(() => import('./components/Hero'));
const Products = React.lazy(() => import('./components/Products'));
const TrustSection = React.lazy(() => import('./components/TrustSection'));
const FAQ = React.lazy(() => import('./components/FAQ'));
const Reviews = React.lazy(() => import('./components/Reviews'));
const About = React.lazy(() => import('./components/About'));
const Contact = React.lazy(() => import('./components/Contact'));
const Footer = React.lazy(() => import('./components/Footer'));
const CartDrawer = React.lazy(() => import('./components/CartDrawer'));
const CheckoutModal = React.lazy(() => import('./components/CheckoutModal'));
const OrderTracking = React.lazy(() => import('./components/OrderTracking'));
const WhatsAppFloat = React.lazy(() => import('./components/WhatsAppFloat'));

const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const AdminLogin = React.lazy(() => import('./pages/admin/Login'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = React.lazy(() => import('./pages/admin/Orders'));
const AdminProducts = React.lazy(() => import('./pages/admin/Products'));
const AdminInventory = React.lazy(() => import('./pages/admin/Inventory'));
const AdminAnalytics = React.lazy(() => import('./pages/admin/Analytics'));
const AdminProductEdit = React.lazy(() => import('./pages/admin/ProductEdit'));
const AdminCustomers = React.lazy(() => import('./pages/admin/Customers'));
const AdminCoupons = React.lazy(() => import('./pages/admin/Coupons'));
const AdminCMS = React.lazy(() => import('./pages/admin/CMS'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));
const AdminReports = React.lazy(() => import('./pages/admin/Reports'));
const AdminSecurity = React.lazy(() => import('./pages/admin/Security'));


import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Home = () => (
  <div className="content-layer">
    <Hero />
    <div id="home"><Products /></div>
    <TrustSection />
    <div id="products"><FAQ /></div>
    <div id="reviews"><Reviews /></div>
    <div id="about"><About /></div>
    <div id="contact"><Contact /></div>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <Suspense fallback={null}>
              <Scene />
            </Suspense>

            <Suspense fallback={
              <div className="premium-loader">
                <div className="loader-inner">
                  <Loader2 className="animate-spin" size={48} color="#d4af37" />
                  <span>Loading experience...</span>
                </div>
              </div>
            }>
              <Routes>
                {/* Admin Routes wrapped to stay above background */}
                <Route path="/admin/*" element={
                  <div style={{ position: 'relative', zIndex: 100 }}>
                    <Routes>
                      <Route path="login" element={<AdminLogin />} />
                      <Route element={
                        <ProtectedRoute adminOnly>
                          <AdminLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="inventory" element={<AdminInventory />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="products/new" element={<AdminProductEdit />} />
                        <Route path="products/edit/:id" element={<AdminProductEdit />} />
                        <Route path="customers" element={<AdminCustomers />} />
                        <Route path="coupons" element={<AdminCoupons />} />
                        <Route path="cms" element={<AdminCMS />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="security" element={<AdminSecurity />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                      </Route>
                    </Routes>
                  </div>
                } />

                {/* Public Routes */}
                <Route path="/" element={
                  <>
                    <Navbar />
                    <Home />
                    {/* Global overlays */}
                    <CartDrawer />
                    <CheckoutModal />
                    <WhatsAppFloat />
                  </>
                } />
                
                <Route path="/track" element={
                  <>
                    <Navbar />
                    <div className="content-layer">
                      <OrderTracking />
                      <Footer />
                    </div>
                    {/* Global overlays */}
                    <CartDrawer />
                    <CheckoutModal />
                    <WhatsAppFloat />
                  </>
                } />
              </Routes>
            </Suspense>

          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;
