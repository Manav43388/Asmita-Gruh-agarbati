import React, { Suspense } from 'react';
// Build trigger for tracking page update
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Scene from './components/Scene';
import Navbar from './components/Navbar';
import Products from './components/Products';
import FAQ from './components/FAQ';
import Reviews from './components/Reviews';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTracking from './components/OrderTracking';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import './index.css';

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
            <Suspense fallback={null}>
              <Scene />
            </Suspense>

            <Navbar />

            <div className="content-layer">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/track" element={
                  <>
                    <OrderTracking />
                    <Footer />
                  </>
                } />
              </Routes>
            </div>

            {/* Global overlays */}
            <CartDrawer />
            <CheckoutModal />
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
