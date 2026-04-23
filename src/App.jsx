import React, { Suspense } from 'react';
import Scene from './components/Scene';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import { CartProvider } from './context/CartContext';
import './index.css';

function App() {
  return (
    <CartProvider>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>

      <div className="content-layer">
        <Navbar />
        <Hero />
        <Products />
        <About />
        <Contact />
        <Footer />
      </div>

      {/* Global overlays */}
      <CartDrawer />
      <CheckoutModal />
    </CartProvider>
  );
}

export default App;
