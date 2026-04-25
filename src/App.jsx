import React, { Suspense } from 'react';
// Build trigger for tracking page update
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const AdminLogin = React.lazy(() => import('./pages/admin/Login'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = React.lazy(() => import('./pages/admin/Orders'));
const AdminProducts = React.lazy(() => import('./pages/admin/Products'));

import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Home = () => (
  <div className="content-layer">
    <div id="home"><Products /></div>
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
                    <Routes>
                      <Route path="login" element={<AdminLogin />} />
                      <Route element={
                        <ProtectedRoute adminOnly>
                          <AdminLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="products" element={<AdminProducts />} />
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
              </Routes>
            </Suspense>

          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;
