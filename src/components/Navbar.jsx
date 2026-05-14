import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const NAV_LINKS = [
  { href: '#hero-section', label: 'Home' },
  { href: '#home', label: 'Products' },
  { href: '#about', label: 'About Us' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <>
      <motion.nav
        className={`navbar-premium ${scrolled ? 'navbar-scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="navbar-inner">
          <div className="nav-brand-premium" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="nav-logo-glow">
              <img src="/logo.png" alt="Asmita Gruh Udhyog Logo" className="nav-logo-img-premium" />
            </div>
            <div className="nav-brand-text">
              <span className="brand-name-full">ASMITA GRUH UDHYOG</span>
              <span className="brand-name-short">ASMITA</span>
              <span className="brand-tagline">Premium Incense</span>
            </div>
          </div>

          {/* Desktop Links */}
          <ul className="nav-links-premium desktop-nav">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                >
                  {link.label}
                </a>
              </li>
            ))}
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

          <div className="nav-actions-premium">
            {/* Auth Button */}
            {user ? (
              <motion.div
                className="nav-avatar-premium"
                onClick={() => setIsAuthOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </motion.div>
            ) : (
              <motion.button
                className="nav-login-premium"
                onClick={() => setIsAuthOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User size={16} />
                <span>Login</span>
              </motion.button>
            )}

            {/* Cart Button */}
            <motion.button
              className="nav-cart-premium"
              onClick={() => setIsCartOpen(true)}
              id="open-cart-btn"
              aria-label="Open cart"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart size={20} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="nav-cart-badge-premium"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Hamburger Button (Mobile) */}
            <button
              className="hamburger-premium"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-menu-premium"
          >
            <div className="mobile-menu-inner">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="mobile-nav-link-premium"
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                >
                  {link.label}
                  <ChevronRight size={16} />
                </a>
              ))}
              <Link to="/track" className="mobile-nav-link-premium" onClick={() => setMenuOpen(false)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={16} /> Track Your Order
                </span>
                <ChevronRight size={16} />
              </Link>
              <div className="mobile-menu-divider-premium" />
              {user ? (
                <button
                  className="mobile-nav-link-premium"
                  onClick={() => { setIsAuthOpen(true); setMenuOpen(false); }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} /> Profile ({user.displayName || 'User'})
                  </span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className="mobile-nav-link-premium"
                  onClick={() => { setIsAuthOpen(true); setMenuOpen(false); }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} /> Login / Sign Up
                  </span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
