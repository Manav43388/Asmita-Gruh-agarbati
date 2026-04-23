import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <nav className="navbar glass-panel" style={{ margin: '1rem 2rem', border: 'none' }}>
      <div className="nav-brand">Asmita Gruh Udhyog</div>
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#products">Products</a></li>
        <li><a href="#about">About Us</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <button
        className="nav-cart-btn"
        onClick={() => setIsCartOpen(true)}
        id="open-cart-btn"
        aria-label="Open cart"
      >
        <ShoppingCart size={22} />
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="nav-cart-badge"
            >
              {totalItems}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </nav>
  );
}
