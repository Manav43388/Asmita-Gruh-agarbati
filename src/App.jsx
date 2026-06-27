import React, { Suspense, useState, useEffect } from 'react';
// Build trigger: Forcing deployment of branding updates (Asmita Gruh Udhyog)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SEO from './components/SEO';
import { OrganizationSchema, WebSiteSchema, LocalBusinessSchema, BreadcrumbSchema } from './components/StructuredData';

// ─── PERFORMANCE: Lazy-load ALL heavy components ───
// React.lazy + Suspense ensures these chunks are only downloaded
// when the component is first rendered, dramatically reducing
// the initial JavaScript payload for faster LCP.
const Scene = React.lazy(() => import('./components/Scene'));
const Navbar = React.lazy(() => import('./components/Navbar'));
const Products = React.lazy(() => import('./components/Products'));
const FAQ = React.lazy(() => import('./components/FAQ'));
const Reviews = React.lazy(() => import('./components/Reviews'));
const About = React.lazy(() => import('./components/About'));
const Contact = React.lazy(() => import('./components/Contact'));
const Footer = React.lazy(() => import('./components/Footer'));
const CartDrawer = React.lazy(() => import('./components/CartDrawer'));
const CheckoutModal = React.lazy(() => import('./components/CheckoutModal'));
const OrderTracking = React.lazy(() => import('./components/OrderTracking'));
const PaymentSuccess = React.lazy(() => import('./components/PaymentSuccess'));
const PaymentFailed = React.lazy(() => import('./components/PaymentFailed'));
const WishlistPage = React.lazy(() => import('./components/WishlistPage'));
const ContactPage = React.lazy(() => import('./components/ContactPage'));

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
const AdminInquiries = React.lazy(() => import('./pages/admin/Inquiries'));


import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { ProductsProvider } from './context/ProductsContext';
import { WishlistProvider } from './context/WishlistContext';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// ─── PERFORMANCE: Detect if device can handle WebGL 3D scene ───
// Mobile devices with low-end GPUs get destroyed by Three.js,
// causing jank, battery drain, and terrible PageSpeed scores.
// We skip the 3D scene entirely on mobile for a massive LCP win.
function useCanRender3D() {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    // Skip 3D on mobile/tablet (screen width < 1024px)
    const isLargeScreen = window.innerWidth >= 1024;

    // Check for WebGL support
    let hasWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = !!(
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      );
    } catch (e) {
      hasWebGL = false;
    }

    // Check for reduced motion preference (accessibility)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setCanRender(isLargeScreen && hasWebGL && !prefersReducedMotion);
  }, []);

  return canRender;
}

const Home = () => (
  <div className="content-layer">
    <SEO 
      title="Buy Premium Agarbatti & Pooja Products Online" 
      description="Asmita Gruh Udhyog offers premium handcrafted agarbatti, pooja products, and long-lasting fragrances for homes, temples, retailers, and wholesale buyers across India."
      canonicalUrl="/"
      keywords="Premium Agarbatti, Incense Sticks, Pooja Products, Dhoop, Wholesale Agarbatti, Asmita Gruh Udhyog"
    />
    <OrganizationSchema />
    <WebSiteSchema />
    <LocalBusinessSchema />
    <div id="home"><Products /></div>
    <div id="products"><FAQ /></div>
    <div id="reviews"><Reviews /></div>
    <div id="about"><About /></div>
    <div id="contact"><Contact /></div>
    <Footer />
  </div>
);

function App() {
  const canRender3D = useCanRender3D();

  // ─── PERFORMANCE: Remove the initial loader once React hydrates ───
  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.transition = 'opacity 0.3s ease';
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <ProductsProvider>
              <WishlistProvider>
                <Toaster position="top-right" />

                {/* ─── 3D SCENE: Only rendered on capable desktop devices ─── */}
                {canRender3D && (
                  <Suspense fallback={null}>
                    <Scene />
                  </Suspense>
                )}

                <Suspense fallback={
                  <div className="admin-page-container">
                    <div className="admin-stat-icon" style={{ background: 'transparent' }}>
                      <Loader2 className="animate-spin" size={48} color="#d4af37" />
                    </div>
                  </div>
                }>
                  <Routes>
                    {/* Admin Routes wrapped to stay above background */}
                    <Route path="/admin/*" element={
                      <div style={{ position: 'relative', zIndex: 100 }}>
                        <SEO title="Admin Panel" description="Secure Admin Dashboard" noindex={true} />
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
                            <Route path="inquiries" element={<AdminInquiries />} />
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
                        <div className="content-layer">
                          <Home />
                        </div>
                        {/* Global overlays */}
                        <CartDrawer />
                        <CheckoutModal />
                      </>
                    } />
                    
                    <Route path="/track" element={
                      <>
                        <SEO title="Track Your Order" description="Easily track your Asmita Gruh Udhyog order status online. Enter your order details to get real-time shipping updates for your premium agarbatti and pooja products." canonicalUrl="/track" />
                        <BreadcrumbSchema items={[{ name: 'Home', path: '/' }, { name: 'Track Order', path: '/track' }]} />
                        <Navbar />
                        <div className="content-layer">
                          <OrderTracking />
                          <Footer />
                        </div>
                        {/* Global overlays */}
                        <CartDrawer />
                        <CheckoutModal />
                      </>
                    } />

                    <Route path="/wishlist" element={
                      <>
                        <SEO title="Your Wishlist" description="Save your favorite Asmita Gruh Udhyog incense sticks, dhoop, and spiritual products to your wishlist. Shop premium fragrances later for a divine home experience." canonicalUrl="/wishlist" />
                        <BreadcrumbSchema items={[{ name: 'Home', path: '/' }, { name: 'Wishlist', path: '/wishlist' }]} />
                        <Navbar />
                        <div className="content-layer">
                          <WishlistPage />
                          <Footer />
                        </div>
                        <CartDrawer />
                        <CheckoutModal />
                      </>
                    } />

                    <Route path="/contact" element={
                      <>
                        <SEO title="Contact Us" description="Contact Asmita Gruh Udhyog for retail, wholesale, or bulk orders of premium agarbatti. Reach out to us for inquiries regarding our natural pooja products today." canonicalUrl="/contact" />
                        <BreadcrumbSchema items={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />
                        <Navbar />
                        <div className="content-layer">
                          <ContactPage />
                          <Footer />
                        </div>
                        <CartDrawer />
                        <CheckoutModal />
                      </>
                    } />

                    <Route path="/payment-success" element={
                      <>
                        <SEO title="Payment Successful" description="Your payment was successful." noindex={true} />
                        <Navbar />
                        <div className="content-layer">
                          <PaymentSuccess />
                          <Footer />
                        </div>
                      </>
                    } />

                    <Route path="/payment-failed" element={
                      <>
                        <SEO title="Payment Failed" description="There was an issue processing your payment." noindex={true} />
                        <Navbar />
                        <div className="content-layer">
                          <PaymentFailed />
                          <Footer />
                        </div>
                      </>
                    } />
                  </Routes>
                </Suspense>

              </WishlistProvider>
            </ProductsProvider>
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;
