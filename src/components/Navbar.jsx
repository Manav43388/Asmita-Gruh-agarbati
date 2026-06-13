import React, { useState } from 'react';
import { ShoppingCart, Menu, X, User, Search, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import AuthModal from './AuthModal';
import SearchBar from './SearchBar';
import ProductModal from './ProductModal';
import { useProducts } from '../context/ProductsContext';

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#products', label: 'Products' },
  { href: '#about', label: 'About Us' },
];

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();
  const { products } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  return (
    <>
      <nav className="navbar glass-panel" style={{ border: 'none' }}>
        <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Asmita Gruh Udhyog Logo" className="nav-logo-img" width="48" height="48" fetchPriority="high" />
          <span className="brand-full">ASMITA GRUH UDHYOG</span>
          <span className="brand-short">ASMITA</span>
        </div>

        {/* Desktop Links */}
        <ul className="nav-links desktop-nav">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a href={link.href} onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active-link' : ''}>
              Contact
            </Link>
          </li>
          <li>
            <Link to="/track" className={location.pathname === '/track' ? 'active-link' : ''}>
              Track Order
            </Link>
          </li>
          {user?.isAdmin && (
            <li>
              <Link to="/admin/dashboard" className="admin-link-nav">
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          {/* Search */}
          <SearchBar onProductSelect={handleProductSelect} />

          {/* Auth Button */}
          {user ? (
            <div className="nav-user-avatar" onClick={() => setIsAuthOpen(true)}>
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          ) : (
            <button className="nav-login-btn" onClick={() => setIsAuthOpen(true)}>
              <User size={18} />
              <span>Login</span>
            </button>
          )}

          {/* Wishlist Button */}
          <button
            className="nav-wishlist-btn"
            onClick={() => navigate('/wishlist')}
            aria-label="Open wishlist"
          >
            <Heart size={20} />
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span
                  key="wishlist-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="nav-wishlist-badge"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Cart Button */}
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

          {/* Hamburger Button (Mobile) */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mobile-menu glass-panel"
          >
            <div className="mobile-menu-links">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="mobile-nav-link"
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                >
                  {link.label}
                </a>
              ))}
              <Link to="/contact" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                📞 Contact Us
              </Link>
              <Link to="/wishlist" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                ❤️ Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <Link to="/track" className="mobile-nav-link track-link" onClick={() => setMenuOpen(false)}>
                <Search size={18} /> Track Your Order
              </Link>
              <div className="mobile-menu-divider" />
              {user ? (
                <button 
                  className="mobile-nav-link profile-link" 
                  onClick={() => { setIsAuthOpen(true); setMenuOpen(false); }}
                >
                  <User size={18} /> Profile ({user.displayName || 'User'})
                </button>
              ) : (
                <button 
                  className="mobile-nav-link login-link" 
                  onClick={() => { setIsAuthOpen(true); setMenuOpen(false); }}
                >
                  <User size={18} /> Login / Sign Up
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Product Modal from Search */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
